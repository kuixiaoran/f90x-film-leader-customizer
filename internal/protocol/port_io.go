package protocol

import (
	"bytes"
	"time"

	"go.bug.st/serial"
)

// readPort polls the RX buffer (C# checks BytesToRead before Read).
func readPort(p serial.Port, buf []byte) int {
	n, _ := p.Read(buf)
	if n <= 0 {
		return 0
	}
	return n
}

func drainRx(p serial.Port, d time.Duration) {
	deadline := time.Now().Add(d)
	scratch := make([]byte, 256)
	for time.Now().Before(deadline) {
		if readPort(p, scratch) == 0 {
			time.Sleep(5 * time.Millisecond)
		}
	}
}

// trimLeadingRx drops bytes before the first STX so leading 0x80/idle noise does not false-NAK.
func trimLeadingRx(buf []byte) []byte {
	if len(buf) == 0 {
		return buf
	}
	if buf[0] == 0x02 {
		return buf
	}
	if i := bytes.IndexByte(buf, 0x02); i > 0 {
		return buf[i:]
	}
	return buf
}
