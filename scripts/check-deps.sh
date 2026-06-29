#!/usr/bin/env bash
# auto-content-pipeline 依赖检查脚本
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0

check() {
  if command -v "$1" &>/dev/null; then
    echo -e "${GREEN}✅ $1${NC}"
    pass=$((pass+1))
  else
    echo -e "${RED}❌ $1 — 未安装${NC}"
    fail=$((fail+1))
  fi
}

echo "========== auto-content-pipeline 依赖检查 =========="
echo ""

echo "--- 系统工具 ---"
check ffmpeg

echo ""
echo "--- Python 工具 ---"
if python -c "import pyzhihu" 2>/dev/null; then
  echo -e "${GREEN}✅ pyzhihu-cli${NC}"; pass=$((pass+1))
else
  echo -e "${RED}❌ pyzhihu-cli — 未安装 (uv pip install pyzhihu-cli)${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- Node 工具 ---"
check node
if npx @panda-video-automation/pva --version &>/dev/null 2>&1; then
  echo -e "${GREEN}✅ @panda-video-automation/pva${NC}"; pass=$((pass+1))
else
  echo -e "${RED}❌ @panda-video-automation/pva — 未安装 (npm i -g @panda-video-automation/pva)${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- 小红书 ---"
if [ -f "$BASE_DIR/xiaohongshu-skills/scripts/cli.py" ]; then
  echo -e "${GREEN}✅ xiaohongshu-skills (内置)${NC}"; pass=$((pass+1))
else
  echo -e "${YELLOW}⚠️  xiaohongshu-skills — 未找到${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- 知乎登录态 ---"
if [ -f "$HOME/.zhihu-cli/cookies.json" ]; then
  echo -e "${GREEN}✅ 知乎已登录${NC}"; pass=$((pass+1))
else
  echo -e "${YELLOW}⚠️  知乎未登录 (zhihu login --qrcode)${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- API Key ---"
env_path=$(hermes config env-path 2>/dev/null || echo "")
if [ -n "$env_path" ] && grep -q "OPENAI_API_KEY" "$env_path" 2>/dev/null; then
  echo -e "${GREEN}✅ tokenware API Key 已配置${NC}"; pass=$((pass+1))
else
  echo -e "${YELLOW}⚠️  tokenware API Key 未配置${NC}"; fail=$((fail+1))
fi

echo ""
echo "============================================"
echo -e "通过: ${GREEN}$pass${NC}  失败: ${RED}$fail${NC}"
echo "============================================"
