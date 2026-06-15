package hexfmt

import "testing"

func TestAddressAtCharColumn_0x58(t *testing.T) {
	line := " 00000050  00 00 00 00 00 00 00 00  00 00 00 38 00 00 00 00   ........8......."
	for _, col := range []int{HexColumnForByte(8), HexColumnForByte(8) + 1} {
		addr, ok := AddressAtCharColumn(line, col)
		if !ok || addr != 0x58 {
			t.Fatalf("col %d: got 0x%X ok=%v, want 0x58", col, addr, ok)
		}
	}
}

func TestAddressAtCharColumn_0x9b_not_0x9c(t *testing.T) {
	line := ">00000090  00 00 00 00 00 00 00 00  00 00 00 9B 9C 00 00 00   ............9B9C...."
	col := HexColumnForByte(11)
	addr, ok := AddressAtCharColumn(line, col)
	if !ok || addr != 0x9b {
		t.Fatalf("col %d: got 0x%X ok=%v, want 0x9B", col, addr, ok)
	}
	// Old rel/3 bug: col+1 on digit snapped to next byte.
	addr2, ok := AddressAtCharColumn(line, col+1)
	if !ok || addr2 != 0x9b {
		t.Fatalf("col %d: got 0x%X ok=%v, want 0x9B", col+1, addr2, ok)
	}
}
