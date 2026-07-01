---
name: douyin-skills
description: |
  抖音自动化技能：黑底花字竖版视频（Edge TTS + ffmpeg ASS）创作，配合 PVA 发布。
version: 1.0.0
---

# 抖音自动化 Skills

## 技能边界

视频创作：`node skills/douyin/scripts/cli.mjs create-video`

发布：`npm run douyin:upload`（PVA，见主流水线 Step 5）

## 一键出片

```powershell
npm run pipeline:douyin -- -Slug test-short-douyin
npm run pipeline:douyin -- -File "D:/test/hermes/文章/抖音/xxx.md"
```

输出：`D:/test/hermes/视频/{slug}/` + `manifest.json`

## 依赖

- `uv run edge-tts`
- `ffmpeg`（含 libass）
