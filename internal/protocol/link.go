package protocol

import (
	"bytes"
	"fmt"
	"sync"
	"time"

	"go.bug.st/serial"
)

type Phase int

const (
	PhaseClosed Phase = iota
	PhaseSlow
	PhaseFast
)

type Link struct {
	mu         sync.Mutex
	port       serial.Port
	portName   string
	phase      Phase
	model      ModelKind
	camAddr    byte
	wakeupHint string
	queueLog   QueueLogFn
}

// SetQueueLog wires optional FEB/queue timing lines into the protocol layer.
func (l *Link) SetQueueLog(fn QueueLogFn) {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.queueLog = fn
}

func (l *Link) queueLogLocked() QueueLogFn {
	return l.queueLog
}

func (l *Link) IsOpen() bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.port != nil && l.phase != PhaseClosed
}

func (l *Link) FastActive() bool {
	l.mu.Lock()
	defer l.mu.Unlock()
	return l.phase == PhaseFast
}

func (l *Link) StatusLine() string {
	l.mu.Lock()
	defer l.mu.Unlock()
	wake := ""
	if l.wakeupHint != "" {
		wake = "，唤醒=" + l.wakeupHint
	}
	spd := "1200"
	if l.phase == PhaseFast {
		spd = "9600"
	}
	return fmt.Sprintf("%s @ %s，地址 0x%02X%s", ModelName(l.model), spd, l.camAddr, wake)
}

func (l *Link) Connect(portName string, fast bool) error {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.portName = portName
	return l.connectCoreLocked(fast)
}

func (l *Link) bootstrapAndFastLocked(fast bool) error {
	model, hint, err := BootstrapHandshake(l.port)
	l.wakeupHint = hint
	if err != nil {
		return err
	}
	if model != ModelF90XN90s {
		if model == ModelF90N90 {
			return &UnsupportedCameraError{Model: model, Addr: 0x10, Raw: "SIGNIN"}
		}
		return err
	}
	l.model = ModelF90XN90s
	l.camAddr = CamAddrF90X
	l.phase = PhaseSlow
	if fast {
		return l.startFastLocked()
	}
	return nil
}

func (l *Link) Close() {
	l.mu.Lock()
	defer l.mu.Unlock()
	l.disposePortLocked()
}

func (l *Link) RunLocked(fn func(serial.Port)) {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.port == nil {
		panic("串口未打开")
	}
	fn(l.port)
}

// WaitQueueIdle waits until FEB3.5 and FEB5.5 are clear (ROM @0946 before next IO).
func (l *Link) WaitQueueIdle() error {
	var err error
	l.RunLocked(func(p serial.Port) {
		err = waitQueueIdle(p, l.CamAddrLocked(), l.queueLogLocked())
	})
	return err
}

// EnsureFastLink mirrors C# PrepareFastIo: FD40 must return STX data; NAK/no response → EndFast+StartFast.
func (l *Link) EnsureFastLink() error {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.port == nil || l.phase == PhaseClosed {
		return fmt.Errorf("链接已关闭")
	}
	if l.phase != PhaseFast {
		if l.phase == PhaseSlow {
			return l.startFastLocked()
		}
		return fmt.Errorf("无法升 9600")
	}
	return l.ensureFastLinkLocked(false)
}

func (l *Link) ReadMemory(space byte, memAddr, length, retries int) ([]byte, error) {
	collectTO := readCollectTO
	if space == SpaceEEPROM {
		collectTO = readEepromCollect
	}
	return l.ReadMemoryWithTimeout(space, memAddr, length, retries, collectTO)
}

func (l *Link) ReadMemoryWithTimeout(space byte, memAddr, length, retries int, collectTO time.Duration) ([]byte, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	if l.phase != PhaseFast {
		return nil, fmt.Errorf("需要 9600 快链路")
	}
	if space == SpaceEEPROM && length != EepromChunk {
		return nil, nil
	}
	p := l.port
	var lastFail string
	for attempt := 0; attempt < retries; attempt++ {
		if attempt > 0 {
			time.Sleep(200 * time.Millisecond)
			if attempt == 1 {
				_ = l.ensureFastLinkLocked(false)
				p = l.port
			}
			drainRx(p, 150*time.Millisecond)
		}
		data, reason := xferRead(p, l.camAddr, space, memAddr, length, collectTO)
		if data != nil && len(data) == length {
			return data, nil
		}
		if reason != "" {
			lastFail = reason
		}
	}
	if lastFail != "" {
		return nil, fmt.Errorf("%s", lastFail)
	}
	return nil, fmt.Errorf("无有效 STX 响应")
}

func (l *Link) ensureFastLinkLocked(force bool) error {
	if l.port == nil || l.phase != PhaseFast {
		return fmt.Errorf("需要 9600 快链路")
	}
	if !force {
		drainRx(l.port, 100*time.Millisecond)
		if data, _ := xferRead(l.port, l.camAddr, SpaceRAM, PingRAMAddr, 1, readCollectTO); data != nil {
			return nil
		}
	}
	drainRx(l.port, 200*time.Millisecond)
	endFastSession(l.port)
	l.phase = PhaseSlow
	if err := l.startFastLocked(); err != nil {
		return l.connectCoreLocked(true)
	}
	time.Sleep(postRelinkSettle)
	if data, _ := xferRead(l.port, l.camAddr, SpaceRAM, PingRAMAddr, 1, readCollectTO); data != nil {
		return nil
	}
	// C# EnsureFastLink → ConnectCore: wake + S1000 + 87 05 when EOT relink is not enough.
	return l.connectCoreLocked(true)
}

// connectCoreLocked mirrors C# ConnectCore — full bootstrap (0x00 + S1000) then 9600.
func (l *Link) connectCoreLocked(fast bool) error {
	if l.portName == "" {
		return fmt.Errorf("串口名未设置")
	}
	l.disposePortLocked()
	p, err := openPort(l.portName, BaudSlow)
	if err != nil {
		return err
	}
	l.port = p
	flushBuffers(p)
	if err := l.bootstrapAndFastLocked(fast); err != nil {
		l.disposePortLocked()
		return err
	}
	return nil
}

// CamAddrLocked returns CamAddr while l.mu is already held (e.g. inside RunLocked).
func (l *Link) CamAddrLocked() byte {
	return l.camAddr
}

func (l *Link) startFastLocked() error {
	if l.phase == PhaseFast {
		return nil
	}
	if l.phase != PhaseSlow {
		return fmt.Errorf("当前阶段无法升 9600")
	}
	flushBuffers(l.port)
	if !upgradeBaud(l.port) {
		return fmt.Errorf("波特率升级失败")
	}
	if err := setBaud(l.port, BaudFast); err != nil {
		return err
	}
	time.Sleep(baudSwitchDelay)
	time.Sleep(fastLinkSettle)
	drainRx(l.port, 250*time.Millisecond)
	l.phase = PhaseFast
	return nil
}

func (l *Link) disposePortLocked() {
	if l.port == nil {
		return
	}
	func() {
		defer func() { recover() }()
		if l.phase == PhaseFast {
			endFastSession(l.port)
		} else if l.phase == PhaseSlow {
			_, _ = l.port.Write(EOT)
			time.Sleep(150 * time.Millisecond)
			drainRx(l.port, 200*time.Millisecond)
		}
	}()
	_ = l.port.Close()
	l.port = nil
	l.phase = PhaseClosed
}

func openPort(name string, baud int) (serial.Port, error) {
	mode := &serial.Mode{
		BaudRate: baud,
		DataBits: 8,
		Parity:   serial.NoParity,
		StopBits: serial.OneStopBit,
		InitialStatusBits: &serial.ModemOutputBits{
			DTR: false,
			RTS: false,
		},
	}
	p, err := serial.Open(name, mode)
	if err != nil {
		return nil, err
	}
	if err := configurePortLines(p); err != nil {
		_ = p.Close()
		return nil, err
	}
	return p, nil
}

func setBaud(p serial.Port, baud int) error {
	if err := p.SetMode(&serial.Mode{
		BaudRate: baud,
		DataBits: 8,
		Parity:   serial.NoParity,
		StopBits: serial.OneStopBit,
		InitialStatusBits: &serial.ModemOutputBits{
			DTR: false,
			RTS: false,
		},
	}); err != nil {
		return err
	}
	return configurePortLines(p)
}

// configurePortLines matches C# F90Link (DtrEnable/RtsEnable false) for MC-DC2 / body UART.
func configurePortLines(p serial.Port) error {
	if err := p.SetReadTimeout(ioReadTimeout); err != nil {
		return err
	}
	if err := p.SetDTR(false); err != nil {
		return err
	}
	return p.SetRTS(false)
}

func flushBuffers(p serial.Port) {
	_ = p.ResetInputBuffer()
	_ = p.ResetOutputBuffer()
}

func sendSignIn(p serial.Port) []byte {
	_, _ = p.Write(SigninCmd)
	time.Sleep(200 * time.Millisecond)
	var resp []byte
	deadline := time.Now().Add(2 * time.Second)
	scratch := make([]byte, 64)
	for time.Now().Before(deadline) {
		n := readPort(p, scratch)
		if n > 0 {
			resp = append(resp, scratch[:n]...)
			if len(resp) > 1 && resp[len(resp)-1] == 0x06 {
				break
			}
		} else {
			time.Sleep(10 * time.Millisecond)
		}
	}
	return resp
}

func upgradeBaud(p serial.Port) bool {
	_, _ = p.Write(BaudUpgradeF90X)
	time.Sleep(baudSwitchDelay)
	buf := make([]byte, 32)
	total := 0
	deadline := time.Now().Add(500 * time.Millisecond)
	scratch := make([]byte, 32)
	for time.Now().Before(deadline) && total < len(buf) {
		n := readPort(p, scratch)
		if n <= 0 {
			time.Sleep(10 * time.Millisecond)
			continue
		}
		if total+n > len(buf) {
			n = len(buf) - total
		}
		copy(buf[total:], scratch[:n])
		total += n
		if total >= 2 && containsAck(buf[:total]) {
			return true
		}
	}
	return total >= 2 && containsAck(buf[:total])
}

func endFastSession(p serial.Port) {
	drainRx(p, 50*time.Millisecond)
	_, _ = p.Write(EOT)
	time.Sleep(200 * time.Millisecond)
	scratch := make([]byte, 8)
	_ = readPort(p, scratch)
	drainRx(p, 100*time.Millisecond)
	_ = setBaud(p, BaudSlow)
	time.Sleep(100 * time.Millisecond)
}

func containsAck(data []byte) bool {
	for i := 0; i < len(data)-1; i++ {
		if data[i] == 0x06 && data[i+1] == 0x00 {
			return true
		}
	}
	return false
}

func xferRead(p serial.Port, camAddr, space byte, memAddr, length int, collectTO time.Duration) ([]byte, string) {
	// C# XferRead: DrainRx only — do not flush (would drop in-flight ACK/STX).
	drainRx(p, 60*time.Millisecond)
	cmd := []byte{
		0x01, camAddr, 0x80, space,
		byte((memAddr >> 8) & 0xFF), byte(memAddr & 0xFF),
		0x00, byte(length), 0x03,
	}
	_, _ = p.Write(cmd)
	time.Sleep(readPostDelay)
	return collectStxFrame(p, length, collectTO)
}

func collectStxFrame(p serial.Port, length int, timeout time.Duration) ([]byte, string) {
	var ms bytes.Buffer
	block := make([]byte, 256)
	scratch := make([]byte, 1)
	deadline := time.Now().Add(timeout)
	maxKeep := length + 64
	for time.Now().Before(deadline) {
		if n := readPort(p, block); n > 0 {
			ms.Write(block[:n])
		} else if n := readPort(p, scratch); n > 0 {
			ms.Write(scratch[:n])
		} else {
			time.Sleep(8 * time.Millisecond)
		}
		buf := trimLeadingRx(ms.Bytes())
		if stxNakResponse(buf) {
			return nil, "相机 NAK (0x80)"
		}
		if len(buf) >= length+3 {
			if data, ok := TryParseSTX(buf, length); ok {
				return data, ""
			}
		}
		if ms.Len() > maxKeep {
			trim := buf[len(buf)-maxKeep:]
			ms.Reset()
			ms.Write(trim)
		}
	}
	buf := trimLeadingRx(ms.Bytes())
	if data, ok := TryParseSTX(buf, length); ok {
		return data, ""
	}
	if stxNakResponse(buf) {
		return nil, "相机 NAK (0x80)"
	}
	return nil, "等待 STX 超时"
}

// stxNakResponse is true only when the camera NAKs (0x80) with no STX frame in the buffer.
func stxNakResponse(buf []byte) bool {
	if len(buf) < 1 || buf[0] != 0x80 {
		return false
	}
	return bytes.IndexByte(buf, 0x02) < 0
}
