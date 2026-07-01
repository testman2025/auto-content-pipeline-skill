$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$tool = Join-Path $repo "tool"

New-Item -ItemType Directory -Force -Path $tool | Out-Null

function Ensure-Clone($name, $url) {
  $dest = Join-Path $tool $name
  if (Test-Path (Join-Path $dest ".git")) {
    Write-Host "[ok] $name already cloned"
    return $dest
  }
  if (Test-Path $dest) {
    Remove-Item $dest -Recurse -Force
  }
  Write-Host "[clone] $url -> $dest"
  git clone --depth 1 $url $dest
  $confExample = Join-Path $dest "conf.example.py"
  $conf = Join-Path $dest "conf.py"
  if ((Test-Path $confExample) -and -not (Test-Path $conf)) {
    Copy-Item $confExample $conf
  }
  return $dest
}

$requiredBaoyu = @("baoyu-post-to-x", "baoyu-markdown-to-html", "baoyu-post-to-wechat")
$dest = Join-Path $tool "baoyu-skills"

$allPresent = ($requiredBaoyu | ForEach-Object {
  Test-Path (Join-Path $dest "skills/$_/SKILL.md")
}) -notcontains $false

if (-not $allPresent) {
  if (Test-Path $dest) {
    Remove-Item $dest -Recurse -Force
  }
  Write-Host "[clone] JimLiu/baoyu-skills (sparse)"
  git clone --depth 1 --filter=blob:none --sparse "https://github.com/JimLiu/baoyu-skills.git" $dest
  Push-Location $dest
  git sparse-checkout set @($requiredBaoyu | ForEach-Object { "skills/$_" })
  Pop-Location
}

foreach ($name in $requiredBaoyu) {
  $scripts = Join-Path $dest "skills/$name/scripts"
  $pkg = Join-Path $scripts "package.json"
  if (-not (Test-Path $pkg)) { continue }
  if (Test-Path (Join-Path $scripts "node_modules")) { continue }
  Write-Host "[npm] $name"
  Push-Location $scripts
  npm install --omit=dev
  Pop-Location
}

$autoRedbook = Ensure-Clone "Auto-Redbook-Skills" "https://github.com/comeonzhj/Auto-Redbook-Skills.git"
$patchRender = Join-Path $repo "scripts/patches/auto-redbook-render_xhs.py"
if ((Test-Path $patchRender) -and (Test-Path $autoRedbook)) {
  Copy-Item $patchRender (Join-Path $autoRedbook "scripts/render_xhs.py") -Force
  Write-Host "[patch] Auto-Redbook render_xhs.py (heading orphan fix)"
}
$customThemes = Join-Path $repo "assets/xhs-themes"
$patchThemes = Join-Path $repo "scripts/patches/xhs-themes"
$toolThemes = Join-Path $autoRedbook "assets/themes"
foreach ($src in @($patchThemes, $customThemes)) {
  if ((Test-Path $src) -and (Test-Path $toolThemes)) {
    Get-ChildItem $src -Filter "*.css" -ErrorAction SilentlyContinue | ForEach-Object {
      Copy-Item $_.FullName (Join-Path $toolThemes $_.Name) -Force
      Write-Host "[theme] $($_.Name) -> Auto-Redbook assets/themes/"
    }
  }
}
if (Test-Path (Join-Path $autoRedbook "requirements.txt")) {
  $python = if (Test-Path "D:\dev\python3\python.exe") { "D:\dev\python3\python.exe" } else { "python" }
  Write-Host "[pip] Auto-Redbook-Skills (markdown pyyaml playwright)"
  & $python -m pip install -r (Join-Path $autoRedbook "requirements.txt") -q
  & $python -m playwright install chromium
}

Ensure-Clone "social-auto-upload" "https://github.com/dreammis/social-auto-upload.git" | Out-Null
Ensure-Clone "openclaw-linkedin-skill" "https://github.com/jarvis-survives/openclaw-linkedin-skill.git" | Out-Null
$reddit = Ensure-Clone "reddit-skills" "https://github.com/1146345502/reddit-skills.git"
if (Test-Path (Join-Path $reddit "pyproject.toml")) {
  Write-Host "[uv] reddit-skills"
  Push-Location $reddit
  uv sync
  Pop-Location
  node (Join-Path $repo "scripts/patch-reddit-publish.mjs")
}

Write-Host "[ok] tool/ dependencies ready"
