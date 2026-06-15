package app

const (
	LeaderAddr = 0x169
	LeaderMin  = 6  // 留片头 55mm
	LeaderMax  = 31 // 留片头 5mm（DEC 6 = 55mm，见 README）
)

func ClampLeader(v int) int {
	if v < LeaderMin {
		return LeaderMin
	}
	if v > LeaderMax {
		return LeaderMax
	}
	return v
}

func ValidLeader(v int) bool {
	return v >= LeaderMin && v <= LeaderMax
}
