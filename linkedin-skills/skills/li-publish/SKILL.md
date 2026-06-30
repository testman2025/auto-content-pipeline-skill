---
name: li-publish
description: LinkedIn 文本帖发布。
version: 1.0.0
---

# LinkedIn 发布

```powershell
node linkedin-skills/scripts/cli.mjs publish --text "帖子正文"
node linkedin-skills/scripts/cli.mjs publish --file "D:/test/hermes/文章/LinkedIn/xxx.md"
```

发布前须 `login` 一次。动作宜保持人工节奏，避免触发风控。
