package hexfmt

import (
	"fmt"
	"strconv"
	"strings"
)

const BytesPerLine = 16
const EepromSize = 512

// Leading space matches the per-row '>' / ' ' marker so header columns line up with data.
const FormatHeader = " Offset    00 01 02 03 04 05 06 07  08 09 0A 0B 0C 0D 0E 0F   ASCII"

// HexViewWidth is the fixed minimum width for the hex column (monospace alignment).
const HexViewWidth = 78

// FormatFullView returns header, column pointer, and data in one block.
func FormatFullView(data []byte, highlightAddr *int) string {
	byteCol := -1
	if highlightAddr != nil {
		byteCol = *highlightAddr % BytesPerLine
	}
	body := FormatDataBody(data, highlightAddr)
	if body == "" {
		return FormatHeader + "\n" + FormatColumnPointer(byteCol)
	}
	return FormatHeader + "\n" + FormatColumnPointer(byteCol) + "\n" + body
}

func FormatDataBody(data []byte, highlightAddr *int) string {
	limit := len(data)
	if limit > EepromSize {
		limit = EepromSize
	}
	if limit <= 0 {
		return ""
	}
	var sb strings.Builder
	for off := 0; off < limit; off += BytesPerLine {
		n := BytesPerLine
		if off+n > limit {
			n = limit - off
		}
		marker := ' '
		if highlightAddr != nil {
			h := *highlightAddr
			if h >= off && h < off+n {
				marker = '>'
			}
		}
		sb.WriteByte(byte(marker))
		sb.WriteString(FormatLine(off, data[off:off+n], highlightAddr))
		sb.WriteByte('\n')
	}
	return sb.String()
}

func FormatLine(offset int, row []byte, highlightAddr *int) string {
	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("%08X  ", offset))
	for i := 0; i < BytesPerLine; i++ {
		if i == 8 {
			sb.WriteByte(' ')
		}
		if i < len(row) {
			addr := offset + i
			hit := highlightAddr != nil && *highlightAddr == addr
			if hit {
				sb.WriteByte('[')
			}
			sb.WriteString(fmt.Sprintf("%02X", row[i]))
			if hit {
				sb.WriteByte(']')
			}
		} else {
			sb.WriteString("..")
		}
		sb.WriteByte(' ')
	}
	sb.WriteString(" ")
	for i := 0; i < BytesPerLine; i++ {
		if i < len(row) {
			b := row[i]
			if b >= 32 && b <= 126 {
				sb.WriteByte(b)
			} else {
				sb.WriteByte('.')
			}
		} else {
			sb.WriteByte(' ')
		}
	}
	return sb.String()
}

func LineIndexForAddress(address int) int {
	if address < 0 {
		return 0
	}
	return address / BytesPerLine
}

// GridRowForAddress is the TextGrid row index for a data line (0=header, 1=column pointer, 2+=data).
func GridRowForAddress(address int) int {
	if address < 0 {
		return 2
	}
	return 2 + address/BytesPerLine
}

// DataHexStart is the character column of the first hex digit on a data line (leading marker column).
const DataHexStart = 11

// HexColumnForByte returns the character column of a hex byte (0–15) in a formatted data line.
func HexColumnForByte(byteIndex int) int {
	col := DataHexStart + byteIndex*3
	if byteIndex >= 8 {
		col++
	}
	return col
}

// AddressAtCharColumn maps a character column in a data/grid line to an EEPROM address.
func AddressAtCharColumn(line string, charCol int) (int, bool) {
	lineOff, ok := ParseLineOffset(line)
	if !ok || lineOff >= EepromSize {
		return 0, false
	}
	if charCol < DataHexStart {
		return lineOff, lineOff < EepromSize
	}
	for b := 0; b < BytesPerLine; b++ {
		c0 := HexColumnForByte(b)
		if charCol >= c0 && charCol <= c0+2 {
			addr := lineOff + b
			return addr, addr < EepromSize
		}
		if charCol == c0+3 {
			addr := lineOff + b
			return addr, addr < EepromSize
		}
	}
	asciiStart := HexColumnForByte(15) + 3
	if asciiStart+1 < len(line) && line[asciiStart:asciiStart+2] == "  " {
		asciiStart += 2
	}
	if charCol >= asciiStart {
		ai := charCol - asciiStart
		if ai < 0 {
			ai = 0
		}
		if ai > BytesPerLine-1 {
			ai = BytesPerLine - 1
		}
		addr := lineOff + ai
		return addr, addr < EepromSize
	}
	return lineOff, lineOff < EepromSize
}

// FormatColumnPointer returns a header-width line with "v" under the selected byte column (0–15).
func FormatColumnPointer(byteIndex int) string {
	runes := []rune(FormatHeader)
	for i := range runes {
		runes[i] = ' '
	}
	if byteIndex >= 0 && byteIndex < BytesPerLine {
		col := HexColumnForByte(byteIndex)
		if col < len(runes) {
			runes[col] = 'v'
		}
	}
	return string(runes)
}

func ParseLineOffset(line string) (int, bool) {
	line = strings.TrimSpace(line)
	if len(line) > 0 && (line[0] == '>' || line[0] == ' ') {
		line = strings.TrimSpace(line[1:])
	}
	if len(line) < 8 {
		return 0, false
	}
	v, err := strconv.ParseInt(line[:8], 16, 32)
	return int(v), err == nil
}

func ParseCaretAddress(line string, caretInLine int) (int, bool) {
	return AddressAtCharColumn(line, caretInLine)
}
