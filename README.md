# auto-content-pipeline-skill

国内社媒运营全自动流水线 Hermes Skill：选题采集 → 适配矩阵 → 写稿 → 润色 → 配图 → 多平台发布。

支持平台：**知乎** · **小红书** · **抖音（PVA）** · **公众号（baoyu + 微信官方 API）** · **YouTube**

## 平台发布方案（固定）

| 平台 | 方案 |
|------|------|
| 公众号 | baoyu-post-to-wechat + **微信官方 AppID/Secret** |
| 抖音 | **PVA**（`@panda-video-automation/pva`） |

## 快速开始（Windows 推荐）

```powershell
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill
npm run setup:win
```

`setup:win` 会自动：npm 依赖、Python 依赖、baoyu 公众号技能、复制到 Hermes。

## 快速开始（Git Bash / Linux）

```bash
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill
npm run setup
```

### 一次性配置

```bash
hermes config env-path   # 查看 .env 路径
```

在 Hermes `.env` 写入：

- `OPENAI_API_KEY` — tokenware 生图
- `WECHAT_APP_ID` / `WECHAT_APP_SECRET` — 公众号官方 API
- mp.weixin.qq.com → IP 白名单（本地 IP 或服务器 IP）

```powershell
zhihu login --qrcode
npm run douyin:login
# Chrome → chrome://extensions/ → 加载 skills/xiaohongshu/extension/
```

### 运行

```bash
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：TK小店选品方法"
```

## 常用命令

| 指令 | 效果 |
|------|------|
| `npm run setup:win` | Windows 一键安装 |
| `npm run tool:install` | clone tool/ 第三方依赖（baoyu、sau 等） |
| `npm run skills:register` | 注册 skills/ 与 baoyu 到 Hermes |
| `npm run wechat:install` | tool:install + skills:register（兼容旧名） |
| `npm run douyin:login` | 抖音 PVA 扫码登录 |
| `npm run image:check-key` | 检查 tokenware 生图 Key |
| `npm run image:generate -- --platform zhihu --prompt "..." --out "..."` | 生成配图 |
| `hermes -s auto-content-pipeline "今天有什么热点？"` | 选题 → 矩阵 → 确认后全自动 |

## 目录结构

```
auto-content-pipeline-skill/
├── SKILL.md                       # 主编排技能
├── skills/                        # 内置技能包（进 Git）
│   ├── xiaohongshu/
│   ├── youtube/
│   ├── linkedin/
│   ├── tiktok/
│   ├── x/
│   ├── image/                     # tokenware-image 生图
│   └── README.md
├── tool/                          # 安装时 clone（gitignore）
│   ├── baoyu-skills/              # 公众号 + X
│   ├── social-auto-upload/
│   └── openclaw-linkedin-skill/
└── scripts/
    ├── setup.ps1                  # Windows 一键安装
    ├── install-tool-deps.ps1      # clone tool/ 依赖
    └── register-skills.ps1        # 注册到 ~/.hermes/skills/publishing/
```

## 许可

MIT License — 见 [LICENSE](LICENSE)
