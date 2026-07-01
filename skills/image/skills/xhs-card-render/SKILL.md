---
name: xhs-card-render
description: |
  小红书图文卡片渲染（非 AI 生图）。基于 Auto-Redbook-Skills：Markdown + YAML frontmatter
  → HTML/CSS → Playwright 截图，输出 1080×1440 PNG（cover + card_N）。
  当流水线 Step 4c 为小红书配图、或用户要求「小红书卡片」「MD 转小红书图」时使用。
  禁止使用 tokenware / gpt-image-2 为小红书正文卡片配图。
version: 1.0.0
metadata:
  hermes:
    tags: [xiaohongshu, card, markdown, playwright, pipeline]
    homepage: https://github.com/comeonzhj/Auto-Redbook-Skills
---

# 小红书卡片渲染（xhs-card-render）

**HTML/CSS 模板渲染，不是 AI 生图。** 无水印、无 AI 元数据，适合跨境干货号。

## 默认配置（已验证）

| 项 | 值 |
|----|-----|
| 主题 | `professional`（商务蓝，专业干练） |
| 分页 | `auto-split`（短章节自动合并填满卡片，过长章节内二次分页） |
| 尺寸 | 1080×1440（3:4） |
| 工具路径 | `tool/Auto-Redbook-Skills` 或 `D:/test/tool/Auto-Redbook-Skills` |

## Markdown 格式

```markdown
---
emoji: "📊"
title: "主标题（封面用，≤20字）"
subtitle: "副标题"
author: "昵称"
date: "2026-06-29"
---

# 章节标题

导语 1-2 句，交代背景或结论……

- 要点一（15-30 字，可含 **加粗关键词**）
- 要点二
- 要点三
- 要点四

---

# 下一章节

……
```

## 撰稿规格（饱满度）

流水线 **Step 3/4b 写小红书配图 MD 时必须遵守**，避免一页只有标题+三条短 bullet 显得空。

| 项 | 建议 |
|----|------|
| **全篇正文卡** | 目标 **3-4 张**（含封面共 4-5 张图） |
| **每个 `---` 章节** | **220-280 字**（含标题不计入），目标占卡片高度 **~85%** |
| **章节结构** | `# 标题` + **导语 2-3 句** + **4-5 条**要点列表 |
| **每条要点** | **20-35 字**，写清动作/数字/原因，不要只写短语 |
| **分隔符 `---`** | 逻辑分节用；渲染时会**自动合并短节**填满单卡，不必刻意少写 |

**要点**：`---` 是写作时的逻辑章节，不是「一节必一页」。短章节会合并到同一张卡片；单节超过一卡高度时才会拆页，且**标题不会单独留在上一张末尾**。

## 命令

仓库根目录：

```powershell
npm run xhs:card-render -- `
  --file "D:/test/hermes/文章/小红书/xxx.md" `
  --out "D:/test/hermes/图片/小红书/xxx"
```

可选参数：`--theme professional`（默认）、`--mode auto-split`（默认）、`--mode separator`（严格按 `---` 一页一节）。

## 输出

- `cover.png` — 封面（emoji + 标题 + 副标题）
- `card_1.png` … `card_N.png` — 正文卡片

发布时把 `cover.png` 与全部 `card_*.png` 传给 `skills/xiaohongshu` 的 `publish` / `fill-publish`。

## 依赖

```powershell
npm run tool:install   # 克隆 tool/Auto-Redbook-Skills
pip install markdown pyyaml playwright
playwright install chromium
```

## 与 tokenware-image 分工

| 平台 | 配图方式 |
|------|----------|
| **小红书正文卡片** | **本技能**（xhs-card-render） |
| 知乎封面 | tokenware-image |
| 公众号封面 | tokenware-image |
| 抖音/YouTube 封面 | tokenware-image |

## 配图失败

汇报错误，选项：A) 检查 Python/Playwright；B) 跳过配图先发文字。不要改用 AI 生图。
