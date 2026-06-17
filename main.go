package main

import (
	"embed"
	"io/fs"
	"log"

	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

// Window layout — design artboard 1921×1081, scaled to fit typical viewports.
const (
	winStageW = 840
	winChrome = 294 // log + advanced panel (1.5× base 196)
	winWidth  = winStageW + 40
	winHeight = winStageW*1081/1921 + winChrome
)

func main() {
	distFS, err := fs.Sub(assets, "frontend/dist")
	if err != nil {
		log.Fatal(err)
	}

	app := application.New(application.Options{
		Name:        "F90X/N90s Film Leader Customizer",
		Description: "F90X/N90s film leader length customization via EEPROM 0x169",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(distFS),
		},
	})

	studio := NewStudioService(app)
	app.RegisterService(application.NewService(studio))

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:               "F90X/N90s Film Leader Customizer",
		Width:               winWidth,
		Height:              winHeight,
		MinWidth:            720,
		MinHeight:           520,
		InitialPosition:     application.WindowCentered,
		URL:                 "/",
		Frameless:           true,
		BackgroundType:      application.BackgroundTypeTransparent,
		BackgroundColour:    application.NewRGBA(0, 0, 0, 0),
		MinimiseButtonState: application.ButtonHidden,
		MaximiseButtonState: application.ButtonHidden,
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
