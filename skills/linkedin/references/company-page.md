# LinkedIn 公司主页（预留）

当前流水线 **仅支持个人号**（`/in/...` Feed → Start a post）。

## 个人号 vs 公司主页

| 项 | 个人号（已接） | 公司主页（预留） |
|----|----------------|------------------|
| 入口 | `linkedin.com/feed/` | `linkedin.com/company/{id}/admin/...` |
| 发帖主体 | 你本人 | 公司品牌 |
| 工具 | `frizynn/linkedin-cli` | 计划 `xtea/auto-linkedin`（`auto-li`） |
| npm | `linkedin:publish` | 未来 `linkedin:publish-company`（未实现） |

## 后续接入公司号时

1. `tool/` 增加 `auto-linkedin`（Patchright + 公司 page_id）
2. `user-profile.md` 设置 `LinkedIn 账号类型: company` 与公司 Page ID
3. Step 5 按账号类型路由个人 / 公司命令

在此之前请勿将 `LINKEDIN_ACCOUNT_TYPE=company`，CLI 会直接拒绝发布。
