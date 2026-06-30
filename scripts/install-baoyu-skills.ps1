# 兼容旧命令：请改用 npm run tool:install 与 npm run skills:register
$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
Write-Host "[deprecated] install-baoyu-skills.ps1 -> tool:install + skills:register"
& (Join-Path $repo "scripts/install-tool-deps.ps1")
& (Join-Path $repo "scripts/register-skills.ps1")
