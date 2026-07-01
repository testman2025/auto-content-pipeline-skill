# 小红书卡片自定义主题

在此目录放置 `{主题名}.css`，渲染时 `-t {主题名}` 即可使用（无需改 Auto-Redbook 源码）。

## 快速开始

1. 复制 `professional.css`（来自 `tool/Auto-Redbook-Skills/assets/themes/`）为本目录新文件，如 `my-brand.css`
2. 修改配色、字号、标题下划线等（选择器见下方）
3. 渲染：

```powershell
npm run xhs:card-render -- -File "文章.md" -Out "输出目录" -Theme my-brand
```

## 可改什么

| 层级 | 文件 | 说明 |
|------|------|------|
| 卡片内排版 | 本目录 `*.css` | 字号、颜色、列表、引用块 |
| 外框渐变 | `render_xhs.py` 的 `theme_backgrounds` | 封面/卡片外圈背景色（自定义主题可补丁追加） |

## 内置示例

- `hermes-crossborder.css` — 跨境干货号：海军蓝 + 橙色强调（基于 professional）

## 环境变量

`XHS_THEMES_DIR` — 额外主题目录（优先级低于内置 `assets/themes/`，高于流水线默认路径）
