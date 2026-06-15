package i18n

import (
	"fmt"
	"strconv"
	"strings"
)

// expandTemplate substitutes fmt-style verbs without fmt.Sprintf so vet does not
// treat logKey/errKey wrappers as printf functions (keys are not format strings).
func expandTemplate(tmpl string, args ...any) string {
	if len(args) == 0 {
		return tmpl
	}
	var b strings.Builder
	argIdx := 0
	for i := 0; i < len(tmpl); i++ {
		if tmpl[i] != '%' {
			b.WriteByte(tmpl[i])
			continue
		}
		if i+1 >= len(tmpl) {
			b.WriteByte('%')
			continue
		}
		j := i + 1
		width := 0
		for j < len(tmpl) && tmpl[j] >= '0' && tmpl[j] <= '9' {
			width = width*10 + int(tmpl[j]-'0')
			j++
		}
		if j >= len(tmpl) {
			b.WriteString(tmpl[i:])
			break
		}
		if argIdx >= len(args) {
			b.WriteString(tmpl[i:])
			break
		}
		verb := tmpl[j]
		b.WriteString(formatArg(args[argIdx], width, verb))
		argIdx++
		i = j
	}
	return b.String()
}

func formatArg(arg any, width int, verb byte) string {
	switch verb {
	case 's':
		return fmt.Sprint(arg)
	case 'd':
		return formatInt(arg, width, 10, false)
	case 'v':
		if err, ok := arg.(error); ok {
			if err == nil {
				return ""
			}
			return err.Error()
		}
		return fmt.Sprint(arg)
	case 'X':
		return formatInt(arg, width, 16, true)
	case 'x':
		return formatInt(arg, width, 16, false)
	default:
		return fmt.Sprint(arg)
	}
}

func formatInt(arg any, width, base int, upper bool) string {
	n := toInt64(arg)
	s := strconv.FormatInt(n, base)
	if base == 16 && upper {
		s = strings.ToUpper(s)
	}
	if width > 0 {
		for len(s) < width {
			s = "0" + s
		}
	}
	return s
}

func toInt64(arg any) int64 {
	switch v := arg.(type) {
	case int:
		return int64(v)
	case int8:
		return int64(v)
	case int16:
		return int64(v)
	case int32:
		return int64(v)
	case int64:
		return v
	case uint:
		return int64(v)
	case uint8:
		return int64(v)
	case uint16:
		return int64(v)
	case uint32:
		return int64(v)
	case uint64:
		return int64(v)
	default:
		return 0
	}
}
