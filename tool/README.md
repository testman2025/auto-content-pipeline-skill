# 海外发布工具（本地 clone，不提交 Git）

运行 `scripts/install-overseas-tools.ps1` 后生成：

| 目录 | 用途 |
|------|------|
| `social-auto-upload/` | `sau youtube`、TikTok `tk_uploader` |
| `openclaw-linkedin-skill/` | LinkedIn 浏览器发帖参考文档 |

安装：

```powershell
npm run overseas:install
cd tool/social-auto-upload
uv pip install -e .
patchright install chromium
```
