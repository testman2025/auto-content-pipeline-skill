---
name: yt-pipeline
description: |
  YouTube 全流程技能。读取用户画像，生成英文口播稿，创作视频并发布到 Studio。
  当用户要求一键发 YouTube、跑完整内容流水线时触发。
version: 1.0.0
---

# YouTube 全流程流水线

## 技能边界

只运行：`node skills/youtube/scripts/cli.mjs pipeline`

## 前置条件

1. 仓库根目录存在 `user-profile.md`（从 `user-profile.template.md` 复制）
2. YouTube 区块已填写：频道 ID、TTS 音色、默认可见性
3. Studio 已登录或 `CHROME_CDP_URL` 已配置

## 流程

```
user-profile.md
  → 生成口播稿（HERMES_ROOT/文章/YouTube/）
  → TTS + ffmpeg 合成 MP4
  → Studio 上传发布
  → 发布报告（HERMES_ROOT/*_youtube发布报告.md）
```

## 命令

```powershell
node skills/youtube/scripts/cli.mjs pipeline
```

## 自定义

| 环境变量 | 作用 |
|----------|------|
| `VIDEO_TITLE` | 覆盖默认标题 |
| `VIDEO_SCRIPT` | 覆盖口播正文 |
| `HERMES_ROOT` | 归档目录 |
