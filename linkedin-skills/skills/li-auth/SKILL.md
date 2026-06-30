---
name: li-auth
description: LinkedIn 登录与会话管理。
version: 1.0.0
---

# LinkedIn 认证

```powershell
node linkedin-skills/scripts/cli.mjs login
node linkedin-skills/scripts/cli.mjs check-login
```

会话保存在 `%APPDATA%\auto-content-pipeline\linkedin-chrome-profile`（Windows，系统 Chrome）。

若登录页提示「浏览器不安全」，请用 `npm run linkedin:login` 重新登录（已改为系统 Chrome，非 Playwright Chromium）。
