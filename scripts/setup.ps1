$ErrorActionPreference = "Stop"
$repo = Split-Path -Parent $PSScriptRoot

Write-Host "========== auto-content-pipeline 一键安装 =========="

Write-Host "[1/5] npm install..."
Push-Location $repo
npm install
Pop-Location

Write-Host "[2/5] Python 依赖..."
Push-Location $repo
try { uv pip install -r requirements.txt } catch { pip install -r requirements.txt }
Pop-Location

Write-Host "[3/5] skills/xiaohongshu..."
Push-Location (Join-Path $repo "skills/xiaohongshu")
try { uv sync } catch { Write-Host "[warn] uv sync skipped" }
Pop-Location

Write-Host "[4/5] tool/ + Hermes 技能注册..."
& (Join-Path $repo "scripts/install-tool-deps.ps1")
& (Join-Path $repo "scripts/register-skills.ps1")

Write-Host "[5/5] 依赖检查..."
bash (Join-Path $repo "scripts/check-deps.sh")

Write-Host ""
Write-Host "一次性配置:"
Write-Host "  Hermes .env: OPENAI_API_KEY, WECHAT_APP_ID, WECHAT_APP_SECRET"
Write-Host "  zhihu login --qrcode"
Write-Host "  npm run douyin:login"
Write-Host "  Chrome: skills/xiaohongshu/extension/"
