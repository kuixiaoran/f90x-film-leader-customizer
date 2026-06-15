package main

import (
	"context"

	internalapp "f90x_eeprom_studio/internal/app"
	"f90x_eeprom_studio/internal/i18n"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// StudioService exposes EEPROM studio methods to the React frontend.
type StudioService struct {
	app *application.App
	st  *internalapp.Studio
}

func NewStudioService(app *application.App) *StudioService {
	s := &StudioService{app: app}
	s.st = internalapp.NewStudio(func(line string) {
		// Synchronous emit preserves log order (chunk 16/16 before FEB settle, etc.).
		s.app.Event.Emit("log", line)
	})
	return s
}

func (s *StudioService) ServiceStartup(_ context.Context, _ application.ServiceOptions) error {
	return nil
}

// SetLocale sets log and error language for the backend ("zh", "en", or "ja").
func (s *StudioService) SetLocale(locale string) {
	s.st.SetLocale(locale)
}

// ListPorts returns available serial port names.
func (s *StudioService) ListPorts() []string {
	return s.st.ListPorts()
}

// Connect opens the camera session on port (scene 1).
func (s *StudioService) Connect(port string) error {
	return s.st.Connect(port)
}

// Disconnect closes the serial session.
func (s *StudioService) Disconnect() {
	s.st.Disconnect()
}

// IsConnected reports whether a session is open.
func (s *StudioService) IsConnected() bool {
	return s.st.Connected()
}

// StatusDTO is JSON-friendly state for the UI.
type StatusDTO struct {
	Connected  bool   `json:"connected"`
	Port       string `json:"port"`
	HasDump    bool   `json:"hasDump"`
	Leader     int    `json:"leader"`
	LeaderMin  int    `json:"leaderMin"`
	LeaderMax  int    `json:"leaderMax"`
	ChecksumOK bool   `json:"checksumOk"`
}

// GetStatus returns current studio state for React.
func (s *StudioService) GetStatus() StatusDTO {
	leader := internalapp.LeaderMin
	if s.st.HasDump() {
		if v, err := s.st.LeaderLength(); err == nil {
			leader = internalapp.ClampLeader(v)
		}
	}
	return StatusDTO{
		Connected:  s.st.Connected(),
		Port:       s.st.Port(),
		HasDump:    s.st.HasDump(),
		Leader:     leader,
		LeaderMin:  internalapp.LeaderMin,
		LeaderMax:  internalapp.LeaderMax,
		ChecksumOK: s.st.ChecksumOK(),
	}
}

// Dump reads 512B and disconnects (scene 2).
func (s *StudioService) Dump() error {
	return s.st.Dump()
}

// RefreshDump reconnects, reads 512B into the mirror, and disconnects (no save dialog).
func (s *StudioService) RefreshDump() error {
	return s.st.RefreshDump()
}

// PromptSaveDump opens a native save dialog and writes the EEPROM mirror. Returns true if saved.
func (s *StudioService) PromptSaveDump() bool {
	if !s.st.HasDump() {
		return false
	}
	dialog := s.app.Dialog.SaveFileWithOptions(&application.SaveFileDialogOptions{
		Title:                i18n.Format(s.st.Locale(), "dialog.save.title"),
		Message:              i18n.Format(s.st.Locale(), "dialog.save.message"),
		Filename:             internalapp.DefaultDumpName,
		CanCreateDirectories: true,
		Filters: []application.FileFilter{
			{DisplayName: i18n.Format(s.st.Locale(), "dialog.save.filter"), Pattern: "*.bin"},
		},
	})
	path, err := dialog.PromptForSingleSelection()
	if err != nil || path == "" {
		return false
	}
	if err := s.st.SaveDumpTo(path); err != nil {
		s.app.Event.Emit("log", "[!] "+err.Error())
		return false
	}
	return true
}

// SaveDumpTo writes the EEPROM mirror to a user-chosen path (512B .bin).
func (s *StudioService) SaveDumpTo(path string) error {
	return s.st.SaveDumpTo(path)
}

// WriteLeader writes 0x169 (dec 6–31) with checksum (scene 3 MODIFY).
func (s *StudioService) WriteLeader(length int) error {
	return s.st.WriteLeader(length)
}

// LeaderDragToValue maps drag position 0..1 to dec 6 (55mm) .. 31 (5mm).
func (s *StudioService) LeaderDragToValue(t float64) int {
	if t < 0 {
		t = 0
	}
	if t > 1 {
		t = 1
	}
	span := float64(internalapp.LeaderMax - internalapp.LeaderMin)
	v := float64(internalapp.LeaderMax) - t*span
	return internalapp.ClampLeader(int(v + 0.5))
}

// LeaderValueToDrag inverts LeaderDragToValue for UI initialization.
func (s *StudioService) LeaderValueToDrag(value int) float64 {
	value = internalapp.ClampLeader(value)
	span := float64(internalapp.LeaderMax - internalapp.LeaderMin)
	if span <= 0 {
		return 0
	}
	return float64(internalapp.LeaderMax-value) / span
}

// ChecksumInfoDTO is JSON-friendly checksum state for the advanced panel.
type ChecksumInfoDTO struct {
	HasDump  bool `json:"hasDump"`
	OK       bool `json:"ok"`
	Current  int  `json:"current"`
	Expected int  `json:"expected"`
	SumMod   int  `json:"sumMod"`
	Leader   int  `json:"leader"`
}

// GetChecksumInfo returns checksum state from the EEPROM mirror.
func (s *StudioService) GetChecksumInfo() ChecksumInfoDTO {
	info := s.st.ChecksumInfo()
	return ChecksumInfoDTO{
		HasDump:  info.HasDump,
		OK:       info.OK,
		Current:  info.Current,
		Expected: info.Expected,
		SumMod:   info.SumMod,
		Leader:   info.Leader,
	}
}

// GetDumpHex returns HxD-style hex for the local EEPROM mirror (highlights 0x017F).
func (s *StudioService) GetDumpHex() string {
	return s.st.DumpHexView()
}

// WriteChecksumOnly reconnects and writes 0x017F only (MODIFY failure recovery).
func (s *StudioService) WriteChecksumOnly() error {
	return s.st.WriteChecksumOnly()
}
