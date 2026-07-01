# 海外平台自动化规则（Agent 与用户必读）

适用：**LinkedIn · X · YouTube · TikTok · Reddit**

## 核心原则

1. **可以**为用户打开浏览器到 **OAuth 授权页 / 登录入口**（仅打开 URL，不代填表单）
2. **禁止**脚本自动输入账号密码、自动点击登录、**禁止连跑** `check-login`
3. 用户手动完成浏览器内操作后，**必须在终端按 Enter 确认**，才进行下一步（存令牌、调 API、发布）
4. 默认 **只生成文稿**；海外发布须用户明确同意

## LinkedIn（官方 API）

| 步骤 | 行为 |
|------|------|
| login | 按 Enter → 打开 OAuth 授权页 → 用户手动登录并授权 → 按 Enter 存令牌 |
| check-login | 按 Enter → **一次** userinfo |
| publish | 按 Enter → **一次** Posts API |

不再使用 Cookie 抽取 / Playwright 发帖。配置见 `skills/linkedin/references/linkedin-api-setup.md`。

## Agent 禁止

- 未经 `OVERSEAS_ALLOW_AUTOMATION=true` 执行海外 login/publish
- 连续多次 check-login
- 用 Cursor 内置浏览器代替用户系统 Chrome 做登录（易与用户环境不一致）

## 用户自行操作（终端）

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:login
```
