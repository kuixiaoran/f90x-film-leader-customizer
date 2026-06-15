$ErrorActionPreference = "Stop"
$buildDir = $PSScriptRoot

$designSrc = Join-Path $buildDir "..\design\ui\1x\F90X Leader icon.png"
$png = Join-Path $buildDir "appicon.png"
$ico = Join-Path $buildDir "windows\icon.ico"
$windowsDir = Join-Path $buildDir "windows"

if (-not (Test-Path $windowsDir)) {
  New-Item -ItemType Directory -Path $windowsDir | Out-Null
}

if (Test-Path -LiteralPath $designSrc) {
  Copy-Item -LiteralPath $designSrc -Destination $png -Force
  Write-Host "Copied design icon -> $png"
} elseif (-not (Test-Path -LiteralPath $png)) {
  throw "App icon not found: $designSrc or $png"
} else {
  Write-Host "Using committed icon: $png"
}

$wails3 = Get-Command wails3 -ErrorAction SilentlyContinue
if ($wails3) {
  wails3 generate icons -input $png -windowsfilename $ico
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  $root = (Resolve-Path (Join-Path $buildDir "..")).Path
  go run (Join-Path $buildDir "tools\sync_app_icon.go") $root
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not (Test-Path $ico)) {
  throw "icon.ico was not created at $ico"
}

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($png)
Write-Host "appicon.png: $($img.Width)x$($img.Height)"
$img.Dispose()
Write-Host "icon.ico: $((Get-Item $ico).Length) bytes"
Write-Host "App icon ready" -ForegroundColor Green
