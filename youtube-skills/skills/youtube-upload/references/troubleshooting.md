# 故障排查

## sau 命令找不到

1. 运行 `scripts/install-overseas-tools.ps1`
2. `cd tool/social-auto-upload; uv pip install -e .`
3. 使用 `uv run --directory tool/social-auto-upload sau youtube --help`

## check 返回 invalid

```powershell
$env:SAU_HEADED = "true"
uv run --directory tool/social-auto-upload sau youtube login --account default
```

## 上传卡在进度条

- 保持浏览器窗口打开直到 100%
- 大文件需更长时间；不要提前关窗

## 英文 Studio 界面

`sau youtube` 使用 uploader 模块，与 `youtube-skills` Playwright 回退共用双语补丁思路。

## 仍失败

```powershell
$env:YOUTUBE_PUBLISH_BACKEND = "playwright"
node youtube-skills/scripts/cli.mjs publish --video "..." --title "..."
```
