---
name: yt-auth
description: |
  YouTube Studio 认证技能。检查登录态、引导登录、同步 auth 文件。
  当用户要求登录 YouTube、检查 Studio 登录、切换频道时触发。
version: 1.0.0
---

# YouTube 认证管理

## 技能边界

只运行：
- `node skills/youtube/scripts/cli.mjs check-login`
- `node skills/youtube/scripts/cli.mjs login`

## 流程

### 检查登录

```powershell
node skills/youtube/scripts/cli.mjs check-login
```

输出 JSON：`{ ok, loggedIn, url }`

### 登录

```powershell
node skills/youtube/scripts/cli.mjs login
```

在当前浏览器窗口完成 Google 登录，**不自动关闭浏览器**。

推荐先启动 Chrome 调试端口并设置 `CHROME_CDP_URL`，复用已有登录态。
