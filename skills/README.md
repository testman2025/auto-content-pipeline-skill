# skills/ — 内置 Hermes 技能包（进 Git）

clone 本仓库即可用，无需先跑 `tool/` 安装脚本。

| 目录 | 用途 |
|------|------|
| `xiaohongshu/` | 小红书 Bridge + 发布子技能 |
| `youtube/` | YouTube Studio / sau |
| `linkedin/` | LinkedIn 浏览器发帖 |
| `tiktok/` | TikTok 海外 sau |
| `x/` | X/Twitter（baoyu-post-to-x 封装） |
| `image/` | tokenware 生图（`tokenware-image`） |

## 子技能注册

`npm run skills:register` 会将各包内 `skills/*/SKILL.md` 复制到 `~/.hermes/skills/publishing/`。

## 与 tool/ 的区别

- **skills/**：随仓库发布，用户 clone 即有
- **tool/**：安装时 `git clone` 的第三方仓库（baoyu-skills、sau 等），不进 Git
