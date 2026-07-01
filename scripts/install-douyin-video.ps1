$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$douyin = Join-Path $repo "skills/douyin"

Write-Host "=== Douyin video optional deps ==="
Write-Host "Windows: ffmpeg+ASS is default (no extra install)."
Write-Host "Linux/macOS: optional FFCreator for richer animate.css effects."

Push-Location $douyin
try {
  if ($IsWindows -or $env:OS -match "Windows") {
    Write-Host "[skip] FFCreator on Windows (canvas native build required)"
    Write-Host "[ok] Use: npm run pipeline:douyin"
    exit 0
  }
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[warn] FFCreator install failed; ffmpeg ASS fallback remains available"
    exit 0
  }
  Write-Host "[ok] FFCreator installed under skills/douyin"
} finally {
  Pop-Location
}
