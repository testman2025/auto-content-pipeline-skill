# 故障排查

## sau 命令找不到 / ModuleNotFoundError

1. `npm run overseas:install`
2. `cd tool/social-auto-upload; uv pip install -e .`
3. `npm run youtube:patch-sau`
4. 验证：`uv run --directory tool/social-auto-upload sau youtube --help`

**不要**用 `python sau_cli.py`，应使用 `uv run sau`。

## check 返回 invalid（cookie 文件存在）

1. 检查 `conf.py` 的 `YT_PROXY`（国内必配）
2. **勿立即 re-login**，间隔至少 30 分钟
3. 查看 sau 日志中的 cookie 校验原因（patch 后会输出 URL/异常）
4. 日常可直接 `publish`，不必先 check

重新登录（间隔足够后）：

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"
$env:SAU_HEADED = "true"
npm run youtube:login
```

## 上传卡在进度条

- 保持浏览器窗口打开直到 100%
- 大文件需更长时间；不要提前关窗

## Agent 反复 login/check 导致风控

- 保持 `OVERSEAS_ALLOW_AUTOMATION` 未设置（默认关闭）
- Agent 禁止连跑 `youtube:login` / `youtube:check-login`
- 见 `references/overseas-automation-rules.md`
