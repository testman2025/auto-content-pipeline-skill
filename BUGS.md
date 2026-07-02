# Bug 修复记录

## 2026-07-02 — 小红书 Cron 配图走错路 + CLI 误判失败连发风控

**现象**：定时任务未走 `pipeline:xhs` 模版卡片，Agent 起手 tokenware 失败后自造 BMP+ffmpeg 渐变图；13:12 上传超时后 13:18 换图再发，触发小红书风控踢登录。

**原因**：
- Cron prompt 写「xhs-card-render 或 tokenware」并行二选一，Agent 先试 tokenware
- `publish.py` 上传超时直接抛错，未去创作中心验收是否已上线
- 无官方图片格式校验（bmp/gif 被放行）
- 无右侧草稿恢复与 `user_decision` 停止策略

**修复**：
- 新增 `skills/xiaohongshu/references/xhs-cron-runbook.md`：先 pipeline:xhs，失败再 tokenware（交互问用户/Cron 自动）；发布验收 SOP
- 新增 `xhs_image_spec.py`：官方格式 png/jpg/jpeg/webp、≤32MB、分辨率 warning
- 新增 `verify_publish.py` + CLI `verify-publish`：首页最新笔记 / 笔记管理已发布
- `publish.py`：`recover_after_publish_failure`、`verify_draft_in_sidebar`、`open_draft_from_sidebar`
- `cli.py`：发布前校验图片；失败先验收再 recover；`recover-publish` / `verify-draft` / `open-draft`
- 更新 SKILL.md、xhs-publish、xhs-card-render、tokenware-image 文档

**验证**：`python cli.py verify-publish --title-file title.txt`；bmp 图片被 publish 拒绝；失败输出含 `next_action: user_decision`

---


**现象**：Agent/Hermes 执行 YouTube 发布时反复打开又关闭 Chrome，点击极快；封面上传未等完成就点发布；像机器人操作，有封号风险。

**原因**：
- `upload_youtube_video` 发布前调用 `youtube_setup` → `cookie_auth`，**先开一个浏览器 check 再开一个浏览器 upload**，单次 publish 连开两个窗口
- Agent 常在 publish 前先跑 `check-login`，再叠加 sau 内部 pre-check，窗口开关更频繁
- 上传流程各步骤间隔过短（固定 `wait_for_timeout(400~1200)`），封面上传只等 2 秒

**修复**：
- `sau_cli.py`：publish 前改为轻量检查 cookie 文件（`_youtube_cookie_file_usable`），**不再开浏览器 pre-check**；登录失效由 upload 流程内检测
- `main.py`：新增 `_human_pause` 随机间隔（0.9~2.2s）、`_wait_thumbnail_ready` 等封面预览、上传进度须到 100% 再发布
- `publish.mjs` / `yt-publish` SKILL / `overseas-automation-rules.md`：禁止 publish 前 check-login、禁止 MCP 浏览器、禁止连跑重试

**验证**：`npm run youtube:patch-sau` → 单次 `npm run youtube:publish` 只开一个 Chrome 窗口，日志可见「上传中 X%」直至 100% 再点发布

---

## 2026-07-02 — YouTube 收敛为 sau 单路径

**变更**：彻底移除 `skills/youtube` 内置 Playwright 回退（`browser.mjs`、`studio-i18n.mjs`、`publish-playwright.mjs`、`patch-pva-i18n.mjs`）。

**原因**：
- sau 与 Playwright 登录态分离（`tool/social-auto-upload/cookies/` vs `playwright/.profile/`），混用易反复拉起登录、触发 Google 风控
- 两条并行链路增加 Agent 误操作面

**现行为**：
- login / check-login / publish **仅**走 `sau youtube`（social-auto-upload）
- `scripts/lib/sau.mjs` 改用 `uv run sau`（不再 `python sau_cli.py`）
- 新增 `scripts/patch-sau-youtube.mjs`：cookie 校验使用 `YT_PROXY`、放宽 Studio URL 判定、输出失败日志
- check 返回 invalid 时提示勿立即 re-login；日常尽量只 publish

**配置**：唯一 cookie 路径 `tool/social-auto-upload/cookies/youtube_<account>.json`；国内 `conf.py` 设 `YT_PROXY`。

---

## 2026-07-02 — sau check invalid（headless + URL 判定过严）

**现象**：`sau youtube login` 成功保存 16KB cookie，但 `check` 返回 `invalid`。

**原因**：
- `cookie_auth()` 用 `headless=True` 开 Chrome，Google 易识别并重定向登录页
- 判定要求 URL 含 `/channel/`，部分 Studio 落地页不满足
- `check` 未使用 `YT_PROXY`，国内网络与 login 环境不一致
- 异常被 `except: return False` 静默吞掉

**修复**：`scripts/patch-sau-youtube.mjs` 改为 regex 匹配（兼容 CRLF），patch 后：
- check 与 login 一致用有头 Chrome + `YT_PROXY`
- 放宽为 `studio.youtube.com` 域即可
- 失败时输出 URL/异常日志

**验证**：`node scripts/patch-sau-youtube.mjs` → `uv run sau youtube check --account default` → `valid`

---

## 2026-06-29 — LinkedIn 改为官方 OAuth Posts API

**变更**：弃用 frizynn/linkedin-cli（Cookie + Playwright），改用 LinkedIn 开发者 **OAuth + `/rest/posts`**。

**交互**：
- 可打开浏览器到 OAuth 授权页；**禁止**代填登录
- 用户手动授权后，终端 **按 Enter 确认** 再存令牌或发帖
- `check-login` / `publish` 前均有确认步骤

**配置**：`LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET`，见 `skills/linkedin/references/linkedin-api-setup.md`。

---


**现象**：Agent 在短时间内连续执行 `linkedin:check-login`、打开 Chrome/MCP 浏览器访问 linkedin.com，账号被平台限制或封禁。

**原因**：
- `auth-status` 会多次探测 LinkedIn Voyager API，连续调用像机器人扫描
- 与 Playwright、多浏览器上下文、Cookie 抽取叠加，易触发 LinkedIn 反自动化
- **未发帖**也可能封号；检查登录态不等于「安全操作」

**处置**：
- **立即停止**一切 `linkedin:*` 命令与脚本；勿换号、勿批量重试
- 仅通过 LinkedIn 官方申诉 / 帮助中心处理
- `skills/linkedin/scripts/cli.mjs` 增加门禁：须 `OVERSEAS_ALLOW_AUTOMATION=true` 才执行 login/check-login/publish
- **login 不再自动打开浏览器**；禁止 Agent 使用 Cursor 内置浏览器访问海外登录页
- 新增 `references/overseas-automation-rules.md`：海外平台统一禁止 Agent 连跑登录检测、禁止代开浏览器

**用户反馈**：Agent 声称已打开 Chrome，但用户未看到登录页（实际可能只打开了 Cursor 内浏览器或后台进程）；反复检测导致封号。

**教训**：领英操作必须人工确认、单次、间隔数分钟以上；测试也不要连点 check-login。

---


**需求**：成片至少 1 分钟，保持 `+50%` 英文语速不变。

**实现**：`expandSentencesToMinDuration` 用过渡句 + 复述原句凑满 60s；仍不足则报错提示加字数。上限 90s 裁切逻辑不变。

---

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

## 2026-07-01 — LinkedIn 改用 frizynn/linkedin-cli（个人号）

**背景**：`openclaw-linkedin-skill` 仅有 SKILL 文档、无可执行脚本；原 `cli.mjs` 为手写 Playwright。

**改动**：
- `tool/linkedin-cli`（frizynn/linkedin-cli）替代 `openclaw-linkedin-skill`
- `skills/linkedin/scripts/cli.mjs` 薄封装 `linkedin auth-status` / `linkedin post`
- Chrome Cookie 认证（`browser-cookie3`）；配置 `skills/linkedin/config.yaml`
- 公司主页预留：`references/company-page.md`，`LINKEDIN_ACCOUNT_TYPE=company` 时拒绝发布

**验证**：`npm run tool:install` → `npm run linkedin:login` → `npm run linkedin:check-login`

---


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
