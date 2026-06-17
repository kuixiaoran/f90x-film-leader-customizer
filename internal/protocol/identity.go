package protocol

import (
	"strings"
)

type ModelKind int

const (
	ModelUnknown ModelKind = iota
	ModelF90XN90s
	ModelF90N90
)

func ParseIdentity(resp []byte) (ModelKind, byte, bool) {
	if len(resp) < 2 {
		return ModelUnknown, 0, false
	}
	s := string(resp)
	upper := strings.ToUpper(s)
	if strings.ContainsRune(upper, 'X') || strings.Contains(s, "/") || strings.ContainsRune(s, 's') {
		return ModelF90XN90s, CamAddrF90X, true
	}
	if strings.Contains(upper, "F90") || strings.Contains(upper, "N90") {
		return ModelF90N90, 0x10, true
	}
	return ModelUnknown, 0, false
}

func ModelName(m ModelKind) string {
	switch m {
	case ModelF90XN90s:
		return "F90X/N90s"
	case ModelF90N90:
		return "F90 / N90"
	default:
		return "未知"
	}
}

type UnsupportedCameraError struct {
	Model ModelKind
	Addr  byte
	Raw   string
}

func (e *UnsupportedCameraError) Error() string {
	return "检测到 " + ModelName(e.Model) + "，本工具仅支持 F90X/N90s"
}
