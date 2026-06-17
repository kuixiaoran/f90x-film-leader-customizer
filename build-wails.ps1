$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $env:GOPROXY) { $env:GOPROXY = "https://goproxy.cn,direct" }
if (-not $env:GOSUMDB) { $env:GOSUMDB = "off" }

Write-Host "=== F90X/N90s Film Leader Customizer (Wails v3) ===" -ForegroundColor Cyan

& "$PSScriptRoot\clean-rsrc.ps1"

Write-Host "[1/5] npm install (frontend)..." -ForegroundColor Yellow
Push-Location frontend
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Pop-Location

Write-Host "[2/5] go mod tidy..." -ForegroundColor Yellow
go mod tidy
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[3/5] sync app icon..." -ForegroundColor Yellow
& "$PSScriptRoot\build\set-app-icon.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[4/5] wails3 generate bindings..." -ForegroundColor Yellow
wails3 generate bindings -ts -clean=true
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "[5/5] wails3 build (production)..." -ForegroundColor Yellow
wails3 build PRODUCTION=true
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "OK: bin\f90x-film-leader-customizer.exe" -ForegroundColor Green
