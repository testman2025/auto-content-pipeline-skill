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
  return $dest
}

$sau = Ensure-Clone "social-auto-upload" "https://github.com/dreammis/social-auto-upload.git"
$li = Ensure-Clone "openclaw-linkedin-skill" "https://github.com/jarvis-survives/openclaw-linkedin-skill.git"

Write-Host ""
Write-Host "Next steps:"
Write-Host "  cd $sau"
Write-Host "  uv pip install -e ."
Write-Host "  patchright install chromium"
Write-Host ""
Write-Host "Verify:"
Write-Host "  uv run --directory $sau sau youtube --help"
