$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "=== F90X/N90s Film Leader Customizer — UI preview ===" -ForegroundColor Cyan
Write-Host "Mock API, no Wails/serial. Open http://localhost:5173/" -ForegroundColor DarkGray

if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[1/2] npm install (frontend)..." -ForegroundColor Yellow
    npm install --prefix frontend
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "[2/2] vite dev..." -ForegroundColor Yellow
npm run dev --prefix frontend
