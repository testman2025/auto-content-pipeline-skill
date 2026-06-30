---
name: reddit-skills
description: |
  Reddit 自动化技能。基于 1146345502/reddit-skills（Chrome 扩展桥 + Python CLI）。
  当用户要求发布 Reddit 帖子、浏览 subreddit、搜索 Reddit 时触发。
version: 1.0.0
metadata:
  source: https://github.com/1146345502/reddit-skills
---

# Reddit Skills

通过 **Reddit Bridge** Chrome 扩展 + 本地 WebSocket 桥，在已登录 Chrome 中操作 Reddit（非 CDP，非官方 API）。

## 一次性安装

```powershell
npm run tool:install
```

在 Chrome 加载扩展（仅需一次）：

1. 打开 `chrome://extensions/`
2. 开启「开发者模式」
3. 「加载已解压的扩展程序」→ 选择仓库内 `tool/reddit-skills/extension/`

## 技能边界

```powershell
npm run reddit:check-login
npm run reddit:feed -- --subreddit python --sort hot --limit 5
npm run reddit:publish -- --subreddit test --title-file title.txt --body-file body.txt
```

底层 CLI：`uv run --directory tool/reddit-skills python scripts/cli.py <subcommand>`

## 子技能（上游）

| 技能 | 功能 |
|------|------|
| reddit-auth | 登录检查、登出 |
| reddit-publish | 文本/链接/图片帖 |
| reddit-explore | 搜索、浏览、帖子详情 |
| reddit-interact | 评论、投票、收藏 |
| reddit-content-ops | 复合运营流程 |

## 与主流水线

`user-profile.md` 中 `Reddit: 启用` 时，Step 5 调用 `reddit-publish`。

## 风控提示

控制操作频率，避免短时间大量发帖/评论，以免触发 Reddit 限流或封号。
