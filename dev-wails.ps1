$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not $env:GOPROXY) { $env:GOPROXY = "https://goproxy.cn,direct" }
if (-not $env:GOSUMDB) { $env:GOSUMDB = "off" }

Write-Host "=== F90X Film Leader Customizer (Wails v3 dev) ===" -ForegroundColor Cyan
& "$PSScriptRoot\clean-rsrc.ps1"
wails3 dev -config ./build/config.yml -port 5173
