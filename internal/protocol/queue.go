package protocol

import (
	"bytes"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"go.bug.st/serial"
)

// ErrEepromQueueBusy means FEB3.5/FEB5.5 did not clear within queueTimeout.
var ErrEepromQueueBusy = errors.New("eeprom queue busy")

// ErrEepromQueueUnreadable means FEB3/FEB5 never returned valid data before deadline.
var ErrEepromQueueUnreadable = errors.New("eeprom queue status unreadable")

// QueueLogFn receives optional queue lines (timeouts only).
type QueueLogFn func(string)

func Commit(link *Link, eepromAddr int, payload []byte, persist bool) error {
	if len(payload) == 0 {
		return nil
	}
	var err error
	link.RunLocked(func(p serial.Port) {
		err = CommitLocked(p, link.CamAddrLocked(), eepromAddr, payload, persist, RAMQueueBuf, link.queueLogLocked())
	})
	return err
}

// CommitLocked runs the @2156 deferred EEPROM queue inside an existing port lock.
func CommitLocked(p serial.Port, camAddr byte, eepromAddr int, payload []byte, persist bool, ramBuf int, log QueueLogFn) error {
	if len(payload) == 0 {
		return nil
	}
	if ramBuf < 0 || ramBuf+len(payload) > 0xFF00 {
		return fmt.Errorf("RAM 缓冲区越界")
	}
	if err := writeAndVerifyRAM(p, camAddr, ramBuf, payload); err != nil {
		return err
	}
	if err := triggerNativeQueue(p, camAddr, eepromAddr, ramBuf, len(payload), log); err != nil {
		return err
	}
	if persist {
		return TriggerFe4eSave(p, camAddr, log)
	}
	return nil
}

func triggerNativeQueue(p serial.Port, camAddr byte, eepromAddr, ramAddr, length int, log QueueLogFn) error {
	if length <= 0 || length > 0xFFFF {
		return fmt.Errorf("队列长度无效")
	}
	if err := waitQueueIdle(p, camAddr, log); err != nil {
		return err
	}
	ln := []byte{byte(length & 0xFF), byte((length >> 8) & 0xFF)}
	if err := writeAndVerifyRAM(p, camAddr, 0xFE8A, ln); err != nil {
		return err
	}
	if err := writeAndVerifyRAM(p, camAddr, 0xFE8C, ln); err != nil {
		return err
	}
	if err := writeAndVerifyRAM(p, camAddr, 0xFE8E, []byte{byte(eepromAddr & 0xFF), byte((eepromAddr >> 8) & 0xFF)}); err != nil {
		return err
	}
	if err := writeAndVerifyRAM(p, camAddr, 0xFDF2, []byte{byte(ramAddr & 0xFF), byte((ramAddr >> 8) & 0xFF)}); err != nil {
		return err
	}
	fec8 := readRAM(p, camAddr, 0xFEC8, 1)
	if fec8 == nil {
		return fmt.Errorf("FEC8 read failed")
	}
	if err := writeAndVerifyRAM(p, camAddr, 0xFEC8, []byte{fec8[0] & 0xFE}); err != nil {
		return err
	}
	feb3 := readRAM(p, camAddr, 0xFEB3, 1)
	if feb3 == nil {
		return fmt.Errorf("FEB3 read failed")
	}
	if !writeRAM(p, camAddr, 0xFEB3, []byte{feb3[0]|QueueBit}) {
		return fmt.Errorf("FEB3.5 触发失败")
	}
	return waitQueueIdle(p, camAddr, log)
}

// TriggerFe4eSave writes FE4E=0x14 and waits for the queue to finish.
func TriggerFe4eSave(p serial.Port, camAddr byte, log QueueLogFn) error {
	if !writeRAM(p, camAddr, Fe4eSaveReg, []byte{Fe4eSaveVal}) {
		return fmt.Errorf("FE4E 写入失败")
	}
	time.Sleep(fe4eSaveDelay)
	if err := waitQueueIdle(p, camAddr, log); err != nil {
		return fmt.Errorf("FE4E 后: %w", err)
	}
	return nil
}

// waitQueueIdle polls FEB3/FEB5 until both .5 bits clear or queueTimeout elapses.
func waitQueueIdle(p serial.Port, camAddr byte, log QueueLogFn) error {
	deadline := time.Now().Add(queueTimeout)
	var lastB3, lastB5 int
	havePair := false
	for time.Now().Before(deadline) {
		b3 := readRAM(p, camAddr, 0xFEB3, 1)
		b5 := readRAM(p, camAddr, 0xFEB5, 1)
		if b3 != nil && b5 != nil {
			lastB3, lastB5 = int(b3[0]), int(b5[0])
			havePair = true
			if b3[0]&QueueBit == 0 && b5[0]&QueueBit == 0 {
				return nil
			}
		}
		time.Sleep(queuePollGap)
	}
	if !havePair {
		if log != nil {
			log("[FEB] 队列状态不可读 (NAK/超时)")
		}
		return fmt.Errorf("%w；请断开重连", ErrEepromQueueUnreadable)
	}
	if log != nil {
		log(fmt.Sprintf("[FEB] 队列超时 FEB3=0x%02X FEB5=0x%02X", lastB3, lastB5))
	}
	return fmt.Errorf("%w (FEB3=0x%02X, FEB5=0x%02X)", ErrEepromQueueBusy, lastB3, lastB5)
}

func writeAndVerifyRAM(p serial.Port, camAddr byte, memAddr int, data []byte) error {
	if !writeRAM(p, camAddr, memAddr, data) {
		return fmt.Errorf("RAM 0x%04X write: no ACK", memAddr)
	}
	rb := readRAM(p, camAddr, memAddr, len(data))
	if rb != nil && bytes.Equal(rb, data) {
		return nil
	}
	got := "null"
	if rb != nil {
		got = hex.EncodeToString(rb)
	}
	return fmt.Errorf("RAM 0x%04X verify failed, got %s", memAddr, got)
}

func readRAM(p serial.Port, camAddr byte, memAddr, length int) []byte {
	data, _ := xferRead(p, camAddr, SpaceRAM, memAddr, length, readCollectTO)
	return data
}

func writeRAM(p serial.Port, camAddr byte, memAddr int, data []byte) bool {
	for attempt := 0; attempt < ramWriteAckRetries; attempt++ {
		if attempt > 0 {
			time.Sleep(ramWriteAckRetryGap)
			drainRx(p, 60*time.Millisecond)
		} else {
			drainRx(p, 40*time.Millisecond)
		}
		if writeRAMOnce(p, camAddr, memAddr, data) {
			return true
		}
	}
	return false
}

func writeRAMOnce(p serial.Port, camAddr byte, memAddr int, data []byte) bool {
	var cmd bytes.Buffer
	cmd.WriteByte(0x01)
	cmd.WriteByte(camAddr)
	cmd.WriteByte(0x81)
	cmd.WriteByte(0x00)
	cmd.WriteByte(byte((memAddr >> 8) & 0xFF))
	cmd.WriteByte(byte(memAddr & 0xFF))
	cmd.WriteByte(0x00)
	cmd.WriteByte(byte(len(data)))
	cmd.WriteByte(0x02)
	cmd.Write(data)
	cmd.WriteByte(byte(Sum(data)))
	cmd.WriteByte(0x03)
	cmd.WriteByte(0x00)
	_, _ = p.Write(cmd.Bytes())
	return readAck(p)
}

func readAck(p serial.Port) bool {
	deadline := time.Now().Add(1500 * time.Millisecond)
	var buf []byte
	scratch := make([]byte, 64)
	for time.Now().Before(deadline) {
		n := readPort(p, scratch)
		if n > 0 {
			buf = append(buf, scratch[:n]...)
			if containsAck(buf) {
				return true
			}
			if len(buf) > 0 && buf[0] == 0x15 {
				return false
			}
		} else {
			time.Sleep(5 * time.Millisecond)
		}
	}
	return containsAck(buf)
}
