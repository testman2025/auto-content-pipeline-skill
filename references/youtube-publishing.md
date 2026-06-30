# YouTube 发布（英文 Studio · 单标签流程）

## 为什么之前会新开窗口？

Playwright / `pva` 默认启动**独立的 Chromium**，和你正在用的 Chrome / Cursor 内置浏览器**不是同一个进程**，登录态也不共享。

## 推荐：在同一浏览器标签里完成全流程

### 方式 A — 附着到你已打开的 Chrome（最佳）

1. 用调试端口启动 Chrome（只需一次）：

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

2. 在这个 Chrome 里登录 YouTube Studio

3. 发布（**不会新开标签**，在当前窗口继续操作）：

```powershell
cd D:\test\agent\hermes\auto-content-pipeline-skill
$env:CHROME_CDP_URL = "http://127.0.0.1:9222"
$env:YOUTUBE_CHANNEL_ID = "UC7THZWQ5umY_GLiXIYEsf2g"
npm run youtube:publish -- "D:\test\hermes\视频\xxx.mp4" "视频标题"
```

### 方式 B — Playwright 持久化窗口（登录一次，以后复用同一窗口）

```powershell
npm run youtube:login          # 登录后窗口保持打开
npm run youtube:publish -- ...  # 在同一窗口继续上传发布
```

## 完整流程（`youtube:publish`）

```
复用已有标签 / 窗口
  → 检查 Studio 登录（当前标签等待，不新开）
  → 当前标签打开上传页（已在则跳过）
  → Select files 选视频
  → 填 Title / Description
  → Next → 儿童内容 → 可见性 → Publish
  → 完成，浏览器保持打开
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `CHROME_CDP_URL` | 已打开 Chrome 的 CDP 地址，如 `http://127.0.0.1:9222` |
| `YOUTUBE_CHANNEL_ID` | 频道 ID，默认 `me` |
| `VIDEO_PRIVACY` | `unlisted` / `public` / `private` |

## 不要用

- `pva youtube login` — 测试结束会关浏览器，且只认中文验证
