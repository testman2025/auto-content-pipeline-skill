$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot

& (Join-Path $repo "scripts/install-tool-deps.ps1")

Write-Host ""
Write-Host "Next steps:"
Write-Host "  npm run skills:register"
Write-Host "  cd tool/social-auto-upload; uv pip install -e .; patchright install chromium"
Write-Host "  npm run x:login"
Write-Host "  node skills/x/scripts/cli.mjs preflight"
