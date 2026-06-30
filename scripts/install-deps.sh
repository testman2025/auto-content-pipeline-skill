#!/usr/bin/env bash
# auto-content-pipeline 一键安装
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========== auto-content-pipeline 一键安装 =========="

echo -e "${YELLOW}[1/6] npm install (PVA)${NC}"
cd "$BASE_DIR"
npm install

echo -e "${YELLOW}[2/6] pyzhihu-cli${NC}"
uv pip install -r "$BASE_DIR/requirements.txt" 2>/dev/null || pip install -r "$BASE_DIR/requirements.txt"

echo -e "${YELLOW}[3/6] skills/xiaohongshu${NC}"
cd "$BASE_DIR/skills/xiaohongshu"
uv sync 2>/dev/null || pip install -r requirements.txt 2>/dev/null || true
echo -e "${YELLOW}⚠️  Chrome 扩展: skills/xiaohongshu/extension/${NC}"

echo -e "${YELLOW}[4/6] tool/ 外部依赖 (baoyu + sau)${NC}"
if command -v powershell.exe &>/dev/null; then
  powershell.exe -ExecutionPolicy Bypass -File "$BASE_DIR/scripts/install-tool-deps.ps1"
else
  echo -e "${YELLOW}⚠️  请手动运行 scripts/install-tool-deps.ps1${NC}"
fi

echo -e "${YELLOW}[5/6] 注册 Hermes 技能${NC}"
if command -v powershell.exe &>/dev/null; then
  powershell.exe -ExecutionPolicy Bypass -File "$BASE_DIR/scripts/register-skills.ps1"
fi

echo -e "${YELLOW}[6/6] 依赖检查${NC}"
bash "$BASE_DIR/scripts/check-deps.sh"

echo ""
echo "下一步:"
echo "  Hermes .env: OPENAI_API_KEY, WECHAT_APP_ID, WECHAT_APP_SECRET"
echo "  zhihu login --qrcode"
echo "  npm run douyin:login"
echo "  Chrome 加载 skills/xiaohongshu/extension/"
