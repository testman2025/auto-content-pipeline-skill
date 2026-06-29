#!/usr/bin/env bash
# auto-content-pipeline 一键安装脚本
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========== auto-content-pipeline 一键安装 =========="
echo ""

# 1. 检查 ffmpeg
echo -e "${YELLOW}[1/5] 检查 ffmpeg${NC}"
if command -v ffmpeg &>/dev/null; then
  echo -e "${GREEN}✅ ffmpeg 已在 PATH${NC}"
elif [ -f "$BASE_DIR/bin/ffmpeg.exe" ]; then
  mkdir -p ~/bin
  cp "$BASE_DIR/bin/ffmpeg.exe" ~/bin/
  if [[ ":$PATH:" != *":$HOME/bin:"* ]]; then
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    export PATH="$HOME/bin:$PATH"
  fi
  echo -e "${GREEN}✅ ffmpeg 已从 bin/ 配置${NC}"
else
  echo -e "${YELLOW}⚠️  ffmpeg 未安装，请从 https://ffmpeg.org/download.html 安装并加入 PATH${NC}"
fi

# 2. 安装 pyzhihu-cli
echo ""
echo -e "${YELLOW}[2/5] 安装 pyzhihu-cli${NC}"
uv pip install -r "$BASE_DIR/requirements.txt" 2>/dev/null || pip install -r "$BASE_DIR/requirements.txt"
echo -e "${GREEN}✅ pyzhihu-cli 已安装${NC}"

# 3. 安装 xiaohongshu-skills 依赖
echo ""
echo -e "${YELLOW}[3/5] 配置 xiaohongshu-skills${NC}"
cd "$BASE_DIR/xiaohongshu-skills"
uv sync 2>/dev/null || pip install -r requirements.txt 2>/dev/null || echo -e "${YELLOW}⚠️  请手动安装 xiaohongshu-skills 依赖${NC}"
echo -e "${GREEN}✅ xiaohongshu-skills 已配置${NC}"
echo -e "${YELLOW}⚠️  Chrome扩展需要手动加载：chrome://extensions/ → 开发者模式 → 加载已解压扩展 → 选择 xiaohongshu-skills/extension/${NC}"

# 4. 安装 PVA
echo ""
echo -e "${YELLOW}[4/5] 安装 @panda-video-automation/pva${NC}"
cd "$BASE_DIR"
npm install --production 2>/dev/null || npm i -g @panda-video-automation/pva
echo -e "${GREEN}✅ PVA 已安装${NC}"

# 5. 安装技能到 Hermes
echo ""
echo -e "${YELLOW}[5/5] 安装技能到 Hermes${NC}"
mkdir -p ~/.hermes/skills/publishing
cp -r "$BASE_DIR" ~/.hermes/skills/publishing/auto-content-pipeline
echo -e "${GREEN}✅ 技能已安装到 ~/.hermes/skills/publishing/auto-content-pipeline/${NC}"

echo ""
echo "========== 安装完成 =========="
echo ""
echo "下一步："
echo "1. 知乎登录:  zhihu login --qrcode"
echo "2. 抖音登录:  npx @panda-video-automation/pva douyin login"
echo "3. Chrome加载扩展: chrome://extensions/ → 开发者模式 → 加载已解压扩展"
echo "4. 配置API Key: hermes config env-path → 写入 OPENAI_API_KEY"
echo "5. 验证安装:  bash scripts/check-deps.sh"
echo ""
echo "然后运行: hermes -s auto-content-pipeline -q \"帮我跑一篇内容，话题：TK运营\""
