param(
  [Parameter(Mandatory = $true)]
  [string]$File,
  [string]$Out = "",
  [string]$Theme = "professional",
  [string]$Mode = "auto-split"
)

$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }

$candidates = @(
  (Join-Path $repo "tool/Auto-Redbook-Skills"),
  "D:\test\tool\Auto-Redbook-Skills"
)

$skillRoot = $candidates | Where-Object { Test-Path (Join-Path $_ "scripts/render_xhs.py") } | Select-Object -First 1
if (-not $skillRoot) {
  throw "Auto-Redbook-Skills not found. Run: npm run tool:install"
}

$render = Join-Path $skillRoot "scripts/render_xhs.py"
if (-not (Test-Path $File)) {
  throw "Markdown not found: $File"
}

if ([string]::IsNullOrWhiteSpace($Out)) {
  $base = [System.IO.Path]::GetFileNameWithoutExtension($File)
  $Out = Join-Path "D:\test\hermes\图片\小红书" $base
}

New-Item -ItemType Directory -Force -Path $Out | Out-Null

$python = $env:XHS_CARD_PYTHON
if (-not $python) {
  if (Test-Path "D:\dev\python3\python.exe") {
    $python = "D:\dev\python3\python.exe"
  } else {
    $python = "python"
  }
}

$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONUTF8 = "1"

& $python $render $File -t $Theme -m $Mode -o $Out
if ($LASTEXITCODE -ne 0) {
  throw "xhs-card-render failed, exit $LASTEXITCODE"
}

Write-Host "[ok] images: $Out"
