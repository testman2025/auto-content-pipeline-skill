$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot
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
    Write-Host "[ok] created conf.py from conf.example.py"
  }
  return $dest
}

$sau = Ensure-Clone "social-auto-upload" "https://github.com/dreammis/social-auto-upload.git"
$li = Ensure-Clone "openclaw-linkedin-skill" "https://github.com/jarvis-survives/openclaw-linkedin-skill.git"

function Ensure-BaoyuPostToX {
  $dest = Join-Path $tool "baoyu-skills"
  $skillMd = Join-Path $dest "skills/baoyu-post-to-x/SKILL.md"
  if (Test-Path $skillMd) {
    Write-Host "[ok] baoyu-post-to-x already present"
    return $dest
  }
  if (Test-Path $dest) {
    Remove-Item $dest -Recurse -Force
  }
  Write-Host "[clone] baoyu-skills (sparse: baoyu-post-to-x)"
  git clone --depth 1 --filter=blob:none --sparse "https://github.com/JimLiu/baoyu-skills.git" $dest
  Push-Location $dest
  git sparse-checkout set skills/baoyu-post-to-x
  Pop-Location
  $scripts = Join-Path $dest "skills/baoyu-post-to-x/scripts"
  if (Test-Path (Join-Path $scripts "package.json")) {
    Write-Host "[npm] installing baoyu-post-to-x script deps..."
    Push-Location $scripts
    npm install --omit=dev
    Pop-Location
  }
  return $dest
}

$baoyu = Ensure-BaoyuPostToX

Write-Host ""
Write-Host "Next steps:"
Write-Host "  cd $sau"
Write-Host "  uv pip install -e ."
Write-Host "  patchright install chromium"
Write-Host ""
Write-Host "X (Twitter):"
Write-Host "  npm run x:login"
Write-Host "  npm run x:publish -- --text `"Hello`""
Write-Host ""
Write-Host "Verify:"
Write-Host "  uv run --directory $sau sau youtube --help"
Write-Host "  node x-skills/scripts/cli.mjs preflight"
