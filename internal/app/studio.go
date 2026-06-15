package app

import (
	"fmt"
	"os"
	"sync"

	"f90x_eeprom_studio/internal/i18n"
	"f90x_eeprom_studio/internal/protocol"

	"go.bug.st/serial"
)

// LogFn receives timestamped lines for UI or Wails events.
type LogFn func(string)

// Studio is the EEPROM Studio controller (connect → dump → edit 0x169 only).
type Studio struct {
	mu        sync.Mutex // eeprom mirror, session pointer, port, hasDump, locale, log
	sessionMu sync.Mutex // one serial session operation at a time
	svc       *Service
	eeprom    [protocol.EepromSize]byte
	hasDump   bool
	port      string
	locale    i18n.Locale
	log       LogFn
}

func NewStudio(log LogFn) *Studio {
	if log == nil {
		log = func(string) {}
	}
	return &Studio{log: log, locale: i18n.Zh}
}

func (s *Studio) SetLog(log LogFn) {
	s.mu.Lock()
	s.log = log
	s.mu.Unlock()
}

func (s *Studio) logLine(line string) {
	s.mu.Lock()
	fn := s.log
	s.mu.Unlock()
	if fn != nil {
		fn(line)
	}
}

func (s *Studio) getLocale() i18n.Locale {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.locale == "" {
		return i18n.Zh
	}
	return s.locale
}

func (s *Studio) SetLocale(loc string) {
	s.mu.Lock()
	s.locale = i18n.Parse(loc)
	s.mu.Unlock()
}

func (s *Studio) Locale() i18n.Locale {
	return s.getLocale()
}

func (s *Studio) logKey(key string, args ...any) {
	s.logLine(i18n.Format(s.getLocale(), key, args...))
}

func (s *Studio) errKey(key string, args ...any) error {
	return i18n.Err(s.getLocale(), key, args...)
}

func (s *Studio) newService() *Service {
	return New(s.logLine, s.getLocale)
}

// closeActiveService clears the session pointer and closes the link without logging.
func (s *Studio) closeActiveService() bool {
	s.mu.Lock()
	svc := s.svc
	s.svc = nil
	s.mu.Unlock()
	if svc == nil {
		return false
	}
	svc.Close()
	return true
}

func (s *Studio) clearMirrorLocked() {
	s.hasDump = false
	s.eeprom = [protocol.EepromSize]byte{}
}

func (s *Studio) ListPorts() []string {
	ports, err := serial.GetPortsList()
	if err != nil || len(ports) == 0 {
		return []string{"COM1", "COM2", "COM3"}
	}
	return ports
}

func (s *Studio) Connect(port string) error {
	if port == "" {
		return s.errKey("err.select_port")
	}
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()

	if s.closeActiveService() {
		s.logKey("log.disconnected")
	}
	svc := s.newService()
	if err := svc.Connect(port); err != nil {
		s.mu.Lock()
		s.port = port
		s.clearMirrorLocked()
		s.mu.Unlock()
		return err
	}
	s.mu.Lock()
	s.svc = svc
	s.port = port
	s.clearMirrorLocked()
	s.mu.Unlock()
	return nil
}

func (s *Studio) Disconnect() {
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()
	if s.closeActiveService() {
		s.logKey("log.disconnected")
	}
}

func (s *Studio) Connected() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.svc != nil && s.svc.Connected()
}

func (s *Studio) Port() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.port
}

func (s *Studio) HasDump() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.hasDump
}

// Dump reads 512B while connected, then disconnects.
func (s *Studio) Dump() error {
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()

	s.mu.Lock()
	svc := s.svc
	s.mu.Unlock()
	if svc == nil || !svc.Connected() {
		return s.errKey("err.connect_first")
	}
	defer func() {
		if s.closeActiveService() {
			s.logKey("log.disconnected")
		}
	}()

	s.logKey("log.read_eeprom")
	data, err := svc.ReadEeprom(protocol.EepromSize, nil)
	if err != nil {
		return err
	}
	s.mu.Lock()
	copy(s.eeprom[:], data)
	s.hasDump = true
	s.mu.Unlock()
	s.logKey("log.dump_done")
	s.logKey("log.post_dump_hint")
	return nil
}

// RefreshDump reconnects, reads 512B into the local mirror, and disconnects.
// Used from MODIFY / Advanced to refresh HxD view without a save dialog.
func (s *Studio) RefreshDump() error {
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()

	s.mu.Lock()
	port := s.port
	s.mu.Unlock()
	if port == "" {
		return s.errKey("err.no_port_record")
	}

	s.logKey("log.refresh_dump", port)
	s.closeActiveService()

	svc := s.newService()
	if err := svc.Connect(port); err != nil {
		return err
	}
	defer func() {
		svc.Close()
		s.logKey("log.disconnected")
	}()

	s.logKey("log.read_eeprom")
	data, err := svc.ReadEeprom(protocol.EepromSize, nil)
	if err != nil {
		return err
	}
	s.mu.Lock()
	copy(s.eeprom[:], data)
	s.hasDump = true
	s.mu.Unlock()
	s.logKey("log.refresh_dump_done")
	return nil
}

// SaveDumpTo writes the local 512B EEPROM mirror to path.
func (s *Studio) SaveDumpTo(path string) error {
	if path == "" {
		return s.errKey("err.no_save_path")
	}
	s.mu.Lock()
	if !s.hasDump {
		s.mu.Unlock()
		return s.errKey("err.dump_first")
	}
	data := s.eeprom
	s.mu.Unlock()
	if err := os.WriteFile(path, data[:], 0644); err != nil {
		return s.errKey("err.save_failed", err)
	}
	s.logKey("log.saved", path)
	return nil
}

func (s *Studio) LeaderLength() (int, error) {
	s.mu.Lock()
	hasDump := s.hasDump
	val := int(s.eeprom[LeaderAddr])
	s.mu.Unlock()
	if !hasDump {
		return LeaderMin, s.errKey("err.dump_first")
	}
	return val, nil
}

func (s *Studio) ChecksumOK() bool {
	s.mu.Lock()
	defer s.mu.Unlock()
	ok, _ := protocol.VerifyRegion(s.eeprom[:])
	return ok
}

// WriteLeader connects fresh, writes 0x169 (6–31), updates checksum, disconnects.
func (s *Studio) WriteLeader(dec int) error {
	if !ValidLeader(dec) {
		return s.errKey("err.leader_range", LeaderMin, LeaderMax)
	}
	s.sessionMu.Lock()
	defer s.sessionMu.Unlock()

	s.mu.Lock()
	port := s.port
	hasDump := s.hasDump
	s.mu.Unlock()
	if port == "" {
		return s.errKey("err.no_port_record")
	}
	if !hasDump {
		return s.errKey("err.dump_first")
	}

	s.logKey("log.write_reconnect", port)
	s.closeActiveService()

	svc := s.newService()
	if err := svc.Connect(port); err != nil {
		return err
	}
	var writeErr error
	var febPhase febRecoveryPhase
	defer func() {
		if writeErr != nil {
			s.logWriteRecoveryHintIf(writeErr, febPhase)
		}
		svc.Close()
		if writeErr == nil {
			s.logKey("log.write_done_disconnect")
		} else {
			s.logKey("log.write_abort_disconnect")
		}
	}()

	byteVal := byte(dec)
	s.logKey("log.write_addr", LeaderAddr, byteVal)
	if err := svc.WriteRecords([]WriteRecord{{Addr: LeaderAddr, Payload: []byte{byteVal}}}); err != nil {
		writeErr = err
		febPhase = febRecoveryLeader
		return err
	}

	s.mu.Lock()
	s.eeprom[LeaderAddr] = byteVal
	s.mu.Unlock()

	if err := s.followUpChecksum(svc, byteVal, true); err != nil {
		writeErr = err
		febPhase = febRecoveryChecksum
		return err
	}
	s.logKey("log.leader_written")
	return nil
}

func (s *Studio) followUpChecksum(svc *Service, dataExpected byte, dataReadOK bool) error {
	s.logKey("log.auto_checksum")
	if err := svc.EepromSettleBeforeChecksum(dataReadOK); err != nil {
		return fmt.Errorf("%s: %w", i18n.Format(s.getLocale(), "err.checksum_before"), err)
	}

	var ck byte
	if dataReadOK {
		s.mu.Lock()
		var err error
		ck, err = protocol.ChecksumByteForRegion(s.eeprom[:])
		s.mu.Unlock()
		if err != nil {
			return err
		}
	} else {
		prefix, err := svc.ReadEepromPrefix(protocol.ChecksumRegionBytes)
		if err != nil {
			return err
		}
		if prefix[LeaderAddr] != dataExpected {
			return s.errKey("err.readback_169_mismatch", dataExpected, prefix[LeaderAddr])
		}
		s.mu.Lock()
		copy(s.eeprom[:protocol.ChecksumRegionBytes], prefix)
		ck, err = protocol.ChecksumByteForRegion(s.eeprom[:])
		s.mu.Unlock()
		if err != nil {
			return err
		}
	}

	if err := svc.WriteChecksumAfterData(ck); err != nil {
		return err
	}
	s.mu.Lock()
	s.eeprom[protocol.ChecksumAddr] = ck
	ok, _ := protocol.VerifyRegion(s.eeprom[:])
	s.mu.Unlock()
	if !ok {
		return s.errKey("err.region_verify_failed")
	}
	s.logKey("log.checksum_updated", int(ck))
	return nil
}
