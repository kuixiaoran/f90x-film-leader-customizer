package protocol

func TryParseSTX(buf []byte, dataLen int) ([]byte, bool) {
	if len(buf) < 4 {
		return nil, false
	}
	start := 0
	if buf[0] != 0x02 {
		found := false
		for i, b := range buf {
			if b == 0x02 {
				start = i
				found = true
				break
			}
		}
		if !found {
			return nil, false
		}
	}
	chunk := buf[start:]
	need := dataLen + 3
	if len(chunk) < need || chunk[dataLen+2] != 0x03 {
		return nil, false
	}
	data := chunk[1 : 1+dataLen]
	chk := chunk[1+dataLen]
	sum := Sum(data)
	if sum != int(chk) {
		return nil, false
	}
	out := make([]byte, dataLen)
	copy(out, data)
	return out, true
}

func Sum(data []byte) int {
	s := 0
	for _, b := range data {
		s = (s + int(b)) & 0xFF
	}
	return s
}
