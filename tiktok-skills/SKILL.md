---
name: tiktok-skills
description: |
  TikTok 海外版自动化技能。基于 social-auto-upload tk_uploader，支持登录与视频发布。
  当用户要求发布到 TikTok 国际版、tiktok.com 上传视频时触发。
version: 1.0.0
---

# TikTok 海外版 Skills

基于 [social-auto-upload](https://github.com/dreammis/social-auto-upload) 的 `tk_uploader`（Chrome 自动化）。

## 技能边界

只通过：

```powershell
uv run python tiktok-skills/scripts/cli.py <command>
```

## 子技能

| 技能 | 命令 | 功能 |
|------|------|------|
| tt-auth | `login` / `check-login` | Cookie 登录态 |
| tt-publish | `publish` | 上传视频 |

## 快速开始

```powershell
uv run python tiktok-skills/scripts/cli.py login --account default
uv run python tiktok-skills/scripts/cli.py publish --video "D:/path/video.mp4" --title "caption #fyp"
```

## 环境变量

- `SAU_ROOT` — social-auto-upload 路径
- `TIKTOK_ACCOUNT_ID` — 账号名（默认 `default`）
- `SAU_HEADED=true` — 有头浏览器

详见 `skills/tt-publish/SKILL.md`。
