---
name: linkedin-skills
description: |
  LinkedIn 个人号自动化。基于 frizynn/linkedin-cli（tool/linkedin-cli），从 Chrome Cookie 认证，Playwright 发帖。
  公司主页预留见 references/company-page.md。当用户要求发布 LinkedIn 个人动态时触发。
version: 1.1.0
metadata:
  source: https://github.com/frizynn/linkedin-cli
---

# LinkedIn Skills（个人号）

LinkedIn **个人号**无官方发帖 API。本技能封装 **[frizynn/linkedin-cli](https://github.com/frizynn/linkedin-cli)**：

- **认证**：从本机 Chrome 读取 Cookie（`browser-cookie3`），或 `LINKEDIN_COOKIE_HEADER`
- **发帖**：`linkedin post` → Feed「Start a post」→ Playwright 兜底（个人动态，非公司主页）

## 风控（必读）

LinkedIn 对**登录检测、API 探测、浏览器自动化**均敏感；**未发帖**也可能封号。

- **默认关闭**：所有 `linkedin:*` 须先设 `LINKEDIN_ALLOW_AUTOMATION=true` 且**人工**在终端执行
- **禁止** Agent 连续跑 `check-login` / `login` / `publish`
- 两次操作间隔建议 **≥10 分钟**；测试也只跑**一次** check-login
- 默认只生成 `D:/test/hermes/文章/LinkedIn/` 文稿，人工发布

## 前置

```powershell
npm run tool:install
npm run linkedin:login
npm run linkedin:check-login
```

在 **Chrome** 中登录 linkedin.com 后，CLI 自动抽取 Cookie。Cookie 等同密码，勿提交 Git。

## 技能边界

```powershell
node skills/linkedin/scripts/cli.mjs <command>
```

| 子技能 | 命令 | 功能 |
|--------|------|------|
| li-auth | `login` / `check-login` | Chrome 登录 + `linkedin auth-status` |
| li-publish | `publish` | 个人 Feed 文本帖 |

## 发布

```powershell
npm run linkedin:publish -- --file "D:/test/hermes/文章/LinkedIn/post.md"
npm run linkedin:publish -- --text "Your post" --visibility public
```

文稿归档：`D:/test/hermes/文章/LinkedIn/`

## 公司主页（预留）

公司号发帖入口、工具链与个人号不同，**尚未接入**。见 [references/company-page.md](./references/company-page.md)。

## 风控

LinkedIn 对自动化敏感；默认建议低频发布或只出稿。勿用测试文案批量发帖。
