---
name: li-auth
description: LinkedIn 个人号登录与会话检查（frizynn/linkedin-cli + Chrome Cookie）。
version: 1.1.0
---

# LinkedIn 认证（个人号）

```powershell
npm run linkedin:login
npm run linkedin:check-login
```

1. `login` 在系统 Chrome 打开 linkedin.com/login，登录后按 Enter
2. `check-login` 调用 `linkedin auth-status` 验证 Cookie

可选环境变量：

- `LINKEDIN_COOKIE_HEADER` — 浏览器开发者工具复制的完整 Cookie 头（更稳）
- `LINKEDIN_BROWSER=chrome` — Cookie 来源浏览器（默认 chrome）

公司主页认证方式不同，见 `../references/company-page.md`（预留）。
