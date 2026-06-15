package app

import (
	"testing"
	"time"
)

func TestLeaderLengthNoDumpDoesNotDeadlock(t *testing.T) {
	s := NewStudio(nil)
	done := make(chan struct{})
	go func() {
		_, err := s.LeaderLength()
		if err == nil {
			t.Error("expected error when no dump")
		}
		close(done)
	}()
	select {
	case <-done:
	case <-time.After(2 * time.Second):
		t.Fatal("LeaderLength deadlocked with mu held")
	}
}

func TestGetStatusBeforeDump(t *testing.T) {
	s := NewStudio(nil)
	// Simulate GetStatus path: HasDump false → skip LeaderLength error path hang.
	if s.HasDump() {
		t.Fatal("expected no dump on fresh studio")
	}
	if s.Connected() {
		t.Fatal("expected not connected")
	}
}

func TestClearMirrorLocked(t *testing.T) {
	s := NewStudio(nil)
	s.mu.Lock()
	s.eeprom[0] = 0xFF
	s.hasDump = true
	s.clearMirrorLocked()
	if s.hasDump {
		t.Fatal("expected hasDump false")
	}
	if s.eeprom[0] != 0 {
		t.Fatal("expected eeprom cleared")
	}
	s.mu.Unlock()
}
