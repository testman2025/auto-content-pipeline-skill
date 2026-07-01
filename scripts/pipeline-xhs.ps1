param(
  [string]$File = "",
  [string]$Slug = "",
  [string]$Out = "",
  [string]$Theme = "",
  [string]$Mode = "auto-split",
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

function Get-ProfileTheme {
  $profilePath = Join-Path $repo "user-profile.md"
  if (-not (Test-Path $profilePath)) {
    return "professional"
  }
  $content = Get-Content $profilePath -Raw -Encoding UTF8
  if ($content -match '默认主题:\s*(\S+)') {
    return $Matches[1].Trim()
  }
  return "professional"
}

function Test-MarkdownFrontmatter {
  param([string]$Path)
  $head = Get-Content $Path -TotalCount 20 -Encoding UTF8
  $text = $head -join "`n"
  return ($text -match '(?ms)^---\s*\r?\n.*?\r?\n---\s*\r?\n')
}

$root = Get-HermesRoot -Override $HermesRoot
$articleDir = Join-Path $root "文章\小红书"
$imageDir = Join-Path $root "图片\小红书"

if ([string]::IsNullOrWhiteSpace($File) -and -not [string]::IsNullOrWhiteSpace($Slug)) {
  $File = Join-Path $articleDir "$Slug.md"
}

if ([string]::IsNullOrWhiteSpace($File)) {
  throw "Required: -File or -Slug"
}

if (-not (Test-Path $File)) {
  throw "Markdown not found: $File"
}

$File = (Resolve-Path $File).Path

if (-not (Test-MarkdownFrontmatter -Path $File)) {
  throw "Missing YAML frontmatter: $File"
}

$baseName = [System.IO.Path]::GetFileNameWithoutExtension($File)
if ([string]::IsNullOrWhiteSpace($Out)) {
  $Out = Join-Path $imageDir $baseName
}

if ([string]::IsNullOrWhiteSpace($Theme)) {
  $Theme = Get-ProfileTheme
}

New-Item -ItemType Directory -Force -Path $Out | Out-Null

Write-Host "[pipeline:xhs] md: $File"
Write-Host "[pipeline:xhs] out: $Out"
Write-Host "[pipeline:xhs] theme: $Theme mode: $Mode"

$renderScript = Join-Path $PSScriptRoot "xhs-card-render.ps1"
& $renderScript -File $File -Out $Out -Theme $Theme -Mode $Mode
if ($LASTEXITCODE -ne 0) {
  throw "pipeline:xhs render failed, exit $LASTEXITCODE"
}

$images = @()
$cover = Join-Path $Out "cover.png"
if (Test-Path $cover) {
  $images += (Resolve-Path $cover).Path
}
Get-ChildItem $Out -Filter "card_*.png" | Sort-Object {
  $n = $_.BaseName.Replace("card_", "")
  if ($n -match '^\d+$') { [int]$n } else { 9999 }
} | ForEach-Object {
  $images += $_.FullName
}

$manifest = [ordered]@{
  generated_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  source_md    = $File
  output_dir   = (Resolve-Path $Out).Path
  theme        = $Theme
  mode         = $Mode
  image_count  = $images.Count
  images       = $images
}
$manifestPath = Join-Path $Out "manifest.json"
$manifest | ConvertTo-Json -Depth 4 | Set-Content $manifestPath -Encoding UTF8

Write-Host "[ok] pipeline:xhs done, images: $($images.Count)"
Write-Host "     manifest: $manifestPath"
foreach ($img in $images) {
  Write-Host "       - $img"
}
