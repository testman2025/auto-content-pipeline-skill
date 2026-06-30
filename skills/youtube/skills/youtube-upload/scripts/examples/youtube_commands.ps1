# YouTube sau 命令示例（PowerShell）
# 需先: npm run overseas:install ; cd tool/social-auto-upload ; uv pip install -e .

$env:SAU_ROOT = "D:/test/agent/hermes/auto-content-pipeline-skill/tool/social-auto-upload"
$account = "default"

uv run --directory $env:SAU_ROOT sau youtube login --account $account --headed
uv run --directory $env:SAU_ROOT sau youtube check --account $account
uv run --directory $env:SAU_ROOT sau youtube upload-video `
  --account $account `
  --file "D:/test/hermes/视频/demo.mp4" `
  --title "Demo Title" `
  --desc "Demo description" `
  --visibility unlisted `
  --headed
