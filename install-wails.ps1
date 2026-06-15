# Install Wails v3 CLI (China-friendly GOPROXY)
$ErrorActionPreference = "Stop"

$env:GOPROXY = "https://goproxy.cn,direct"
if (-not $env:GOSUMDB) { $env:GOSUMDB = "off" }

Write-Host "GOPROXY=$env:GOPROXY" -ForegroundColor Cyan
Write-Host "Installing wails3 CLI ..." -ForegroundColor Yellow

go install github.com/wailsapp/wails/v3/cmd/wails3@v3.0.0-alpha.79

$goBin = Join-Path (go env GOPATH) "bin"
$wails3 = Join-Path $goBin "wails3.exe"

if (-not (Test-Path $wails3)) {
  Write-Host "FAIL: wails3.exe not found at $wails3" -ForegroundColor Red
  exit 1
}

Write-Host "OK: $wails3" -ForegroundColor Green
& $wails3 version

Write-Host ""
Write-Host "Add to PATH if needed:" -ForegroundColor Yellow
Write-Host "  $goBin"
