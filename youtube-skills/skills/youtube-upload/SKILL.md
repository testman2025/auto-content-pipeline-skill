---
name: youtube-upload
description: |
  当 agent 需要通过已安装的 `sau` CLI 完成 YouTube 登录、cookie 校验、视频上传时使用。
  适用于已安装 social-auto-upload 且可调用 `sau youtube` 的环境。优先于 Playwright 回退方案。
version: 1.0.0
---

# YouTube 上传 Skill（social-auto-upload / sau）

优先把 `sau youtube` 作为主接口，与 `douyin-upload` / `xiaohongshu-upload` 模式一致。

不要假设一定能读取 uploader 源码；只有 `sau` 失败时才回退 `youtube-skills` 内置 Playwright。

## 功能概览

| 功能 | 命令入口 | 说明 |
| --- | --- | --- |
| YouTube 登录 | `sau youtube login --account <name>` | 浏览器内完成 Google 登录 |
| cookie 校验 | `sau youtube check --account <name>` | 输出 `valid` / `invalid` |
| 视频上传 | `sau youtube upload-video ...` | 上传并发布到 Studio |

或通过本仓库封装 CLI：

```powershell
node youtube-skills/scripts/cli.mjs login
node youtube-skills/scripts/cli.mjs check-login
node youtube-skills/scripts/cli.mjs publish --video "D:/..." --title "标题" --privacy unlisted
```

## 默认工作流

1. 确认 `references/runtime-requirements.md` 运行前提
2. 确认 `references/cli-contract.md` 命令契约
3. 执行 `sau youtube ...` 或 `youtube-skills/scripts/cli.mjs`
4. 失败时看 `references/troubleshooting.md`，再考虑 Playwright 回退

## 执行前检查

- 当前 shell 能否调用 `sau`（或 `uv run --directory tool/social-auto-upload sau`）
- `YOUTUBE_ACCOUNT_ID` / `SAU_ACCOUNT_ID` 账号名（默认 `default`）
- 国内环境可在 `tool/social-auto-upload/conf.py` 配置 `YT_PROXY`

## 参考文档

- 运行前提：`references/runtime-requirements.md`
- CLI 契约：`references/cli-contract.md`
- 故障排查：`references/troubleshooting.md`
