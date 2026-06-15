package i18n

import "testing"

func TestExpandTemplate(t *testing.T) {
	tests := []struct {
		tmpl string
		args []any
		want string
	}{
		{"[+] Connected %s", []any{"COM3"}, "[+] Connected COM3"},
		{"[*] Write 0x%04X <- 0x%02X", []any{0x169, 0x0C}, "[*] Write 0x0169 <- 0x0C"},
		{"留片头长度仅允许 %d–%d（0x169）", []any{6, 31}, "留片头长度仅允许 6–31（0x169）"},
		{"[*] Connect retry %d/%d: %v", []any{1, 3, "busy"}, "[*] Connect retry 1/3: busy"},
	}
	for _, tc := range tests {
		got := expandTemplate(tc.tmpl, tc.args...)
		if got != tc.want {
			t.Fatalf("expandTemplate(%q, %v) = %q, want %q", tc.tmpl, tc.args, got, tc.want)
		}
	}
}

func TestFormatKnownKey(t *testing.T) {
	got := Format(En, "log.connected", "COM1")
	want := "[+] Connected COM1"
	if got != want {
		t.Fatalf("Format(en, log.connected) = %q, want %q", got, want)
	}
}
