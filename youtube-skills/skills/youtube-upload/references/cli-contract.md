# YouTube CLI 契约（sau）

## 登录

```bash
sau youtube login --account <account>
```

## 校验

```bash
sau youtube check --account <account>
```

预期输出：`valid` 或 `invalid`

## 上传视频

```bash
sau youtube upload-video \
  --account <account> \
  --file <video-path> \
  --title "<title>" \
  [--desc "<description>"] \
  [--tags tag1,tag2] \
  [--thumbnail <image-path>] \
  [--playlist "系列名"] \
  [--visibility public|unlisted|private] \
  [--headed | --headless]
```

- 标题上限约 100 字符
- `--visibility` 默认 `unlisted`
- 上传会等待进度到 100% 再点发布

## 本仓库封装

```powershell
node youtube-skills/scripts/cli.mjs publish `
  --video "D:/test/hermes/视频/xxx.mp4" `
  --title "Title" `
  --description "Desc" `
  --privacy unlisted
```

环境变量：

- `SAU_ROOT` — social-auto-upload 路径（默认 `tool/social-auto-upload`）
- `YOUTUBE_ACCOUNT_ID` — sau 账号名
- `YOUTUBE_PUBLISH_BACKEND=playwright` — 强制 Playwright 回退
