---
name: yt-publish
description: |
  YouTube 视频发布技能。单标签打开 Studio、选文件、填标题描述、设置可见性并发布。
  当用户要求上传视频到 YouTube、发布 MP4 到频道时触发。
version: 1.0.0
---

# YouTube 视频发布

## 技能边界

只运行：`node skills/youtube/scripts/cli.mjs publish`

## 必做约束

- 发布前用户确认：标题、描述、可见性
- 视频路径必须为绝对路径
- 先 `check-login`，未登录则 `login`

## 命令

```powershell
node skills/youtube/scripts/cli.mjs publish `
  --video "D:/test/hermes/视频/xxx.mp4" `
  --title "视频标题" `
  --description "视频描述" `
  --privacy unlisted
```

## 环境变量

- `YOUTUBE_CHANNEL_ID` — 频道 ID
- `CHROME_CDP_URL` — 附着已打开 Chrome（推荐）
