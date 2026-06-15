package protocol

import (
	"encoding/hex"
	"fmt"
	"time"

	"go.bug.st/serial"
)

const (
	bootstrapSettleMs     = 50 * time.Millisecond
	bootstrapWakeIdleMs   = 100 * time.Millisecond
	bootstrapWakeOverall  = 1500 * time.Millisecond
	bootstrapAttempts = 3
)

func BootstrapConnectAttempts() int { return bootstrapAttempts }

func WakeupDelay() time.Duration { return wakeupDelay }

// BootstrapHandshake runs FilmCamera-style connect @1200: 0x00 wake (once) → S1000 → 87 05 → 9600.
// Wake is NOT repeated while the session stays open (see FilmCamera BootstrapHandshake.cs).
func BootstrapHandshake(p serial.Port) (ModelKind, string, error) {
	time.Sleep(bootstrapSettleMs)

	var lastWake []byte
	var lastModel []byte
	for attempt := 0; attempt < bootstrapAttempts; attempt++ {
		if attempt > 0 {
			time.Sleep(wakeupDelay)
			flushBuffers(p)
			time.Sleep(bootstrapSettleMs)
		}

		wake := tryWake(p, attempt == 0)
		lastWake = wake
		if !isRecognizedWake(wake) {
			continue
		}

		modelResp := sendSignIn(p)
		lastModel = modelResp
		if model, _, ok := ParseIdentity(modelResp); ok {
			return model, wakeupHintFrom(wake), nil
		}
	}

	if len(lastModel) > 0 {
		return ModelUnknown, "", fmt.Errorf("无法识别相机 SIGNIN: %s", hex.EncodeToString(lastModel))
	}
	if len(lastWake) > 0 && !isRecognizedWake(lastWake) {
		return ModelUnknown, "", fmt.Errorf("唤醒未确认: %s", hex.EncodeToString(lastWake))
	}
	return ModelUnknown, "", fmt.Errorf("握手失败")
}

func tryWake(p serial.Port, discardInbound bool) []byte {
	for i := 0; i < 3; i++ {
		if i > 0 {
			time.Sleep(wakeupDelay)
		}
		if discardInbound && i == 0 {
			flushBuffers(p)
		} else {
			drainRx(p, 40*time.Millisecond)
		}
		_, _ = p.Write(WakeupByte)
		time.Sleep(wakeupDelay)
		rx := collectInbound(p, 10, bootstrapWakeIdleMs, bootstrapWakeOverall)
		if isRecognizedWake(rx) {
			return rx
		}
	}
	return collectInbound(p, 10, 50*time.Millisecond, 200*time.Millisecond)
}

func isRecognizedWake(wake []byte) bool {
	if len(wake) == 0 {
		return true
	}
	return len(wake) >= 2 && wake[0] == WakeupAwakeNAK[0] && wake[1] == WakeupAwakeNAK[1]
}

func wakeupHintFrom(wake []byte) string {
	if len(wake) == 0 {
		return "休眠唤醒"
	}
	if isRecognizedWake(wake) {
		return "已醒(15 83)"
	}
	return "杂散(" + hex.EncodeToString(wake) + ")"
}

func collectInbound(p serial.Port, capacity int, idleMs, overallMs time.Duration) []byte {
	buf := make([]byte, 0, capacity)
	idleDeadline := time.Now().Add(idleMs)
	deadline := time.Now().Add(overallMs)
	scratch := make([]byte, 64)
	for len(buf) < capacity && time.Now().Before(deadline) {
		n := readPort(p, scratch)
		if n > 0 {
			buf = append(buf, scratch[:n]...)
			idleDeadline = time.Now().Add(idleMs)
		} else if len(buf) > 0 && time.Now().After(idleDeadline) {
			break
		} else {
			time.Sleep(5 * time.Millisecond)
		}
	}
	return buf
}
