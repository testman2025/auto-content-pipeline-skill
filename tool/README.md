# 海外与 baoyu 工具（本地 clone，不提交 Git）

## baoyu 技能（公众号 + X）

运行 `npm run wechat:install` 或 `scripts/install-baoyu-skills.ps1` 后生成：

| 目录 | 用途 |
|------|------|
| `baoyu-skills/skills/baoyu-post-to-wechat/` | 公众号 API 发布（**微信官方 AppID/Secret**） |
| `baoyu-skills/skills/baoyu-markdown-to-html/` | Markdown → 公众号 HTML |
| `baoyu-skills/skills/baoyu-post-to-x/` | X/Twitter CDP 发帖 |

Hermes 安装脚本会将 `baoyu-post-to-wechat`、`baoyu-markdown-to-html` 注册到 `~/.hermes/skills/publishing/`。

## 海外发布

运行 `npm run overseas:install` 后 additionally：

| 目录 | 用途 |
|------|------|
| `social-auto-upload/` | `sau youtube`、TikTok `tk_uploader` |
| `openclaw-linkedin-skill/` | LinkedIn 浏览器发帖参考 |
| `reddit-skills/` | Reddit Chrome 扩展桥 + Python CLI |

```powershell
npm run overseas:install
cd tool/social-auto-upload
uv pip install -e .
patchright install chromium
```

## 抖音（固定 PVA，不在 tool/ 目录）

```powershell
npm install
npm run douyin:login
npm run douyin:upload -- --video "..." --title "..."
```
