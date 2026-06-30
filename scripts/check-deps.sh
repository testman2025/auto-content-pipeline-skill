# auto-content-pipeline 依赖检查
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
  echo -e "${RED}❌ @panda-video-automation/pva — 未安装 (npm install)${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- 内置技能 (skills/) ---"
if [ -f "$BASE_DIR/skills/xiaohongshu/scripts/cli.py" ]; then
  echo -e "${GREEN}✅ skills/xiaohongshu${NC}"; pass=$((pass+1))
else
  echo -e "${RED}❌ skills/xiaohongshu — 未找到${NC}"; fail=$((fail+1))
fi
if [ -f "$BASE_DIR/skills/image/skills/tokenware-image/SKILL.md" ]; then
  echo -e "${GREEN}✅ tokenware-image${NC}"; pass=$((pass+1))
else
  echo -e "${RED}❌ tokenware-image — 未找到${NC}"; fail=$((fail+1))
fi

echo ""
echo "--- 配图 (tokenware) ---"
if command -v uv &>/dev/null || command -v python &>/dev/null; then
  if uv run python "$BASE_DIR/skills/image/scripts/cli.py" check-key &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ tokenware OPENAI_API_KEY 可读${NC}"; pass=$((pass+1))
  elif python "$BASE_DIR/skills/image/scripts/cli.py" check-key &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ tokenware OPENAI_API_KEY 可读${NC}"; pass=$((pass+1))
  else
    echo -e "${YELLOW}⚠️  tokenware Key 未配置或无效${NC}"; fail=$((fail+1))
  fi
fi

echo ""
echo "--- 公众号 (baoyu + 官方 API) ---"
if [ -f "$BASE_DIR/tool/baoyu-skills/skills/baoyu-post-to-wechat/SKILL.md" ]; then
  echo -e "${GREEN}✅ baoyu-post-to-wechat (tool/)${NC}"; pass=$((pass+1))
else
  echo -e "${YELLOW}⚠️  baoyu-post-to-wechat — 运行 npm run tool:install${NC}"; fail=$((fail+1))
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
if [ -n "$env_path" ] && grep -qE "^WECHAT_APP_ID=" "$env_path" 2>/dev/null; then
  echo -e "${GREEN}✅ 公众号 AppID 已配置${NC}"; pass=$((pass+1))
else
  echo -e "${YELLOW}⚠️  公众号 AppID 未配置${NC}"; fail=$((fail+1))
fi

echo ""
echo "============================================"
echo -e "通过: ${GREEN}$pass${NC}  失败: ${RED}$fail${NC}"
echo "============================================"
