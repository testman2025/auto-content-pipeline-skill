# YouTube 发布参考

## CLI 入口

所有操作通过统一 CLI：

```powershell
node youtube-skills/scripts/cli.mjs <command>
```

npm 快捷方式（根目录 `package.json`）：

| npm 命令 | CLI 等价 |
|----------|----------|
| `npm run youtube:login` | `cli.mjs login` |
| `npm run youtube:publish` | `cli.mjs publish` |
| `npm run youtube:pipeline` | `cli.mjs pipeline` |

## 推荐：附着已打开的 Chrome

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
$env:CHROME_CDP_URL = "http://127.0.0.1:9222"
$env:YOUTUBE_CHANNEL_ID = "UCxxxxxxxx"
node youtube-skills/scripts/cli.mjs publish --video "D:/path/video.mp4" --title "标题"
```

## 目录结构

```
youtube-skills/
├── SKILL.md                 # 技能路由入口
├── skills/
│   ├── yt-auth/             # 登录
│   ├── yt-publish/          # 发布
│   ├── yt-create/           # 视频创作
│   └── yt-pipeline/         # 全流程
├── scripts/
│   ├── cli.mjs              # 统一 CLI（对标 xhs cli.py）
│   ├── commands/            # 子命令实现
│   └── lib/                 # 浏览器、Studio、TTS、合成
├── assets/default-bg.jpg    # 默认视频背景
├── playwright/.profile/     # 持久化登录（gitignore）
└── references/publishing.md
```

## 不要用

- `pva youtube login` — 测试结束会关浏览器，且只认中文验证

## 全流程

```powershell
# user-profile.md 已配置 YouTube 区块
node youtube-skills/scripts/cli.mjs pipeline
```

产出归档在 `HERMES_ROOT`（默认 `D:/test/hermes/`）。
