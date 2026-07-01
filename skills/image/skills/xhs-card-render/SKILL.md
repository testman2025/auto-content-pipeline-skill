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
| 分页 | `auto-split`（先按 `---` 分章节，章节内按高度切分） |
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

正文段落或要点列表……

---

# 下一章节

- 要点一
- 要点二
```

**要点**：每个 `---` 分隔的章节 = 一张独立卡片（标题+正文不拆页）。章节过长时才会在章节内二次分页，且**标题不会单独留在上一张卡片末尾**。

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
