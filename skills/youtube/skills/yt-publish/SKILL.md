---
name: yt-publish
description: |
  YouTube 视频发布技能。通过 sau 上传并发布到 Studio。
  当用户要求上传视频到 YouTube、发布 MP4 到频道时触发。
version: 2.0.0
---

# YouTube 视频发布（sau）

## 技能边界

只运行：`node skills/youtube/scripts/cli.mjs publish`

## 必做约束

- 发布前用户确认：标题、描述、可见性
- 视频路径必须为绝对路径
- **日常直接 publish**；仅在首次或 sau 明确提示 cookie 失效时才 login
- **禁止** check 失败后立即 re-login

## 命令

```powershell
npm run youtube:publish -- `
  --video "D:/test/hermes/视频/xxx.mp4" `
  --title "视频标题" `
  --description "视频描述" `
  --privacy unlisted
```

## 环境变量

- `YOUTUBE_ACCOUNT_ID` — sau 账号名
- `SAU_HEADED=true` — 上传时有头浏览器（可选）
