---
name: linkedin-skills
description: |
  LinkedIn 自动化技能。基于 jarvis-survives/openclaw-linkedin-skill，支持发帖、登录检查。
  当用户要求发布 LinkedIn 帖子、领英动态时触发。
version: 1.0.0
metadata:
  source: https://github.com/jarvis-survives/openclaw-linkedin-skill
---

# LinkedIn Skills

LinkedIn 无个人发帖 API，使用 Playwright 浏览器自动化（与 openclaw-linkedin-skill 思路一致）。

## 技能边界

```powershell
node linkedin-skills/scripts/cli.mjs <command>
```

## 子技能

| 技能 | 命令 | 功能 |
|------|------|------|
| li-auth | `login` / `check-login` | 登录态 |
| li-publish | `publish` | 发文本帖 |

## 快速开始

```powershell
node linkedin-skills/scripts/cli.mjs login
node linkedin-skills/scripts/cli.mjs publish --text "Your post content #hashtag"
node linkedin-skills/scripts/cli.mjs publish --file "D:/test/hermes/文章/LinkedIn/post.md"
```

## 来源

上游技能文档：`tool/openclaw-linkedin-skill/SKILL.md`（浏览器操作说明）

本仓库提供可执行 CLI，供 auto-content-pipeline Step 5 调用。
