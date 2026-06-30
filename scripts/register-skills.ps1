$ErrorActionPreference = "Stop"
$repo = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { Get-Location }
$skillsRoot = Join-Path $repo "skills"
$toolBaoyu = Join-Path $repo "tool/baoyu-skills/skills"
$hermesPublishing = Join-Path $env:USERPROFILE ".hermes/skills/publishing"

New-Item -ItemType Directory -Force -Path $hermesPublishing | Out-Null

function Register-SkillDir($src, $name) {
  if (-not (Test-Path (Join-Path $src "SKILL.md"))) {
    Write-Host "[skip] $name — no SKILL.md"
    return
  }
  $target = Join-Path $hermesPublishing $name
  if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
  }
  Copy-Item -Recurse $src $target
  Write-Host "[ok] Hermes skill: $name"
}

Write-Host "=== Register bundled skills ==="

Get-ChildItem $skillsRoot -Directory -ErrorAction SilentlyContinue | ForEach-Object {
  $nested = Join-Path $_.FullName "skills"
  if (-not (Test-Path $nested)) {
    return
  }
  Get-ChildItem $nested -Directory | ForEach-Object {
    Register-SkillDir $_.FullName $_.Name
  }
}

if (Test-Path $toolBaoyu) {
  @("baoyu-post-to-wechat", "baoyu-markdown-to-html") | ForEach-Object {
    $src = Join-Path $toolBaoyu $_
    if (Test-Path $src) {
      Register-SkillDir $src $_
    }
  }
}

$toolReddit = Join-Path $repo "tool/reddit-skills/skills"
if (Test-Path $toolReddit) {
  Get-ChildItem $toolReddit -Directory | ForEach-Object {
    Register-SkillDir $_.FullName $_.Name
  }
}

Write-Host ""
Write-Host "Main pipeline: copy repo to auto-content-pipeline"
$mainTarget = Join-Path $hermesPublishing "auto-content-pipeline"
if (Test-Path $mainTarget) {
  Remove-Item $mainTarget -Recurse -Force
}
Copy-Item -Recurse $repo $mainTarget
Write-Host "[ok] auto-content-pipeline -> $mainTarget"
