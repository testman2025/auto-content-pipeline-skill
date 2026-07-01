# auto-content-pipeline-skill

**8 年社媒运营老兵 Agent** — Hermes Skill：选题研判 → 适配矩阵 → 写稿润色 → 配图 → 多平台发布。

支持平台：**知乎** · **小红书** · **抖音（PVA）** · **公众号（baoyu + 微信官方 API）** · **YouTube** · **TikTok** · **LinkedIn** · **X**

## 已验证发布能力（2026-06-30）

| 平台 | 状态 | 方案 |
|------|------|------|
| YouTube | ✅ 已跑通 | sau / Playwright |
| 公众号 | ✅ 已跑通 | baoyu + 微信官方 API |
| 抖音 | ✅ 已跑通 | PVA + **pipeline:douyin** 花字视频 |
| 配图 | ✅ 已跑通 | tokenware-image |
| 知乎 / 小红书 / TikTok | ✅ 链路就绪 | 见 DEPLOYMENT.md |
| LinkedIn / X | ⚠️ 只出稿 | 自动发帖因风控停用 |

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

`setup:win` 会自动：npm 依赖、Python 依赖、tool/ 第三方技能、注册到 Hermes。

## 运行

```bash
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：TK小店选品方法"
```

Agent 会先出适配矩阵等你确认，确认后全自动写稿、配图、按 `user-profile.md` 分发。

## 常用命令

| 指令 | 效果 |
|------|------|
| `npm run setup:win` | Windows 一键安装 |
| `npm run tool:install` | clone tool/ 第三方依赖 |
| `npm run skills:register` | 注册 skills/ 到 Hermes |
| `npm run youtube:publish` | YouTube 发布 |
| `npm run pipeline:xhs` | 小红书 MD → 卡片 PNG |
| `npm run pipeline:douyin` | 抖音口播 MD → 花字竖版 MP4 |
| `npm run douyin:login` | 抖音 PVA 扫码登录 |
| `npm run image:generate` | tokenware 生图 |
| `npm run check` | 依赖与登录态检查 |

## 目录结构

```
auto-content-pipeline-skill/
├── SKILL.md                       # 老兵 Agent 主编排
├── skills/                        # 内置技能包（进 Git）
│   ├── xiaohongshu/
│   ├── youtube/
│   ├── linkedin/
│   ├── tiktok/
│   ├── x/
│   ├── image/
│   ├── douyin/
│   └── README.md
├── tool/                          # 安装时 clone（gitignore）
└── scripts/
    ├── setup.ps1
    ├── install-tool-deps.ps1
    └── register-skills.ps1
```

## 许可

MIT License — 见 [LICENSE](LICENSE)
