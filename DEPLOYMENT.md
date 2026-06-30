# auto-content-pipeline 社媒全自动流水线

**8 年社媒运营老兵 Agent** — 一条指令：选题 → 矩阵 → 写稿 → 润色 → 配图 → 发布

支持平台：**知乎** · **小红书** · **抖音（PVA）** · **公众号（baoyu 官方 API）** · **YouTube** · **LinkedIn** · **TikTok** · **X**

---

## 已验证发布能力（2026-06-30）

| 平台 | 状态 | 命令示例 |
|------|------|----------|
| **YouTube** | ✅ 已跑通 | `npm run youtube:publish -- --video "..." --title "..."` |
| **公众号** | ✅ 已跑通 | baoyu `wechat-api.ts` → 草稿箱 |
| **抖音** | ✅ 已跑通 | `npm run douyin:login` → `npm run douyin:upload` |
| **配图** | ✅ 已跑通 | `npm run image:generate -- --platform zhihu ...` |
| **知乎** | ✅ 链路就绪 | `npm run zhihu:login` → `npm run zhihu:publish -- --title ... --content-file ...` |
| **小红书** | ✅ 链路就绪 | `skills/xiaohongshu/scripts/cli.py publish ...` |
| **TikTok** | ✅ 链路就绪 | `npm run tiktok:publish` |
| **LinkedIn** | ⚠️ 登录已修复，发帖停用 | 默认只生成文稿 |
| **X** | ⚠️ 链路已接入，发帖停用 | 默认只生成文稿 |

---

## 平台发布方案（固定，勿混用）

| 平台 | 方案 | 用户配置 |
|------|------|----------|
| **公众号** | baoyu-post-to-wechat + 微信官方 API | `WECHAT_APP_ID` / `WECHAT_APP_SECRET` + IP 白名单 |
| **抖音** | PVA | `npm run douyin:login` 扫码一次 |

不使用 wx.limyai、douyin-publish（MCP）等替代路径。

---

## 快速部署（3 步）

### 1. 一键安装

**Windows（推荐）：**

```powershell
git clone git@github.com:testman2025/auto-content-pipeline-skill.git
cd auto-content-pipeline-skill
npm run setup:win
```

**Git Bash：**

```bash
npm run setup
```

安装内容：npm（含 PVA）、pyzhihu-cli、skills/xiaohongshu、baoyu 公众号技能、主技能复制到 `~/.hermes/skills/publishing/`。

### 2. 配置 Hermes `.env`

```bash
hermes config env-path
```

```
OPENAI_API_KEY=你的tokenware_Key
WECHAT_APP_ID=公众号AppID
WECHAT_APP_SECRET=公众号AppSecret
```

微信公众平台 → 设置 → IP 白名单：加入本机或服务器公网 IP。

### 3. 首次登录（各平台一次）

```powershell
zhihu login --qrcode
npm run douyin:login
# Chrome 加载 skills/xiaohongshu/extension/
```

### 4. 运行

```bash
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：TK小店选品方法"
```

---

## 公众号发布流程（baoyu）

1. `npm run wechat:install` — sparse-clone `JimLiu/baoyu-skills`（markdown-to-html + post-to-wechat）
2. Step 4：`baoyu-markdown-to-html` 转 HTML
3. Step 5：`bun scripts/wechat-api.ts article.md --title "..." --cover cover.jpg`
4. 草稿箱预览 → 人工群发

本地 IP 不在微信白名单时，使用 baoyu 技能内的 **remote-api**（SSH 隧道），见 `tool/baoyu-skills/skills/baoyu-post-to-wechat/SKILL.md`。

---

## 抖音发布流程（PVA）

```powershell
npm run douyin:login
npx @panda-video-automation/pva douyin upload --video "D:/test/hermes/视频/xxx.mp4" --title "标题 #话题"
```

---

## 文件结构

```
auto-content-pipeline-skill/
├── SKILL.md
├── skills/                      # 内置技能（进 Git）
│   ├── xiaohongshu/
│   ├── youtube/
│   ├── linkedin/
│   ├── tiktok/
│   ├── x/
│   └── image/
├── tool/                        # 安装时 clone（gitignore）
│   └── baoyu-skills/            # wechat + x
└── scripts/
    ├── setup.ps1
    ├── install-tool-deps.ps1
    └── register-skills.ps1
```

---

## 使用命令

| 指令 | 效果 |
|------|------|
| `hermes -s auto-content-pipeline "今天有什么热点？"` | 选题 → 矩阵 → 确认后全自动 |
| `npm run check` | 依赖与 WECHAT_* / PVA 检查 |
| `npm run tool:install` | clone tool/ 依赖 |
| `npm run skills:register` | 注册 Hermes 技能 |
| `npm run wechat:install` | tool:install + skills:register |

---

## 限制

- 小红书标题限 **20字**
- 公众号 API 需 **IP 白名单**
- 抖音/小红书依赖本地 Chrome
- 配图走 tokenware `gpt-image-2`（`tokenware-image` 技能）
