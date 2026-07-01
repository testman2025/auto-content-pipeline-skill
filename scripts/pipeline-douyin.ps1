param(
  [string]$File = "",
  [string]$Slug = "",
  [string]$Out = "",
  [string]$Voice = "",
  [string]$HermesRoot = ""
)

$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }

function Get-HermesRoot {
  param([string]$Override)
  if (-not [string]::IsNullOrWhiteSpace($Override)) {
    return $Override.TrimEnd('\', '/')
  }
  if ($env:HERMES_ROOT) {
    return $env:HERMES_ROOT.TrimEnd('\', '/')
  }
  return "D:\test\hermes"
}

$root = Get-HermesRoot -Override $HermesRoot
$articleDir = Join-Path $root "文章\抖音"

if ([string]::IsNullOrWhiteSpace($Slug) -and $env:DOUYIN_SLUG) {
  $Slug = $env:DOUYIN_SLUG
}

if ([string]::IsNullOrWhiteSpace($File) -and -not [string]::IsNullOrWhiteSpace($Slug)) {
  $candidates = @(
    (Join-Path $articleDir "$Slug.md"),
    (Join-Path $articleDir "${Slug}_抖音.md")
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) {
      $File = $c
      break
    }
  }
  if ([string]::IsNullOrWhiteSpace($File) -and (Test-Path $articleDir)) {
    $match = Get-ChildItem $articleDir -Filter "*.md" | Where-Object { $_.Name -like "*$Slug*" } | Select-Object -First 1
    if ($match) { $File = $match.FullName }
  }
}

if ([string]::IsNullOrWhiteSpace($File)) {
  throw "Required: -File or -Slug (中文 Slug 在 npm 下可能乱码，请用 -File 或 `$env:DOUYIN_SLUG` 或日期前缀如 -Slug 20260629)"
}

if (-not (Test-Path $File)) {
  throw "Markdown not found: $File"
}

$File = (Resolve-Path $File).Path
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($File) -replace '_抖音$',''

if ([string]::IsNullOrWhiteSpace($Out)) {
  $Out = Join-Path $root "视频\$baseName"
}

New-Item -ItemType Directory -Force -Path $Out | Out-Null

Write-Host "[pipeline:douyin] md: $File"
Write-Host "[pipeline:douyin] out: $Out"

$cliArgs = @("skills/douyin/scripts/cli.mjs", "create-video", "--file", $File, "--out", $Out)
if (-not [string]::IsNullOrWhiteSpace($Voice)) {
  $cliArgs += @("--voice", $Voice)
}
Push-Location $repo
try {
  node @cliArgs
  if ($LASTEXITCODE -ne 0) { throw "douyin:create-video failed with exit $LASTEXITCODE" }
} finally {
  Pop-Location
}

$manifestPath = Join-Path $Out "manifest.json"
if (-not (Test-Path $manifestPath)) {
  throw "manifest.json not found: $manifestPath"
}

$manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (-not (Test-Path $manifest.videoPath)) {
  throw "MP4 not found: $($manifest.videoPath)"
}

$len = (Get-Item $manifest.videoPath).Length
Write-Host "[pipeline:douyin] ok: $($manifest.videoPath) ($len bytes)"
