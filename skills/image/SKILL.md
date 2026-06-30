---
name: image-skills
description: |
  社媒流水线配图技能包。内置 tokenware-image：tokenware.ai gpt-image-2 生封面/卡片/插图。
version: 1.0.0
metadata:
  hermes:
    tags: [image, tokenware, pipeline]
---

# Image Skills

配图子技能，供 `auto-content-pipeline` Step 4c 使用。

## 子技能

| 技能 | 说明 |
|------|------|
| **tokenware-image** | tokenware API 生图（唯一配图方案） |

## 快速开始

```powershell
npm run image:check-key
npm run image:generate -- --platform wechat --prompt "公众号封面，科技风" --out "D:/test/hermes/图片/公众号/cover.png"
```

## Hermes 加载

Step 4c 执行：`skill_view("tokenware-image")`，按子技能 SKILL.md 调用 CLI。
