# Bug 修复记录

## 2026-07-01 — 抖音 TTS 误用 YouTube 英文音色

**现象**：`pipeline:douyin` 首次生成时 TTS 使用 `en-US-JennyNeural`，中文口播被英文配音。

**原因**：`loadDouyinProfile()` 在无 `## 抖音配置` 区块时回退到全文匹配，误读到 YouTube 的 `TTS 音色`。

**修复**：仅当存在 `## 抖音配置` 时读取音色；否则默认 `zh-CN-YunxiNeural`。

---

## 2026-06-30 — 小红书卡片标题与正文被拆到不同页

**现象**：`auto-split` 分页后，上一张卡片末尾只有章节标题（如「今日行动清单」），正文列表出现在下一张卡片。

**原因**：`render_xhs.py` 的 `auto_split_content` 仅按 `\n\n` 段落累加高度；标题段落能放进当前页，但后续列表段落溢出时被单独分到下一页。

**修复**（`scripts/patches/auto-redbook-render_xhs.py`）：
1. **先按 `---` 分章节**，每节独立分页，不再跨节合并
2. **标题孤儿保护**：溢出拆页时，若上一页末尾是 `# 标题`，将标题与下一段正文一起移到新页

**验证**：`npm run xhs:card-render -- -File D:/test/hermes/文章/小红书/preview-20260629-tk-gmvmax.md`，检查卡片饱满度与标题不孤儿

**2026-06-30 补充**：`playful-geometric` / `neo-brutalism` 因 h1 装饰盒偏高，单节常仅超出可用高度 2-5%，触发错误拆页。修复：`SOFT_SECTION_OVERFLOW_RATIO=1.06` 整节保留 + 渲染略缩小；并 patch 两主题 CSS 压缩 h1 间距。`terminal` 主题 patch 加粗字体、提高文字/强调色饱和度。

---

## 2026-06-30 — 知乎发布整篇糊成一坨（无换行/无分段）

**现象**：`zhihu article` 发布专栏后正文挤成一段，空行分段和 `**加粗**` 均失效。

**原因**：
- `pyzhihu-cli` 的 `zhihu article` 将全文包进单个 `<p>{content}</p>`，HTML 折叠换行
- 流水线原先把 `.md` 原文当字符串直传，无 MD→HTML 转换

**修复**：
- 新增 `skills/zhihu/`：`markdownToZhihuHtml` → 多 `<p>` 段落 HTML
- `publish.py` 直调 `ZhihuClient.create_article`，绕过 CLI 单段包裹
- 命令：`npm run zhihu:convert` / `npm run zhihu:publish -- --title ... --content-file ...`

**验证**：`npm run zhihu:convert -- --content-file D:/test/hermes/文章/知乎/xxx.md` 检查 `.html` 分段；`npm run zhihu:publish -- --dry-run` 只生成 HTML

---

## 2026-06-30 — LinkedIn 登录「This browser or app may not be secure」

**现象**：`npm run linkedin:login` 打开 Playwright 自带 Chromium，Google/LinkedIn 判定为不安全浏览器，无法登录。

**原因**：`chromium.launchPersistentContext` 默认使用 Playwright 捆绑的 Chromium，带有自动化特征。

**修复**：
- 改为 `channel: 'chrome'` 使用系统安装的 Google Chrome
- 增加反检测参数：`--disable-blink-features=AutomationControlled`、`ignoreDefaultArgs: ['--enable-automation']`
- 登录默认用系统 Chrome 直接打开 `linkedin.com/login`
- Profile 迁移至 `%APPDATA%\auto-content-pipeline\linkedin-chrome-profile`

**验证**：`npm run linkedin:login` → 在 Chrome 中完成登录 → `npm run linkedin:check-login`

---

## 2026-06-30 — skills/ + tool/ 目录重构后脚本路径错误

**现象**：`git mv` 将 `*-skills/` 迁入 `skills/` 后，部分 CLI 仍引用旧路径；`skills/x/scripts/cli.mjs` 与 `skills/youtube/scripts/commands/*.mjs` 的 `import` 层级少一层，导致找不到 `scripts/lib/`。

**修复**：
- 批量将文档与 SKILL 内路径改为 `skills/<platform>/`
- `skills/image`、`skills/tiktok` 的 `repo_root()` 改为 `parents[3]`
- `skills/youtube/scripts/lib/paths.mjs` 的 `repoRoot` 改为 `join(skillRoot, '../..')`
- x / youtube commands 的 import 改为 `../../../` / `../../../../scripts/lib/`
- `.gitignore` 与 `register-skills.ps1` 对齐新结构

**验证**：`npm run image:check-key`、`npm run check`

---

## 2026-06-30 — X / LinkedIn 账号封禁（平台风控）

**现象**：测试自动发帖流程后，X 与 LinkedIn 账号被平台封禁。

**可能原因**（综合常见风控，非官方结论）：
- 浏览器自动化 / CDP / Playwright 特征被识别
- 新设备或新 profile 登录后立即发帖
- 集成测试类内容被判定为异常行为
- LinkedIn 对自动化极其敏感（官方无个人发帖 API）

**处置**：
- `user-profile.md` 已将 LinkedIn、X 设为**关闭**，Step 5 不再路由
- **停止**执行 `x:*`、`linkedin:*` 发布命令，避免加重风控或关联设备
- 申诉仅通过平台官方渠道；勿用脚本批量建新号绕封

**后续建议**：
- 海外文本分发优先考虑 **官方 API**（如 X API / LinkedIn Company API，需企业资质）
- 或改为 **只生成文稿 + 人工发布**（`发布偏好: 只生成清单`）
- YouTube 继续走 sau / Studio，与 X/LinkedIn 登录 profile 隔离

---

## 2026-06-30 — Reddit skills 接入测试（扩展未连接）

**接入**：`tool/reddit-skills`（1146345502/reddit-skills）+ `skills/reddit/` 封装。

**测试结果**：
- `uv sync`、Bridge 服务自动启动 ✅
- Chrome 自动打开 ✅
- `check-login` 失败：Reddit Bridge 扩展未在 Chrome 中加载 ❌

**解决**：`npm run reddit:setup` → 在 `chrome://extensions/` 加载 `tool/reddit-skills/extension/`，登录 Reddit 后重试 `npm run reddit:check-login`。

**发布修复（2026-06-30）**：Reddit 发帖页标题改为 `post-composer-title` shadow DOM。已用 `scripts/patch-reddit-publish.mjs` 修补。

**测试帖被筛（2026-06-30）**：向 `r/test`、`r/cicd` 发 integration test 文案被 Reddit 筛选器移除；`r/TikTokshop` 正式帖亦未保留。已加 `scripts/lib/reddit-quality.mjs` 发布前门禁：禁测试版块、禁测试关键词、禁 hashtag、正文长度下限。
