# auto-content-pipeline 社媒全自动流水线

**8 年社媒运营老兵 Agent** — 一条指令：选题 → 矩阵 → 写稿 → 润色 → 配图 → 发布

支持平台：**知乎** · **小红书** · **抖音（PVA）** · **公众号（baoyu 官方 API）** · **YouTube** · **LinkedIn** · **TikTok** · **X**

---

## 已验证发布能力（2026-06-30）

| 平台 | 状态 | 命令示例 |
|------|------|----------|
| **YouTube** | ✅ 已跑通 | `npm run youtube:publish -- --video "..." --title "..."` |
| **公众号** | ✅ 已跑通 | baoyu `wechat-api.ts` → 草稿箱 |
| **抖音** | ✅ 已跑通 | `npm run pipeline:douyin` → `npm run douyin:upload` |
| **配图** | ✅ 已跑通 | `npm run image:generate -- --platform zhihu ...` |
| **知乎** | ✅ 链路就绪 | `npm run zhihu:login` → `npm run zhihu:publish -- --title ... --content-file ...` |
| **小红书** | ✅ 链路就绪 | `skills/xiaohongshu/scripts/cli.py publish ...` |
| **TikTok** | ✅ 链路就绪 | `npm run pipeline:tiktok` → `npm run tiktok:publish` |
| **LinkedIn** | ⚠️ 个人号已接 linkedin-cli | `npm run linkedin:login` → `linkedin:publish`；公司号预留 |
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

## 抖音视频创作 + 发布

口播稿 → 黑底花字竖版 MP4（Edge TTS + ffmpeg ASS，无需新 API Key）：

```powershell
npm run pipeline:douyin -- -File "D:/test/hermes/文章/抖音/xxx.md"
# 或
npm run pipeline:douyin -- -Slug 20260629_独立站TK双店SOP_抖音
```

输出：`D:/test/hermes/视频/{slug}/` + `manifest.json`

默认 **国内男声** `cn-male`（`zh-CN-YunxiNeural`），**TTS 语速 +50%**，纯口播无 BGM。

```powershell
npm run douyin:voices
```

在 `user-profile.md` 的 `## 抖音配置` 调整：

```markdown
- TTS 音色: cn-female      # 国内女声；海外男 us-male / 海外女 us-female 等
- TTS 语速: +50%           # 或 +75% / +100%（2倍速）
```

单次覆盖音色：

```powershell
npm run douyin:create-video -- --voice cn-female -f "D:/test/hermes/文章/抖音/xxx.md"
```

发布（PVA，需先登录）：

```powershell
npm run douyin:login
npm run douyin:upload -- --video "D:/test/hermes/视频/xxx/yyy.mp4" --title "标题 #话题"
```

> Windows 默认 `ffmpeg+ASS` 花字渲染。可选 FFCreator（Linux/macOS）：`npm run douyin:install`

---

## TikTok 视频创作 + 发布

英文口播 → 黑底花字竖版 MP4（同抖音样式，英文 Edge TTS，**时长 ≤90 秒**）：

```powershell
npm run pipeline:tiktok -- -File "D:/test/hermes/文章/TikTok/xxx.md"
npm run tiktok:voices
```

`user-profile.md` → `## TikTok 配置`：

```markdown
- TTS 音色: us-male
- TTS 语速: +50%
- 视频时长上限: 90
```

发布（需 `npm run overseas:install` + `tiktok:login`）：

```powershell
npm run tiktok:publish -- --video "D:/test/hermes/视频/TikTok/xxx/yyy.mp4" --title "caption #fyp"
```

---

## 抖音发布流程（PVA，仅上传）

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
| `npm run pipeline:xhs -- -Slug xxx` | 小红书写稿 MD → 卡片图（推荐） |
| `npm run xhs:card-render -- -File ...` | 小红书出图（底层，可指定 Theme/Out） |

---

## 限制

- 小红书标题限 **20字**
- 公众号 API 需 **IP 白名单**
- 抖音/小红书依赖本地 Chrome
- 小红书正文卡片走 **`npm run pipeline:xhs`**（配图 MD → PNG，非 AI）；知乎/公众号封面走 tokenware
