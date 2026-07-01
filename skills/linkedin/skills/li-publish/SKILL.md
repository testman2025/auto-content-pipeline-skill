---
name: li-publish
description: LinkedIn 个人号文本帖发布（frizynn/linkedin-cli）。
version: 1.1.0
---

# LinkedIn 发布（个人号）

```powershell
npm run linkedin:publish -- --text "帖子正文"
npm run linkedin:publish -- --file "D:/test/hermes/文章/LinkedIn/xxx.md"
npm run linkedin:publish -- --file "..." --visibility public
```

发布前须 `linkedin:check-login` 通过。仅 **个人 Feed**，非公司主页。

`--visibility`：`connections`（默认）| `public`
