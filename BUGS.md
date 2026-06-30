# Bug 修复记录

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
