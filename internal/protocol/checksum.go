package protocol

import "fmt"

// ChecksumByteForRegion returns the byte for 0x017F so Sum(data[0:0x17F]) + ck ≡ 0 (mod 256).
// data must reflect camera EEPROM 0x000–0x17E; use ReadEepromPrefix before computing after a write.
func ChecksumByteForRegion(data []byte) (byte, error) {
	if len(data) < ChecksumDataEnd {
		return 0, fmt.Errorf("数据长度不足 %d 字节", ChecksumDataEnd)
	}
	s := Sum(data[:ChecksumDataEnd])
	return byte((-s) & 0xFF), nil
}

func VerifyRegion(data []byte) (ok bool, sumMod int) {
	if len(data) < ChecksumRegionBytes {
		return false, -1
	}
	total := Sum(data[:ChecksumRegionBytes])
	return total == 0, total
}
