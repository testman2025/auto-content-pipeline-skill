# YouTube Skills

YouTube Studio 自动化技能包，结构与 `xiaohongshu-skills` 对齐。

## 子技能

| 技能 | 说明 |
|------|------|
| [yt-auth](skills/yt-auth/SKILL.md) | Studio 登录 |
| [yt-publish](skills/yt-publish/SKILL.md) | 上传发布 |
| [yt-create](skills/yt-create/SKILL.md) | TTS + 视频合成 |
| [yt-pipeline](skills/yt-pipeline/SKILL.md) | 全流程 |

## 安装

在仓库根目录执行：

```powershell
npm install
```

依赖：`playwright`（经 pva）、`ffmpeg`、`edge-tts`（经 uv）。

## 使用

```powershell
node youtube-skills/scripts/cli.mjs --help
node youtube-skills/scripts/cli.mjs check-login
node youtube-skills/scripts/cli.mjs login
node youtube-skills/scripts/cli.mjs publish --video "D:/abs/video.mp4" --title "Title"
node youtube-skills/scripts/cli.mjs pipeline
```

详见 [references/publishing.md](references/publishing.md)。
