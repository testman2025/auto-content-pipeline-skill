$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot

& (Join-Path $repo "scripts/install-tool-deps.ps1")

Write-Host ""
Write-Host "Next steps:"
Write-Host "  npm run skills:register"
Write-Host "  cd tool/social-auto-upload; copy conf.example.py conf.py"
Write-Host "  # 国内: 编辑 conf.py 设置 YT_PROXY"
Write-Host "  `$env:OVERSEAS_ALLOW_AUTOMATION='true'; npm run youtube:login"
Write-Host "  npm run youtube:publish -- --video ... --title ..."
