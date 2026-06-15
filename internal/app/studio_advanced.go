package app

import (
	"fmt"

	"f90x_eeprom_studio/internal/hexfmt"
	"f90x_eeprom_studio/internal/i18n"
	"f90x_eeprom_studio/internal/protocol"
)

// ChecksumInfo is EEPROM checksum state from the local mirror (advanced panel).
type ChecksumInfo struct {
	HasDump  bool
	OK       bool
	Current  int // byte at 0x17F, -1 if unknown
	Expected int // computed for 0x000–0x17E, -1 if unknown
	SumMod   int // Sum(0x000–0x17F) mod 256; 0 when OK
	Leader   int // byte at 0x169
}

func (s *Studio) ChecksumInfo() ChecksumInfo {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.hasDump {
		return ChecksumInfo{
			HasDump:  false,
			Current:  -1,
			Expected: -1,
			SumMod:   -1,
			Leader:   LeaderMin,
		}
	}
	ok, sumMod := protocol.VerifyRegion(s.eeprom[:])
	cur := int(s.eeprom[protocol.ChecksumAddr])
	exp := -1
	if ck, err := protocol.ChecksumByteForRegion(s.eeprom[:]); err == nil {
		exp = int(ck)
	}
	return ChecksumInfo{
		HasDump:  true,
		OK:       ok,
		Current:  cur,
		Expected: exp,
		SumMod:   sumMod,
		Leader:   int(s.eeprom[LeaderAddr]),
	}
}

func (s *Studio) DumpHexView() string {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.hasDump {
		return ""
	}
	highlight := protocol.ChecksumAddr
	return hexfmt.FormatFullView(s.eeprom[:], &highlight)
}

// WriteChecksumOnly reconnects and writes 0x017F from a fresh prefix read (MODIFY recovery path).
func (s *Studio) WriteChecksumOnly() error {
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

	s.logKey("log.advanced_reconnect", port)
	s.closeActiveService()

	svc := s.newService()
	if err := svc.Connect(port); err != nil {
		return err
	}
	var writeErr error
	defer func() {
		if writeErr != nil {
			s.logWriteRecoveryHintIf(writeErr, febRecoveryChecksum)
		}
		svc.Close()
		if writeErr == nil {
			s.logKey("log.write_done_disconnect")
		} else {
			s.logKey("log.write_abort_disconnect")
		}
	}()

	if err := svc.EepromSettleBeforeChecksum(false); err != nil {
		writeErr = err
		return fmt.Errorf("%s: %w", i18n.Format(s.getLocale(), "err.checksum_before"), err)
	}
	prefix, err := svc.ReadEepromPrefix(protocol.ChecksumRegionBytes)
	if err != nil {
		writeErr = err
		return err
	}
	s.mu.Lock()
	copy(s.eeprom[:protocol.ChecksumRegionBytes], prefix)
	ck, err := protocol.ChecksumByteForRegion(s.eeprom[:])
	s.mu.Unlock()
	if err != nil {
		writeErr = err
		return err
	}
	if err := svc.WriteChecksumOnly(ck); err != nil {
		writeErr = err
		return err
	}
	s.mu.Lock()
	s.eeprom[protocol.ChecksumAddr] = ck
	ok, _ := protocol.VerifyRegion(s.eeprom[:])
	s.mu.Unlock()
	if !ok {
		writeErr = s.errKey("err.region_verify_failed")
		return writeErr
	}
	s.logKey("log.checksum_updated", int(ck))
	return nil
}
