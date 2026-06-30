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
