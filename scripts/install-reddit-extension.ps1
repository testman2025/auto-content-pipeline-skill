$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$ext = Join-Path $repo "tool\reddit-skills\extension"

if (-not (Test-Path (Join-Path $ext "manifest.json"))) {
  Write-Host "[!] 请先执行: npm run tool:install"
  exit 1
}

Write-Host "Reddit Bridge 扩展目录:"
Write-Host "  $ext"
Write-Host ""
Write-Host "在 Chrome 中:"
Write-Host "  1. 打开 chrome://extensions/"
Write-Host "  2. 开启「开发者模式」"
Write-Host "  3. 「加载已解压的扩展程序」→ 选择上面的 extension 目录"
Write-Host ""

$chrome = @(
  "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if ($chrome) {
  Start-Process $chrome "chrome://extensions/"
  Write-Host "[ok] 已打开 Chrome 扩展管理页"
} else {
  Write-Host "[!] 未找到 Chrome，请手动打开 chrome://extensions/"
}
