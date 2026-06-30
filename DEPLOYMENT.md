# auto-content-pipeline 社媒全自动流水线

一条指令触发：选题采集 → 适配矩阵 → 写稿 → 润色 → 配图 → 发布

支持平台：**知乎** · **小红书** · **抖音**

---

## 快速部署（5步）

### 1. 安装外部依赖

```bash
# 知乎发布
uv pip install pyzhihu-cli
zhihu login --qrcode

# 小红书发布
cd /d/tools
git clone https://github.com/autoclaw-cc/xiaohongshu-skills.git
# Chrome → chrome://extensions/ → 加载扩展 → xiaohongshu-skills/extension/

# 抖音发布
npm i -g @panda-video-automation/pva
npx @panda-video-automation/pva douyin login

# 短视频合成（FFmpeg）
# https://ffmpeg.org/download.html 下载，加到 PATH
```

### 2. 配置 API Key

注册 https://www.tokenware.ai → 获取 API Key

编辑 Hermes `.env`（`hermes config env-path` 查看路径），确保有：
```
OPENAI_API_KEY=你的tokenware_API_Key
```

### 3. 安装技能

```bash
# 方式A：克隆 GitHub 仓库
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill

# 方式B：安装到 Hermes
mkdir -p ~/.hermes/skills/publishing
cp -r . ~/.hermes/skills/publishing/auto-content-pipeline

# 方式C：从 SKILL.md 安装
hermes skills install ./SKILL.md
```

### 4. 首次运行

```bash
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：TK小店选品方法"
```

首次运行时会收集一次用户画像，后续不再询问。

### 5. 配图已内置

生图走 tokenware.ai `gpt-image-2` 模型，无需额外配置。FAL 账号余额已耗尽，不要尝试。

### 6. YouTube 发布（单标签完整流程）

```bash
# 推荐：附着到已打开的 Chrome（不新开窗口）
$env:CHROME_CDP_URL = "http://127.0.0.1:9222"
npm run youtube:publish -- "D:/test/hermes/视频/xxx.mp4" "标题"

# 或使用持久化 Playwright 窗口（login 一次，以后同一窗口）
npm run youtube:login
npm run youtube:publish -- "D:/test/hermes/视频/xxx.mp4" "标题"
```

详见 `references/youtube-publishing.md`

---

## 文件结构

```
publishing/auto-content-pipeline/
├── SKILL.md                              # 主技能文件（Hermes加载这个）
├── DEPLOYMENT.md                         # 本文——部署指南
├── user-profile.template.md              # 用户画像模板
├── references/
│   └── tokenware-image-generation.md     # 生图API参考
└── scripts/
    ├── check-deps.sh                     # 依赖检查脚本
    └── setup.sh                          # 一键安装脚本
```

---

## 使用命令

| 指令 | 效果 |
|------|------|
| `hermes -s auto-content-pipeline "今天有什么热点？"` | 选题采集 → 矩阵 → 等你确认后全自动 |
| `hermes -s auto-content-pipeline "帮我把这话题发知乎"` | 直接写+发 |
| `hermes -s auto-content-pipeline "只做选题采集"` | 只出选题清单，不发 |
| `hermes -s auto-content-pipeline "帮我把这篇MD发布到小红书"` | 读本地MD→配图→发布 |

---

## 限制

- 小红书标题限 **20字**
- 首次抖音需 **扫码登录**（一次后永久保存）
- 小红书/抖音依赖本地浏览器，不适合纯服务器环境
- **YouTube**：用 `npm run youtube:login`，不要用 `pva youtube login`（会自动关浏览器）
- pyzhihu-cli 走知乎内部 API，非官方接口
