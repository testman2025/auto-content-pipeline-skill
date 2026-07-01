# Bug 修复记录

## 2026-07-01 — 花字/on-screen 字幕去掉标点

**需求**：视频画面上的花字不显示标点符号。

**实现**：`display-text.mjs` 在烧录 ASS 前剥离中英文标点；Edge TTS 口播仍保留标点以保证停顿自然。抖音与 TikTok 共用。

---

**现象**：英文字幕换行处出现 `{\b1\c&H00E5FF&\fs82}Nthen` 等乱码。

**原因**：英文 `splitAndWrapCues` 先把多行拼成 `flow,\Nthen` 再整段做关键词高亮，`\N` 后的 `Nthen` 被误识别为单词并插入未闭合的 ASS 标签。

**修复**：与抖音一致——**按行** `toFancyAssText` 后再用 `\\N` 拼接；`fancy-text.mjs` 跳过反斜杠后的误匹配。

---

**需求**：TikTok 视频创作与抖音相同（花字+TTS），英文配音，时长限制约 1 分半。

**实现**：
- `npm run pipeline:tiktok` / `tiktok:create-video`
- 默认英文音色 `us-male`，`视频时长上限: 90` 可配置
- 超长口播按句裁切 + TTS 实测二次收紧
- 英文字幕换行（`text-wrap-en.mjs`）

---

**调整**：
- 字号提升至 72–96（原 46–64），描边 6px + 阴影，入场缩放 112–118%
- 每行最多 10 字，关键词高亮色更亮（黄/青/绿）
- 移除 BGM 混音，成片仅保留 TTS 口播

---

**现象**：竖屏花字长句超出画面；纯 TTS 无 BGM 听感干涩；口播偏慢。

**修复**：
1. `text-wrap.mjs`：每行最多 12 字、最多 2 行；超长 VTT 按时间轴拆分
2. 动态字号（46–64）+ 加宽左右边距
3. 默认 TTS 语速 `+50%`（`user-profile` 可改 `TTS 语速: +75%` 约 1.75 倍）
4. 自动混入 BGM（默认生成 `skills/douyin/assets/default-bgm.mp3`，或放 `D:/test/hermes/音频/douyin-bgm.mp3`）

---

**现象**：`npm install ffcreator` 在 Windows + Node 24 失败（canvas 无预编译包，需 VS C++ 编译环境）。

**处理**：抖音视频默认使用 **ffmpeg + ASS 花字**（黑底、关键词高亮、淡入动画），不依赖 FFCreator。Linux/macOS 可选 `npm run douyin:install` 安装 FFCreator；失败自动回退 ffmpeg。

**补充**：`npm run pipeline:douyin -- -Slug` 传中文 Slug 在 Windows npm 下可能乱码，请用 `-File` 完整路径、`$env:DOUYIN_SLUG` 或日期前缀 `-Slug 20260629`。

---

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
