# Remove Fyne/rsrc .syso files that conflict with Wails (error: too many .rsrc sections).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$removed = @()
foreach ($pattern in @("rsrc.syso", "rsrc_windows*.syso", "wails_windows*.syso")) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        Remove-Item $_.FullName -Force
        $removed += $_.Name
    }
}

if ($removed.Count -gt 0) {
    Write-Host "Removed conflicting resource files: $($removed -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "No conflicting .syso files in project root." -ForegroundColor DarkGray
}
