package app

import "strings"

type febRecoveryPhase int

const (
	febRecoveryLeader febRecoveryPhase = iota // 0x169 / data write failed
	febRecoveryChecksum                       // 0x017F / checksum chain failed
)

func isFebQueueFailure(err error) bool {
	if err == nil {
		return false
	}
	msg := err.Error()
	return strings.Contains(msg, "eeprom queue busy") ||
		strings.Contains(msg, "FEB3=0x") ||
		strings.Contains(msg, "FEB5=0x")
}

func (s *Studio) logWriteRecoveryHintIf(err error, phase febRecoveryPhase) {
	if err == nil {
		return
	}
	switch phase {
	case febRecoveryLeader:
		// Any 0x169 write failure (queue, FE4E, read-back verify).
		s.logKey("log.write_leader_recovery")
	case febRecoveryChecksum:
		if isFebQueueFailure(err) {
			s.logKey("log.feb_timeout_recovery_checksum")
		}
	}
}
