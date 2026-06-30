# auto-content-pipeline-skill

国内社媒运营全自动流水线 Hermes Skill：选题采集 → 适配矩阵 → 写稿 → 润色 → 配图 → 多平台发布。

支持平台：**知乎** · **小红书** · **抖音** · **公众号** · **YouTube**

## 快速开始

### 1. 克隆仓库

```bash
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill
```

### 2. 安装依赖

```bash
# Python（知乎发布）
uv pip install -r requirements.txt
zhihu login --qrcode

# Node（抖音发布）
npm install
npx @panda-video-automation/pva douyin login

# 小红书（仓库已内置 xiaohongshu-skills）
cd xiaohongshu-skills
uv sync
# Chrome → chrome://extensions/ → 加载 xiaohongshu-skills/extension/
```

### 3. 配置 API Key

复制模板并在本地 Hermes 环境中配置（**不要提交 `.env`**）：

```bash
hermes config env-path   # 查看 .env 路径
# 写入 OPENAI_API_KEY（tokenware 生图）
```

### 4. 安装到 Hermes

```bash
mkdir -p ~/.hermes/skills/publishing
cp -r . ~/.hermes/skills/publishing/auto-content-pipeline
```

或：

```bash
hermes skills install ./SKILL.md
```

### 5. 首次运行（会创建 user-profile）

```bash
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：TK小店选品方法"
```

首次运行会引导填写 `user-profile.md`（该文件已加入 `.gitignore`，仅存本地）。

## 目录结构

```
auto-content-pipeline-skill/
├── SKILL.md                 # 主技能文件
├── DEPLOYMENT.md            # 部署说明
├── README.md                # 本文件
├── user-profile.template.md # 用户画像模板
├── package.json             # PVA 等 Node 依赖
├── requirements.txt         # pyzhihu-cli
├── references/              # API 参考文档
├── scripts/                 # 安装与依赖检查
├── xiaohongshu-skills/      # 小红书自动化（内置）
└── youtube-skills/          # YouTube 自动化（内置）
    ├── SKILL.md             # 技能路由
    ├── scripts/cli.mjs      # 统一 CLI
    └── skills/              # yt-auth / yt-publish / yt-create / yt-pipeline
```

## 常用命令

| 指令 | 效果 |
|------|------|
| `hermes -s auto-content-pipeline "今天有什么热点？"` | 选题 → 矩阵 → 确认后全自动 |
| `hermes -s auto-content-pipeline "只做选题采集"` | 仅输出选题清单 |
| `bash scripts/check-deps.sh` | 检查依赖与登录态 |
| `node youtube-skills/scripts/cli.mjs pipeline` | YouTube 全流程 |
| `npm run youtube:publish -- --video "..." --title "..."` | YouTube 发布快捷方式 |

## 关联技能

本流水线会按需加载 Hermes 生态中的其他技能，例如：

- `hotspot-monitor` — 热点采集
- `wechat-article-writer` — 写稿
- `humanizer-zh` — 去 AI 味
- `publishing-zhihu` / `publishing-douyin` / `baoyu-post-to-wechat`

## 许可

MIT License — 见 [LICENSE](LICENSE)

小红书子模块基于 [xiaohongshu-skills](https://github.com/xpzouying/xiaohongshu-skills) 上游项目。
