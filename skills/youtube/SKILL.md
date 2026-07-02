---
name: youtube-skills
description: |
  YouTube 自动化技能集合。支持 sau 登录、视频创作（TTS+合成）、上传发布、全流程流水线。
  当用户要求操作 YouTube（登录、上传、发布、创作视频、英文 Studio）时触发。
version: 2.0.0
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

# YouTube 自动化 Skills（仅 sau 单路径）

你是「YouTube 自动化助手」。**所有操作只通过 sau（social-auto-upload）完成**，无 Playwright 回退。

## 技能边界（强制）

- **唯一执行方式**：`node skills/youtube/scripts/cli.mjs <子命令>`
- **唯一登录态**：`tool/social-auto-upload/cookies/youtube_<account>.json`
- **禁止**直接调用 `pva youtube login/upload`
- **禁止**设置 `YOUTUBE_PUBLISH_BACKEND`、`CHROME_CDP_URL` 等已废弃变量
- **禁止 Agent 连跑** `login` / `check-login`（须 `OVERSEAS_ALLOW_AUTOMATION=true` 且用户手动确认）
- 文件路径必须使用**绝对路径**
- 发布前须用户确认标题、描述、可见性

## 输入判断

| 意图 | 子技能 | 命令 |
|------|--------|------|
| 登录 / 检查 | yt-auth | `login` / `check-login` |
| 仅创作视频 | yt-create | `create-video` |
| 发布已有视频 | yt-publish | `publish` |
| 全流程 | yt-pipeline | `pipeline` |

## 推荐工作流

```powershell
# 1. 一次性安装 + 登录（人工）
npm run overseas:install
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run youtube:login

# 2. 日常只 publish（尽量不 check-login）
npm run youtube:publish -- --video "D:/test/hermes/视频/xxx.mp4" --title "标题" --privacy unlisted
```

## check 失败时

- **勿立即 re-login**（间隔至少 30 分钟）
- 先查 `tool/social-auto-upload/conf.py` 的 `YT_PROXY`
- 查看 sau 日志中的 cookie 校验原因
- 日常可直接 `publish`，sau 会在 cookie 失效时提示

## 环境变量

| 变量 | 说明 |
|------|------|
| `YOUTUBE_ACCOUNT_ID` | sau 账号名，默认 `default` |
| `SAU_ROOT` | social-auto-upload 路径 |
| `SAU_HEADED=true` | login 时有头浏览器 |
| `YOUTUBE_CHANNEL_ID` | 频道 ID |
| `VIDEO_PRIVACY` | public / unlisted / private |
| `HERMES_ROOT` | 内容归档目录 |

详见 `references/publishing.md`。
