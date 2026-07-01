---
name: dy-create
description: |
  抖音竖版视频创作：黑底花字 + Edge TTS + ffmpeg/FFCreator 合成 1080x1920，不发布。
version: 1.0.0
---

# 抖音视频创作

## 技能边界

只运行：`node skills/douyin/scripts/cli.mjs create-video` 或 `npm run pipeline:douyin`

## 产出

- 口播稿 → `HERMES_ROOT/文章/抖音/`
- MP4 → `HERMES_ROOT/视频/{slug}/`
- manifest.json → 标题、路径、时长、音色

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）
- 可选：`skills/douyin/node_modules/ffcreator`（`npm run douyin:install`）

## 命令

```powershell
npm run pipeline:douyin -- -Slug "{slug}"
npm run pipeline:douyin -- -File "D:/test/hermes/文章/抖音/xxx.md"
```

创作完成后，用 PVA `npm run douyin:upload` 发布。
