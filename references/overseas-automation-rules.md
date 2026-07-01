# 海外平台自动化规则（Agent 与用户必读）

适用：**LinkedIn · X · YouTube · TikTok · Reddit**

## 核心原则

1. **禁止 Agent 自动打开浏览器或登录页**（含 Cursor 内置浏览器、Playwright、spawn Chrome、反复 `check-login`）
2. **禁止连续、重复**执行登录检测（一次会话最多 **1 次** check-login，且须用户明确要求）
3. **登录由用户自己在常用浏览器完成**；脚本只读已有 Cookie / 会话，不代开窗口
4. **未发帖也可能封号**（API 探测、Cookie 抽取、多浏览器上下文均可能触发风控）
5. 默认 **只生成文稿/视频**，海外发布以 **人工** 为主

## Agent 禁止行为（强制）

| 禁止 | 说明 |
|------|------|
| `browser_navigate` 到海外平台登录页 | 用户往往看不见，且与系统 Chrome 不是同一环境 |
| 连跑 `*:check-login` | 每次探测都会打平台 API |
| 自动 `*:login` | 会拉起浏览器或 sau 登录窗口 |
| 未设 `OVERSEAS_ALLOW_AUTOMATION=true` 执行海外发布 | 默认关闭 |

## 用户若要自行测试（终端、单次）

```powershell
# 1. 你自己在浏览器登录对应网站（Agent 不要代开）
# 2. 仅在终端显式开启（一次操作）
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
npm run linkedin:check-login   # 最多一次，不要连点
```

**不要**设置 `OVERSEAS_USER_REQUESTED_BROWSER` 除非你真的希望脚本打开 Chrome（仍不推荐）。

## 各平台说明

| 平台 | 登录方式 | Agent 默认 |
|------|----------|------------|
| LinkedIn | 用户 Chrome 登录后 Cookie 抽取 | 只出稿 |
| X | 用户 Chrome + CDP | 只出稿 |
| YouTube | sau / Studio | 用户已验证可发 |
| TikTok | sau cookie | 出片为主 |
| Reddit | Chrome 扩展桥 | 用户已验证可发 |

## 公司主页

LinkedIn 公司号与个人号流程不同，见 `skills/linkedin/references/company-page.md`（预留）。
