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
$articleDir = Join-Path $root "文章\TikTok"

if ([string]::IsNullOrWhiteSpace($Slug) -and $env:TIKTOK_SLUG) {
  $Slug = $env:TIKTOK_SLUG
}

if ([string]::IsNullOrWhiteSpace($File) -and -not [string]::IsNullOrWhiteSpace($Slug)) {
  $candidates = @(
    (Join-Path $articleDir "$Slug.md"),
    (Join-Path $articleDir "${Slug}_TikTok.md")
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
  throw "Required: -File or -Slug"
}

if (-not (Test-Path $File)) {
  throw "Markdown not found: $File"
}

$File = (Resolve-Path $File).Path
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($File) -replace '_TikTok$','' -replace '_tiktok$',''

if ([string]::IsNullOrWhiteSpace($Out)) {
  $Out = Join-Path $root "视频\TikTok\$baseName"
}

New-Item -ItemType Directory -Force -Path $Out | Out-Null

Write-Host "[pipeline:tiktok] md: $File"
Write-Host "[pipeline:tiktok] out: $Out"

$cliArgs = @("skills/tiktok/scripts/cli.mjs", "create-video", "--file", $File, "--out", $Out)
if (-not [string]::IsNullOrWhiteSpace($Voice)) {
  $cliArgs += @("--voice", $Voice)
}

Push-Location $repo
try {
  node @cliArgs
  if ($LASTEXITCODE -ne 0) { throw "tiktok:create-video failed with exit $LASTEXITCODE" }
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
Write-Host "[pipeline:tiktok] ok: $($manifest.videoPath) ($len bytes, $($manifest.duration)s)"
