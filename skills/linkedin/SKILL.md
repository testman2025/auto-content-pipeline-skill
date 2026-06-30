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

LinkedIn 无个人发帖 API，使用 **系统 Chrome** + Playwright 持久化配置（避免 Playwright 自带 Chromium 被 LinkedIn 判定为「不安全浏览器」）。

## 登录说明

若出现 `This browser or app may not be secure`：

1. 先关闭所有 LinkedIn 相关浏览器窗口
2. 执行 `npm run linkedin:login`（默认用系统 Chrome 打开登录页）
3. 在 **Chrome** 中完成登录，不要用 Playwright Chromium 窗口
4. 配置目录：`%APPDATA%\auto-content-pipeline\linkedin-chrome-profile`

可选：附着已登录的 Chrome — 启动 `chrome.exe --remote-debugging-port=9222` 后设置 `LINKEDIN_CDP_URL=http://127.0.0.1:9222`

## 技能边界

```powershell
node skills/linkedin/scripts/cli.mjs <command>
```

## 子技能

| 技能 | 命令 | 功能 |
|------|------|------|
| li-auth | `login` / `check-login` | 登录态 |
| li-publish | `publish` | 发文本帖 |

## 快速开始

```powershell
node skills/linkedin/scripts/cli.mjs login
node skills/linkedin/scripts/cli.mjs publish --text "Your post content #hashtag"
node skills/linkedin/scripts/cli.mjs publish --file "D:/test/hermes/文章/LinkedIn/post.md"
```

## 来源

上游技能文档：`tool/openclaw-linkedin-skill/SKILL.md`（浏览器操作说明）

本仓库提供可执行 CLI，供 auto-content-pipeline Step 5 调用。
