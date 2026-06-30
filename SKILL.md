---
name: auto-content-pipeline
description: "国内社媒运营实习生Agent —— 全自动选题→搜索→写作→润色→排版→配图→发布→分发流水线。集成 hotspot-monitor / wechat-article-writer / humanizer-zh / baoyu-* / xiaohongshu-* / publishing-* 等技能，一条指令跑完完整发布流程。"
version: 1.1.0
author: Hermes Agent (Nous Research)
license: MIT
metadata:
  hermes:
    tags: [pipeline, social-media, publishing, automation, wechat, xiaohongshu, zhihu, douyin, content-creation]
    related_skills:
      - hotspot-monitor
      - wechat-article-writer
      - humanizer-zh
      - baoyu-cover-image
      - baoyu-xhs-images
      - baoyu-markdown-to-html
      - baoyu-post-to-wechat
      - xiaohongshu-publish
      - multi-platform-publisher
      - publishing-wechat
      - publishing-zhihu
      - publishing-douyin
      - baoyu-post-to-x
      - x-skills
---

# 社媒运营实习生Agent —— 全自动内容流水线

一条指令触发完整社媒管线：选题采集 → 竞品搜索 → 初稿写作 → 去AI润色 → 排版配图 → 多平台发布。

> 核心设计：只保留一个人工确认点——适配矩阵确认。选题方向对了后面全自动。
> 见参考文档：`@file:.hermes/desktop-attachments/auto-content-pipeline-完整方案文档.md`

---

## 管线总览

```
┌──────────────────────────────────────────────────┐
│  Step 0: 读取/初始化用户画像 (user-profile.md)    │
└──────────┬───────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────┐
│  Step 1: 选题采集 (hotspot-monitor)               │
│   → WebSearch / Tavily / 小红书搜索 / RSS          │
│   → 输出 5-8 选题，含热点来源+事实摘要+素材关键词    │
└──────────┬───────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────┐
│  Step 2: 适配矩阵 (唯一人工确认点)                  │
│   → 按用户画像+平台规则自动预判                    │
│   → 输出矩阵表格，等待用户确认                     │
└──────────┬───────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────┐
│  Step 3: 母稿生产 (wechat-article-writer)          │
│   → ≥3平台: 先写深度母稿 → 改写各平台版本           │
│   → 1-2平台: 直接按目标平台风格写                  │
└──────────┬───────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────┐
│  Step 4: 润色 + 排版 + 配图                       │
│   → humanizer-zh 去AI味                          │
│   → baoyu-markdown-to-html 转公众号 HTML          │
│   → tokenware.ai gpt-image-2 生图                │
└──────────┬───────────────────────────────────────┘
           ▼
┌──────────────────────────────────────────────────┐
│  Step 5: 自动发布 + 分发                          │
│   → 公众号: baoyu-post-to-wechat / publishing-wechat  │
│   → 小红书: xiaohongshu-publish (XHS Bridge)       │
│   → 知乎: publishing-zhihu (pyzhihu-cli)           │
│   → 抖音: publishing-douyin (pva)                  │
│   → 多平台改写: multi-platform-publisher (可选)     │
└──────────────────────────────────────────────────┘
```

---

## 当使用此技能时

### 触发条件

- 用户说"跑一篇内容"、"今日选题"、"发一篇文章"
- 用户说"全自动流水线"、"社媒发布"、"运营Agent"
- 用户提供了一个话题并说"帮我写成多平台内容并发布"
- 每天早上8:00 定时跑选题采集（cron模式）

### 不要用于

- 只需要手动写一篇内容，不需要发布（用 wechat-article-writer 单独技能）
- 只需要查热点，不需要创作（用 hotspot-monitor 单独技能）
- 纯翻译/美工任务

---

## Step 0: 用户画像初始化

**每次执行前，先读取 `user-profile.md`。如果不存在，收集以下信息并写入：**

```markdown
# 用户画像 — 社媒运营基线配置

## 基本信息
- 行业:
- 兴趣领域:
- 目标受众:
- 内容风格: (理性分析 / 温暖治愈 / 活泼有趣 / 专业干练)
- 发布偏好: (全自动 / 只生成清单)

## 平台配置
- 知乎: [启用/关闭]
- 公众号: [启用/关闭]
- 小红书: [启用/关闭]
- 抖音: [启用/关闭]

## 账号信息
- 公众号 AppID:
- 公众号 AppSecret:
- 小红书登录态: (浏览器/手机扫码)
- 知乎 CLI 状态: (已验证/未配置)
- 抖音 PVA 状态: (已登录/未配置)

## API Key
- DashScope/通义万相: [已配置/未配置]
- FAL.ai: [已配置/未配置]
- Tavily: [已配置/未配置]
```

**文件位置**: `~/.hermes/skills/publishing/auto-content-pipeline/user-profile.md`

**读取方式**: 先用 `read_file` 检查该路径，不存在则一次性向用户收集所有信息并写入。

---

## Step 1: 选题采集

加载 **hotspot-monitor** 技能，执行：

```
目标: 搜索用户行业+兴趣领域的最近 24-48h 热点
方法:
  - 加载 hotspot-monitor skill
  - web_search 搜索行业关键词+热点/趋势/爆款
  - 如果是小红书活跃用户 → xiaohongshu-publish 搜索竞品内容
  - 如果是知乎活跃用户 → publishing-zhihu 热榜/搜索
  - blogwatcher RSS (如已配置)
  
输出: 5-8 候选选题，每条含:
  1. 选题标题
  2. 热点来源 (哪个平台/新闻源)
  3. 核心事实摘要 (1-2句)
  4. 为什么现在值得写 (时效性/争议性/数据支撑)
  5. 初步素材关键词/链接
```

**完成标准**: 输出选题清单到用户，让用户确认选题方向或直接进入 Step 2。

### 选题采集备选路线

当主流搜索引擎（Google/Bing/Baidu）触发反爬时：

| 替代方案 | 方法 | 适用场景 |
|---------|------|---------|
| 小红书搜索 | `xiaohongshu-publish` → `search-feeds --keyword "xxx"` | 用户已配XHS Bridge |
| 知乎搜索 | 直接浏览器访问 zhihu.com/search | 用户已登录知乎 |
| 行业垂直站 | curl + 合适的User-Agent | Hacker News / 36kr / 跨境站点 |
| 行业RSS | blogwatcher-cli | 已配RSS订阅源 |

**原则**：搜索引擎反爬是常态。优先用已配置的平台技能直接搜索，不要死磕web_search。搜索不通时汇报给用户，不要循环重试。

---

## Step 2: 适配矩阵（人工确认点）

**按用户画像预判适配矩阵，输出后等待用户确认。**

### 预判规则

| 条件 | 判定 |
|------|------|
| 用户只配置了知乎+公众号 | 矩阵只出现这两列 |
| 用户全平台 | 按话题类型自动标注适合/不适合 |
| 活泼有趣风格 | 小红书适配概率↑ |
| 理性分析风格 | 知乎适配概率↑ |

### 平台适配判断

| 平台 | 适合 | 不适合 |
|------|------|--------|
| 知乎 | 深度分析、技术解读、行业趋势、政策解读、对比测评 | 纯生活化、种草带货、情绪八卦 |
| 公众号 | 热点解读、实操干货、行业洞察、人物故事 | 纯学术论证、过于技术化 |
| 小红书 | 产品种草、生活攻略、穿搭护肤、美食旅行、工具推荐 | 纯政策分析、硬核技术、宏大叙事 |
| 抖音 | 热点口播、反转剧情、短教程、种草测评、数据可视化 | 深度长文、纯文字论证 |

### 输出格式

```markdown
# 适配矩阵 - {日期}

| 选题 | 知乎 | 公众号 | 小红书 | 抖音 |
|------|------|--------|--------|------|
| [选题1] | ✅ 深度分析 | ✅ 热点解读 | ❌ 不适合 | ❌ 不适合 |
| [选题2] | ❌ 不适合 | ✅ 实操干货 | ✅ 种草笔记 | ✅ 口播脚本 |

✅ = 推荐  |  ⚠️ = 可尝试  |  ❌ = 不适合

请确认以上矩阵，回复继续或修改：
```

**完成标准**: 用户确认矩阵后进入 Step 3。如果用户修改了矩阵，按修改后的执行。

---

## Step 3: 母稿生产

### 判断策略

- **适配 ≥3 平台**: 先写深度母稿 → 再改写各平台版本
- **适配 1-2 平台**: 直接按目标平台风格写，不走母稿

### 母稿写法（知乎深度格式）

加载 **wechat-article-writer** skill，使用知乎/公众号长文文体。**注意：写出来的不是markdown原文，而是一篇可读性强的文章。**

```
[文章标题]

**一、事件/现象描述**
（用1-2个具体场景或数据开头，自然引入）

**二、核心分析（3-5个论点）**
**1. [论点标题]**
事实依据 / 逻辑推导 / 结论

**三、争议与反方观点**

**四、趋势判断与建议**

**五、结语与讨论引导**
```

**格式原则**：
- 标题用 **加粗**，不用 `#` `##` `###`
- 数据用自然语言描述，不要用 `|` 表格
- 每段3-5行，段间空行
- 不出现 `>` `---` `|` 等markdown符号
- 结尾自然引导评论区讨论

### 各平台改写要点

| 平台 | 改写规则 |
|------|---------|
| 知乎 | 母稿微调：**重写格式**——去掉所有 `#` `##` `###` 标题语法，改加粗文字做章节标题；去掉所有 `|` 表格（改自然语言描述）；去掉 `>` 引用块；去掉 `---` 分隔线；每段3-4行有自然空行；结尾讨论引导放在自然段落里。**写出来是文章，不是markdown文件** |
| 公众号 | 标题加钩子（数字/反问），开头场景切入，每3段小标题，数据故事化，金句收尾，~2500字 |
| 小红书 | 标题反问/感叹，5-8短段每段≤3行，对话口吻，只保留1-2最强论点，结尾标签，500-800字 |
| 抖音 | 3秒钩子开头，全程口语化，15-20秒节奏转折，插入画面提示标注，引导互动，600-900字口播稿 |

**完成标准**: 所有平台稿件的 markdown 文件写入归档目录 `D:/test/hermes/文章/{平台}/{日期}_{slug}.md`

---

## Step 4: 润色 + 排版 + 配图

### 4a. 去AI润色

加载 **humanizer-zh** skill，对每篇稿件依次处理：

```
humanizer-zh 处理规则:
  - 消除排比句、过度整齐的结构
  - 加入口语化表达、适当断句
  - 替换官方套话为自然表达
  - 保留核心论点，不丢失关键信息
  - 对比改写前后确保论点完整性
```

### 4b. 排版（按平台）

| 平台 | 处理方法 |
|------|---------|
| 公众号 | 加载 **baoyu-markdown-to-html** → 用 `bun` 转 HTML（theme: grace 或 modern）|
| 知乎 | **重要：不要直接贴markdown源码。** 按以下规则输出可读性强的知乎文章：
  - **标题层级**：全文只用一个 `#`（文章标题）+ 加粗文字做段落标题，不要用 `##` `###` 多层嵌套
  - **禁止**：不要出现 `|` 表格语法（知乎渲染极差，阅读体验毁掉），重要数据用 **加粗+文字描述** 替代表格
  - **禁止**：大段 `> 引用块` 语法，知乎引用块会让长文读起来像散装
  - **分段**：每段不超过5行，3-4行最佳，段间距用空行
  - **目录感**：用中文序号+加粗做章节分割，如：**一、背景** / **二、核心方法**，不要用 markdown 标题语法
  - **数据呈现**：表格 → 改写成「例如A平台月销$50万、B平台$80万……」的自然描述
  - **分隔线**：不要用 `---` 分隔线，用空行过渡自然分割
  - **结尾**：自然收尾+讨论引导，不要用markdown尾巴
  - **总体原则**：写出来应该是一篇读起来像人写的文章，而不是一个markdown文件|
| 小红书 | 分段缩短、emoji点缀、换行控制 |
| 抖音 | 口播稿 + 画面提示标注 `[画面: ...]` |

### 4c. 配图

| 需求 | 方法 | 说明 |
|------|------|------|
| **所有配图（封面/卡片/插图）** | **tokenware.ai API**（首选） | 直接调 OpenAI-compatible 端点的 `/v1/images/generations`，model=`gpt-image-2` |
| 知乎封面 | 16:9 (`1792x1024`) | prompt描述页面+内容主题 |
| 小红书卡片 | 3:4竖版 (`1024x1792`) | 1-3张，含文字信息 |
| 抖音视频背景 | 16:9封面图裁切 | 同上 |
| 无 API 降级 | `image_generate(FAL)` / 浏览器截图 | 仅当 tokenware 也不可用时 |

**⚠️ 配图失败处理规则**（避免反复调试）:
1. 试一次 tokenware API，失败 → 不去尝试修复配置/换工具/改环境变量
2. **直接把状态汇报给用户**: "配图失败，原因：[错误信息]。可选方案：A)补充配置后重试；B)跳过配图先发文字"
3. 让用户决定下一步。

**tokenware 生图调用方式（已验证可行）**:
```python
import json, urllib.request, base64, os

# 从 hermes .env 读取 OPENAI_API_KEY
env_path = r"D:\Program Files (x86)\hermes\.env"
key = ""
with open(env_path) as f:
    for line in f:
        if line.strip().startswith("OPENAI_API_KEY=") and "***" not in line:
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            break

payload = {
    "model": "gpt-image-2",   # 可用: gpt-image-1, gpt-image-2, imagen-4.0-generate-001
    "prompt": "提示词",
    "n": 1,
    "size": "1792x1024",      # 或 "1024x1792" 3:4竖版, "1024x1024" 1:1
    "response_format": "url"
}
req = urllib.request.Request(
    "https://www.tokenware.ai/v1/images/generations",
    data=json.dumps(payload).encode('utf-8'),
    headers={"Content-Type": "application/json",
             "Authorization": f"Bearer {key}"}
)
resp = json.loads(urllib.request.urlopen(req, timeout=120).read())
img_url = resp['data'][0]['url']  # 然后下载保存
```

**不可行方案**（不要尝试）：
- `image_generate` (FAL) — 当前账号余额已耗尽，续费前不可用
- `darkamenosa/codex-imagen` — 需 Codex/OpenClaw OAuth 凭据，Hermes 环境没有
- `baoyu-cover-image` / `baoyu-xhs-images` — 底层依赖 FAL，同样因余额问题不可用

**参考**: `references/tokenware-image-generation.md`（完整 API 调用示例、可用模型列表、尺寸对照表）

**完成标准**: 所有物料文件就绪——封面图、卡片图均保存到 `D:/test/hermes/图片/{平台}/`。

---

## Step 5: 发布 + 分发

### 公众号发布

| 方式 | 技能 | 命令 |
|------|------|------|
| API 发布（推荐） | baoyu-post-to-wechat | `bun scripts/wechat-api.ts <html> --title "标题" --cover cover.jpg` |
| 草稿箱发布 | publishing-wechat | Node 模板 + access_token |
| 浏览器发布 | baoyu-post-to-wechat | `bun scripts/wechat-browser.ts --markdown article.md --images ./images/` |

### 小红书发布

加载 **xiaohongshu-publish** skill：

```bash
cd /d/tools/xiaohongshu-skills
python scripts/cli.py publish \
  --title-file /tmp/title.txt \
  --content-file /tmp/content.txt \
  --images "D:/test/hermes/图片/小红书/{image1}.jpg" \
  --tags "标签1" "标签2"
```

### 知乎发布

加载 **publishing-zhihu** skill：

```bash
source ~/venvs/zhihu/Scripts/activate
zhihu article "标题" "$(cat D:/test/hermes/文章/知乎/{filename}.md)"
```

### 抖音发布

加载 **publishing-douyin** skill：

```bash
npx @panda-video-automation/pva douyin upload \
  --video "D:/test/hermes/视频/{filename}.mp4" \
  --title "标题 #话题1 #话题2"
```

### 海外平台发布（Step 5 路由）

读取 `user-profile.md` 平台开关，按启用项调用对应 skill：

| 平台 | 条件 | 加载技能 | 发布命令 |
|------|------|----------|----------|
| **YouTube** | YouTube: 启用 | `youtube-skills` → `youtube-upload` | `node youtube-skills/scripts/cli.mjs publish --video "..." --title "..."` |
| **LinkedIn** | LinkedIn: 启用 | `linkedin-skills` → `li-publish` | `node linkedin-skills/scripts/cli.mjs publish --file "D:/test/hermes/文章/LinkedIn/xxx.md"` |
| **TikTok 海外** | TikTok: 启用 | `tiktok-skills` → `tt-publish` | `uv run python tiktok-skills/scripts/cli.py publish --video "..." --title "..."` |
| **X (Twitter)** | X: 启用 | `x-skills` → `x-publish`（baoyu-post-to-x） | `node x-skills/scripts/cli.mjs publish --text "..."` 或 `--file "D:/test/hermes/文章/X/xxx.md"` |

**前置安装（一次性）**：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-overseas-tools.ps1
cd tool/social-auto-upload
uv pip install -e .
patchright install chromium
```

**YouTube** 优先 `sau youtube`（social-auto-upload）；失败时自动回退 Playwright（`YOUTUBE_PUBLISH_BACKEND=playwright` 可强制）。

**LinkedIn** 基于 [openclaw-linkedin-skill](https://github.com/jarvis-survives/openclaw-linkedin-skill)，使用系统 Chrome。**高风险**：无个人发帖 API，自动化极易封号；默认建议仅生成文稿或人工发布。

**TikTok** 基于 social-auto-upload `tk_uploader`（tiktok.com），与抖音 `sau douyin` 不同。

**X (Twitter)** 基于 [baoyu-post-to-x](https://github.com/JimLiu/baoyu-skills#baoyu-post-to-x)（Chrome CDP）。**高风险**：个人号自动化发帖易触发封号；默认建议仅生成文稿（`user-profile` 关闭 X）或走官方 API。

> Hermes Hub 安装 `baoyu-post-to-x` 可能被安全扫描拦截；流水线通过 `tool/baoyu-skills` 本地引用，不依赖 Hub 安装。

### 路由伪代码（Agent 执行 Step 5 时）

```
if user-profile.YouTube == 启用 and 存在视频:
  加载 youtube-skills/skills/youtube-upload
  node youtube-skills/scripts/cli.mjs publish ...

if user-profile.LinkedIn == 启用 and 存在 LinkedIn 文稿:
  加载 linkedin-skills/skills/li-publish
  node linkedin-skills/scripts/cli.mjs publish --file ...

if user-profile.TikTok == 启用 and 存在竖版/海外视频:
  加载 tiktok-skills/skills/tt-publish
  uv run python tiktok-skills/scripts/cli.py publish ...

if user-profile.X == 启用 and 存在 X 文稿/短帖:
  加载 x-skills/skills/x-publish
  node x-skills/scripts/cli.mjs publish --file ... 或 --text ...
```

加载 **multi-platform-publisher** skill，将一篇源内容自动改写N版本并分发到多个平台。

**完成标准**: 输出发布报告：

```markdown
# 发布报告 - {日期}

| 平台 | 状态 | 链接/ID |
|------|------|---------|
| 公众号 | ✅ 已发布/草稿箱 | ... |
| 小红书 | ✅ 已发布 | ... |
| 知乎 | ✅ 已发布 | ... |
| 抖音 | ⏳ 需手动发布 | ... |
| YouTube | ✅/❌ | sau / Playwright |
| LinkedIn | ✅/❌ | 文本帖 |
| TikTok | ✅/❌ | tk_uploader |
| X (Twitter) | ✅/❌ | baoyu-post-to-x CDP |
```

---

## 一条指令跑完整流程

### 模式A：用户给了一个话题

```
hermes -s auto-content-pipeline -q "帮我跑一篇内容，话题：2026下半年TK小店选品趋势"
```

### 模式B：用户说"今日选题"

```
hermes -s auto-content-pipeline -q "今天有什么热点选题？跑一遍完整管线"
```

### 模式C：定时cron（每天8:00选题采集）

```bash
# 每天早上8:00跑选题+适配矩阵，等待用户确认后继续
hermes cron create "0 8 * * *" \
  --skill auto-content-pipeline \
  --name "每日社媒流水线" \
  --prompt "搜索用户行业的今日热点，生成适配矩阵，推送给我确认" \
  --deliver "telegram" \
  --attach_to_session true
```

### 模式D：只触发某个环节

```
hermes -s auto-content-pipeline -q "只做选题采集，帮我看今天TK行业的趋势"
hermes -s auto-content-pipeline -q "帮我把这篇文章润色配图，不发（只做Step 4）"
hermes -s auto-content-pipeline -q "我有一篇写好的内容，帮我发布到小红书和公众号"
```

---

## 归档约定

所有稿件统一保存到 `D:/test/hermes/` 下：

| 目录 | 内容 | 格式 |
|------|------|------|
| `D:/test/hermes/选题/` | 热点监控输出的选题清单 | `{YYYYMMDD}_选题.md` |
| `D:/test/hermes/文章/{平台}/` | 各平台改写后的稿件 | `{YYYYMMDD_HHMMSS}_{slug}.md` |
| `D:/test/hermes/图片/{平台}/` | 封面图+卡片图+内插图 | `{YYYYMMDD_HHMMSS}.{jpg/png/html}` |
| `D:/test/hermes/视频/` | 合成短视频 MP4 | `{YYYYMMDD_HHMMSS}.mp4` |

---

## 文件清单

| 文件 | 位置 | 作用 |
|------|------|------|
| SKILL.md | 同目录 | 流水线主技能文件（本文） |
| DEPLOYMENT.md | 同目录 | 部署指南（给新用户） |
| user-profile.md | 同目录 | 用户画像配置（首次运行时创建） |
| user-profile.template.md | 同目录 | 用户画像模板（供参考） |
| `references/tokenware-image-generation.md` | references/ | tokenware AI 生图 API 参考（FAL 不可用时的替代方案） |
| `scripts/check-deps.sh` | scripts/ | 依赖检查脚本 |
| `scripts/setup.sh` | scripts/ | 一键安装脚本 |

---

## 常见陷阱

1. **用户画像未初始化**: 不要假设用户已经配置好画像。每次执行检查 `user-profile.md`，不存在则一次性收集所有信息。
2. **生图走tokenware，不要走FAL**: 已验证FAL账号余额已耗尽。直接用 tokenware.ai 的 `gpt-image-2` 模型生图（调用方式见 4c 节），不要尝试修复FAL配置，不要尝试FAL余额充值流程。
3. **知乎文章不是markdown**: 写知乎文章时一定要注意格式——不要用 `#` `##` `###` 标题语法，不要用 `|` 表格，不要用 `>` 引用块，不要用 `---` 分隔线。全部改加粗+自然语言描述+自然分段。
4. **配图失败不要自己折腾配置**（关键经验）: 当 `image_generate` 报错（Key未加载/余额不足/凭据问题），**不要反复重试、不要换各种配置方案、不要自己决定降级路线的细节**。直接汇报给用户：「配图失败，原因：XXX。可选方案：A)修复Key；B)跳过配图先发文字；C)我用tokenware API生图（已验证可行）」。让用户拍板。如果用户选择C，直接用 execute_code 调 tokenware.ai 的 `/v1/images/generations` 端点，模型用 `gpt-image-2`。用户不喜欢看调试过程。
5. **和用户沟通要简洁直接**: 这类用户的风格是「告诉我现象，我来决定怎么解决」。跑完一个步骤输出一个**状态表格**（✅完成/⏳进行中/❌卡住+原因），然后给选项让用户选择。不要解释错误细节、不要描述你尝试过的方案、不要长篇总结。
6. **母稿改写用 delegate_task 并行**: 当需要把母稿改写成 ≥2个平台版本时，用 `delegate_task(tasks=[...])` 并行跑改写子任务，不要串行一个个写。保存文件路径用统一归档目录。
7. **小红书发布需要本地浏览器**: xiaohongshu-publish 依赖本地 Chrome + XHS Bridge 扩展。远程 Hermes 终端无法直接操作小红书网页。
8. **发布失败不阻塞全流程**: 一个平台发布失败（如抖音未登录），标记失败原因并继续其他平台。生成发布报告标注哪些成功、哪些需要手动处理。
9. **润色后论点丢失**: humanizer-zh 处理后对比检查核心论点是否完整。丢失则退回重做。
10. **标题不够有吸引力**: 各平台标题必须加钩子（数字/反问/感叹），没有钩子的标题退回重拟。
11. **母稿直接当公众号文章用**: 母稿是知乎深度格式（3000-5000字），公众号需改写为2500字以内+场景切入+金句收尾。
12. **定时任务不确认矩阵就往下跑**: cron模式下矩阵生成后必须等待用户确认才能进入 Step 3-5。确认前最多完成选题采集。
13. **小红书标题超过20字**: 平台强制限制，撰稿时控制在20字以内。
14. **风控问题**: 同一IP高频发布可能触发平台风控。不同平台之间间隔5-10分钟再发布。

---

## 完成检查清单

- [ ] user-profile.md 存在且信息完整
- [ ] Step 1 选题清单输出到用户
- [ ] Step 2 适配矩阵已生成并获用户确认
- [ ] Step 3 所有平台稿件写入 `D:/test/hermes/文章/{平台}/`
- [ ] Step 4a humanizer-zh 处理后核心论点无丢失
- [ ] Step 4b 排版文件就绪（公众号HTML/小红书短文案/知乎Markdown/抖音脚本）
- [ ] Step 4c 封面图/卡片图已生成或降级方案就绪
- [ ] Step 5 发布报告已输出（成功/失败/待手动）
- [ ] 所有产出物已归档到 `D:/test/hermes/` 对应目录
