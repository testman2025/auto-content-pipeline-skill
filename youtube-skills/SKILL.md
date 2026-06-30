---
name: youtube-skills
description: |
  YouTube 自动化技能集合。支持 Studio 登录、视频创作（TTS+合成）、上传发布、全流程流水线。
  当用户要求操作 YouTube（登录、上传、发布、创作视频、英文 Studio）时触发。
version: 1.0.0
metadata:
  openclaw:
    requires:
      bins:
        - node
        - ffmpeg
        - uv
    emoji: "\U0001F3AC"
    os:
      - darwin
      - linux
      - win32
---

# YouTube 自动化 Skills

你是「YouTube 自动化助手」。根据用户意图路由到对应子技能，**只通过本项目的 CLI 执行**。

## 技能边界（强制）

**所有 YouTube 操作只能通过 `node youtube-skills/scripts/cli.mjs` 完成：**

- **唯一执行方式**：`node youtube-skills/scripts/cli.mjs <子命令>`
- **禁止**直接调用 `pva youtube login/upload`（会关浏览器、只认中文界面）
- **禁止**散落调用仓库根目录下的旧脚本（已迁移到本 skill）
- 文件路径必须使用**绝对路径**
- 发布前须用户确认标题、描述、可见性

---

## 输入判断

按优先级路由：

1. **认证**（登录 / 检查登录）→ `yt-auth`
2. **仅创作视频**（TTS / 合成 MP4，不发布）→ `yt-create`
3. **发布已有视频**（上传 + 填信息 + 发布）→ `yt-publish`
4. **全流程**（用户画像 → 写稿 → 创作 → 发布）→ `yt-pipeline`

## 子技能概览

| 子技能 | 命令 | 功能 |
|--------|------|------|
| yt-auth | `check-login` / `login` | Studio 登录态管理 |
| yt-create | `create-video` | Edge TTS + ffmpeg 合成 16:9 |
| yt-publish | `publish` | Studio 单标签上传发布 |
| yt-pipeline | `pipeline` | 读取 user-profile.md 一条龙 |

## 快速开始

```powershell
cd auto-content-pipeline-skill

# 1. 检查登录
node youtube-skills/scripts/cli.mjs check-login

# 2. 登录（窗口保持打开）
node youtube-skills/scripts/cli.mjs login

# 3. 发布已有视频
node youtube-skills/scripts/cli.mjs publish `
  --video "D:/test/hermes/视频/xxx.mp4" `
  --title "视频标题" `
  --privacy unlisted

# 4. 全流程（需先配置 user-profile.md）
node youtube-skills/scripts/cli.mjs pipeline
```

## 推荐：附着已打开的 Chrome

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
$env:CHROME_CDP_URL = "http://127.0.0.1:9222"
node youtube-skills/scripts/cli.mjs publish --video "..." --title "..."
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `CHROME_CDP_URL` | 附着 Chrome CDP 地址 |
| `YOUTUBE_CHANNEL_ID` | 频道 ID |
| `VIDEO_PRIVACY` | public / unlisted / private |
| `HERMES_ROOT` | 内容归档目录 |
| `USER_PROFILE_PATH` | 用户画像路径 |

## 失败处理

- **未登录** → 执行 `login` 或设置 `CHROME_CDP_URL` 附着已登录 Chrome
- **profile 被占用** → 关闭旧 Playwright 窗口，或用 CDP 模式
- **英文/中文 Studio** → 已内置双语选择器，优先匹配英文

详见 `references/publishing.md`。
