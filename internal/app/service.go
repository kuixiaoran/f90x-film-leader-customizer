package app



import (

	"fmt"

	"time"

	"f90x_eeprom_studio/internal/i18n"

	"f90x_eeprom_studio/internal/protocol"

	"go.bug.st/serial"

)



const DefaultDumpName = "f90x_eeprom_dump_space01.bin"



type WriteRecord struct {

	Addr    int

	Payload []byte

}



type Service struct {

	link *protocol.Link

	log func(string)

	locale func() i18n.Locale

}



func (s *Service) loc() i18n.Locale {
	if s.locale != nil {
		return s.locale()
	}
	return i18n.Zh
}

func (s *Service) logKey(key string, args ...any) {
	s.log(i18n.Format(s.loc(), key, args...))
}

func (s *Service) errKey(key string, args ...any) error {
	return i18n.Err(s.loc(), key, args...)
}



func New(logFn func(string), getLocale func() i18n.Locale) *Service {

	link := &protocol.Link{}

	link.SetQueueLog(logFn)

	return &Service{link: link, log: logFn, locale: getLocale}

}



func (s *Service) Connected() bool { return s.link.IsOpen() }



func (s *Service) Connect(port string) error {

	var last error

	for attempt := 0; attempt < protocol.BootstrapConnectAttempts(); attempt++ {

		if attempt > 0 {

			time.Sleep(protocol.WakeupDelay())

			s.link.Close()

		}

		err := s.link.Connect(port, true)

		if err == nil {

			s.logKey("log.connected", port)

			s.log("    " + s.link.StatusLine())

			s.logKey("log.wakeup_note")

			s.logKey("log.port_exclusive")

			return nil

		}

		last = err

		if _, ok := err.(*protocol.UnsupportedCameraError); ok {

			return err

		}

		s.logKey("log.connect_retry", attempt+1, protocol.BootstrapConnectAttempts(), err)

	}

	return last

}



// Close releases the serial link without logging.
func (s *Service) Close() {
	s.link.Close()
}

func (s *Service) requireFast() error {

	if !s.link.FastActive() {

		return s.errKey("err.connect_first")

	}

	return nil

}



// prepareFastIO probes FD40 and relinks if needed (C# PrepareFastIo). Does not wait on FEB.

func (s *Service) prepareFastIO(actionKey string) error {

	if err := s.requireFast(); err != nil {

		return err

	}

	action := i18n.ActionLabel(s.loc(), actionKey)

	if err := s.link.EnsureFastLink(); err != nil {

		return i18n.Err(s.loc(), "err.before_action", action, err)

	}

	return nil

}



// SettleAfterEepromRead waits for FEB idle after a host EEPROM read burst (ROM @0946).

func (s *Service) SettleAfterEepromRead(phase string) error {

	s.logKey("log.feb_wait", phase)

	if err := s.link.WaitQueueIdle(); err != nil {

		return i18n.Err(s.loc(), "err.settle_after", phase, err)

	}

	time.Sleep(protocol.PostEepromReadSettle())

	return nil

}



func (s *Service) ReadEeprom(size int, progress func(cur, total int)) ([]byte, error) {

	if err := s.prepareFastIO("action.dump"); err != nil {

		return nil, err

	}

	out := make([]byte, size)

	chunk := protocol.EepromChunk

	total := (size + chunk - 1) / chunk

	for i := 0; i < total; i++ {

		off := i * chunk

		tries := 3

		if off == 0 {

			tries = 5

		}

		var block []byte

		for t := 0; t < tries; t++ {

			b, err := s.link.ReadMemory(protocol.SpaceEEPROM, off, chunk, protocol.ReadMemoryRetries)

			if b != nil {

				block = b

				break

			}

			if t+1 < tries {

				if err != nil {

					s.logKey("log.retry_addr", t+1, tries, off, err)

				} else {

					s.logKey("log.retry_no_ack", t+1, tries, off)

				}

			}

			time.Sleep(250 * time.Millisecond)

		}

		if block == nil || len(block) != chunk {

			return nil, s.errKey("err.read_failed", off)

		}

		copy(out[off:], block)

		s.logKey("log.chunk_progress", i+1, total, off, off+chunk-1)

		if progress != nil {

			progress(i+1, total)

		}

	}

	if err := s.SettleAfterEepromRead(i18n.Format(s.loc(), "action.dump")); err != nil {

		return nil, err

	}

	return out, nil

}

func (s *Service) readEepromByteDirect(addr int) (byte, error) {

	return s.readEepromByteAt(addr, protocol.ReadEepromVerifyTO())

}



func (s *Service) readEepromByteAt(addr int, collectTO time.Duration) (byte, error) {

	if !s.link.FastActive() {

		return 0, s.errKey("err.need_fast_link")

	}

	base := addr & ^(protocol.EepromChunk - 1)

	off := addr - base

	block, err := s.link.ReadMemoryWithTimeout(protocol.SpaceEEPROM, base, protocol.EepromChunk, 2, collectTO)

	if block == nil || len(block) != protocol.EepromChunk {

		if err != nil {

			return 0, err

		}

		return 0, s.errKey("err.read_eeprom_addr", addr)

	}

	return block[off], nil

}



// ConfirmEepromByte polls EEPROM after checksum commit; does not relink between attempts.

func (s *Service) ConfirmEepromByte(addr int, expected byte) (byte, error) {

	return s.confirmEepromByte(addr, expected, protocol.CommitReadRetries(), protocol.PostCommitReadDelay())

}



// ConfirmDataWritten polls EEPROM after a data-byte FE4E (longer / slower than checksum read-back).

func (s *Service) ConfirmDataWritten(addr int, expected byte) (byte, error) {

	return s.confirmEepromByte(addr, expected, protocol.DataCommitReadRetries(), protocol.PostDataReadDelay())

}



func (s *Service) confirmEepromByte(addr int, expected byte, tries int, delay time.Duration) (byte, error) {

	var lastRB byte

	var lastErr error

	var gotRead bool

	// C# DoWrite: one immediate read after queue+FE4E; poll only if mismatch.
	if rb, err := s.readEepromByteDirect(addr); err == nil {

		gotRead = true

		lastRB = rb

		if rb == expected {

			return rb, nil

		}

		lastErr = s.errKey("err.expect_actual", expected, rb)

	} else {

		lastErr = err

	}

	for i := 0; i < tries; i++ {

		time.Sleep(delay)

		rb, err := s.readEepromByteDirect(addr)

		if err != nil {

			lastErr = err

			continue

		}

		gotRead = true

		lastRB = rb

		if rb == expected {

			return rb, nil

		}

		lastErr = s.errKey("err.expect_actual", expected, rb)

	}

	if lastErr != nil {

		if gotRead {

			return lastRB, s.errKey("err.readback_delayed", addr, lastErr)

		}

		return lastRB, s.errKey("err.readback_comm_fail", addr, lastErr)

	}

	return lastRB, s.errKey("err.readback_failed", addr)

}



func (s *Service) WriteRecords(records []WriteRecord) error {

	if err := s.prepareFastIO("action.write"); err != nil {

		return err

	}

	if err := s.writeRecordsLocked(records); err != nil {

		return err

	}

	if err := s.verifyWriteRecords(records); err != nil {

		return err

	}

	s.logKey("log.data_confirmed")

	return nil

}



// writeRecordsLocked mirrors C#: each Commit in its own RunLocked, then FE4E in a separate lock.

func (s *Service) writeRecordsLocked(records []WriteRecord) error {

	for _, r := range records {

		if r.Addr < 0 || r.Addr+len(r.Payload) > protocol.EepromSize {

			return s.errKey("err.addr_oob")

		}

		s.logKey("log.queue", r.Addr, len(r.Payload))

		if err := protocol.Commit(s.link, r.Addr, r.Payload, false); err != nil {

			return s.errKey("err.queue_addr", r.Addr, err)

		}

	}

	s.logKey("log.fe4e")

	var err error

	s.link.RunLocked(func(p serial.Port) {

		err = protocol.TriggerFe4eSave(p, s.link.CamAddrLocked(), s.log)

	})

	return err

}



// verifyWriteRecords: success criterion is EEPROM read-back, not FEB flags.

func (s *Service) verifyWriteRecords(records []WriteRecord) error {

	time.Sleep(protocol.PostCommitReadDelay())

	for _, r := range records {

		for i := 0; i < len(r.Payload); i++ {

			addr := r.Addr + i

			want := r.Payload[i]

			rb, err := s.ConfirmDataWritten(addr, want)

			if err == nil {

				s.logKey("log.readback_ok", addr, rb)

				continue

			}

			return s.errKey("err.verify_mismatch", addr, want, rb)

		}

	}

	return nil

}



// EepromSettleBeforeChecksum waits for FEB idle before chaining a checksum queue (ROM @0946).

func (s *Service) EepromSettleBeforeChecksum(dataReadOK bool) error {

	if dataReadOK {

		s.logKey("log.data_confirm_feb")

	} else {

		s.logKey("log.feb_checksum")

	}

	if err := s.link.WaitQueueIdle(); err != nil {

		return fmt.Errorf("%s: %w", i18n.Format(s.loc(), "err.checksum_before"), err)

	}

	time.Sleep(protocol.BetweenFe4eGap())

	return nil

}



func (s *Service) ReadEepromPrefix(size int) ([]byte, error) {

	if err := s.prepareFastIO("action.read_checksum"); err != nil {

		return nil, err

	}

	if size <= 0 {

		size = protocol.ChecksumRegionBytes

	}

	out := make([]byte, size)

	offset := 0

	for off := 0; off < size; off += protocol.EepromChunk {

		block, _ := s.link.ReadMemory(protocol.SpaceEEPROM, off, protocol.EepromChunk, protocol.ReadMemoryRetries)

		if block == nil || len(block) != protocol.EepromChunk {

			return nil, s.errKey("err.read_eeprom_addr", off)

		}

		n := protocol.EepromChunk

		if off+n > size {

			n = size - off

		}

		copy(out[offset:], block[:n])

		offset += n

	}

	if err := s.SettleAfterEepromRead(i18n.Format(s.loc(), "action.read_checksum")); err != nil {

		return nil, err

	}

	return out, nil

}



// WriteChecksumOnly writes 0x017F (standalone from module 4).

func (s *Service) WriteChecksumOnly(value byte) error {

	return s.writeChecksum(value, false)

}



// WriteChecksumAfterData writes 0x017F right after a data byte commit in the same session.

func (s *Service) WriteChecksumAfterData(value byte) error {

	return s.writeChecksum(value, true)

}



func (s *Service) writeChecksum(value byte, afterData bool) error {

	value &= 0xFF

	s.logKey("log.write_checksum", protocol.ChecksumAddr, value)

	if afterData {

		if err := s.requireFast(); err != nil {

			return err

		}

		if err := s.link.EnsureFastLink(); err != nil {

			return err

		}

	} else {

		if err := s.prepareFastIO("action.write_checksum"); err != nil {

			return err

		}

	}

	if err := protocol.Commit(s.link, protocol.ChecksumAddr, []byte{value}, true); err != nil {

		return err

	}

	rb, err := s.ConfirmEepromByte(protocol.ChecksumAddr, value)

	if err != nil {

		return i18n.Err(s.loc(), "err.checksum_retry_hint", err)

	}

	s.logKey("log.readback_ok", protocol.ChecksumAddr, rb)

	return nil

}

