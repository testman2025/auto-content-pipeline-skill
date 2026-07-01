# 用户画像 — 社媒运营基线配置

> 首次运行时复制为 `user-profile.md` 并填写。`user-profile.md` 含账号信息，请勿提交 Git。
> Agent 会以 **8 年社媒运营经验** 读取本配置，决定选题方向、平台矩阵与发布路由。

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
- YouTube: [启用/关闭]
- LinkedIn: [启用/关闭]
- TikTok: [启用/关闭]
- X (Twitter): [启用/关闭]
- Reddit: [启用/关闭]

## YouTube 配置（启用时填写）
- 频道名称:
- 频道 ID: (如 UCxxxxxxxx)
- Studio 语言: English / 中文
- 默认可见性: unlisted / public / private
- TTS 音色: en-US-JennyNeural
- sau 账号名: default

## LinkedIn 配置（启用时填写）
- 账号类型: personal（个人号，当前支持）/ company（公司主页，预留未接）
- 个人主页 slug: (如 your-name)
- 默认语言: English / 中文
- Cookie 来源: browser（从 Chrome 读取，推荐）/ env（LINKEDIN_COOKIE_HEADER）
- 默认可见性: connections / public
- 上游工具: frizynn/linkedin-cli（`npm run tool:install`）
- 公司 Page ID: （预留，接入公司号时填写）

## TikTok 配置（启用时填写）
- TTS 音色: us-male
- TTS 语速: +50%
- 视频时长下限: 60
- 视频时长上限: 90
- 默认标签: #fyp #TikTokShop
- 视频样式: fancy-text-black（黑底花字，同抖音）
- 一键出片: `npm run pipeline:tiktok -- -File "D:/test/hermes/文章/TikTok/{slug}.md"`
- sau 账号名: default

### 英文 TTS 预设（`npm run tiktok:voices`）

| 预设 | voice | 说明 |
|------|-------|------|
| us-male（默认） | en-US-AndrewNeural | 美式男声 |
| us-female | en-US-JennyNeural | 美式女声 |
| us-male-casual | en-US-BrianNeural | 美式休闲男声 |
| us-female-warm | en-US-AriaNeural | 美式自信女声 |
| uk-male / uk-female | en-GB-* | 英式 |

> 口播稿请写**英文**。时长 **60～90 秒**：过短自动扩展复述（语速不变）；过长自动裁切。

## X (Twitter) 配置（启用时填写）
- 账号 handle: (@username)
- 发帖模式: 常规帖 / X Article（长文需 Premium）
- 字符上限: 280（非 Premium）/ 10000（Premium）
- 默认标签: #YourTag
- Chrome profile: `%APPDATA%\baoyu-skills\chrome-profile`（Windows）

## Reddit 配置（启用时填写）
- 默认 subreddit: (如 learnpython)
- 扩展路径: `tool/reddit-skills/extension/`（`npm run reddit:setup` 打开安装页）
- 桥接地址: `ws://localhost:9334`（默认）

## 账号信息
- 公众号 AppID: （微信公众平台 → 开发 → 基本配置）
- 公众号 AppSecret: （同上，写入 Hermes .env 的 WECHAT_APP_ID / WECHAT_APP_SECRET）
- 公众号发布方式: baoyu-post-to-wechat API（固定；IP 白名单见 mp.weixin.qq.com）
- 小红书登录态: (浏览器/手机扫码)
- 知乎 CLI 状态: (已验证/未配置)
- 抖音 PVA 状态: (已登录/未配置) — `npm run douyin:login`

## API Key（仅记录是否已配置，勿写明文密钥）
- DashScope/通义万相: [已配置/未配置]
- tokenware (OPENAI_API_KEY): [已配置/未配置]
- Tavily: [已配置/未配置]

## 归档路径（可选，默认如下）
- 选题: `D:/test/hermes/选题/`
- 文章: `D:/test/hermes/文章/{平台}/`
- 图片: `D:/test/hermes/图片/{平台}/`
- 视频: `D:/test/hermes/视频/`

## 小红书配图（启用小红书时填写）
- 方案: xhs-card-render（Auto-Redbook，非 AI）
- 默认主题: professional
- 一键出图: `npm run pipeline:xhs -- -Slug {slug}`

## 抖音配置（启用时填写）
- TTS 音色: cn-male
- TTS 语速: +50%
- 默认话题: #跨境电商 #TikTokShop
- 视频样式: fancy-text-black（黑底花字）
- 一键出片: `npm run pipeline:douyin -- -Slug {slug}`

### TTS 音色预设（`npm run douyin:voices` 查看完整列表）

| 预设 ID | 说明 | Edge voice |
|---------|------|------------|
| cn-male | 国内男声（默认） | zh-CN-YunxiNeural |
| cn-male-pro | 国内男声·专业 | zh-CN-YunyangNeural |
| cn-male-passion | 国内男声·激情 | zh-CN-YunjianNeural |
| cn-female | 国内女声 | zh-CN-XiaoxiaoNeural |
| cn-female-lively | 国内女声·活泼 | zh-CN-XiaoyiNeural |
| us-male | 海外男声·美式 | en-US-AndrewNeural |
| us-female | 海外女声·美式 | en-US-JennyNeural |
| us-male-casual | 海外男声·美式休闲 | en-US-BrianNeural |
| us-female-warm | 海外女声·美式自信 | en-US-AriaNeural |
| uk-male | 海外男声·英式 | en-GB-RyanNeural |
| uk-female | 海外女声·英式 | en-GB-SoniaNeural |

> 中文口播稿请用 `cn-*` 预设；英文稿用 `us-*` / `uk-*`。也可直接写完整 voice 名。
> 单次覆盖：`npm run douyin:create-video -- --voice cn-female -f "D:/path/script.md"`

## 平台风控提示（2026-06-30 实测）

| 平台 | 自动发布 | 说明 |
|------|----------|------|
| YouTube | ✅ 用户已验证 | 须 `OVERSEAS_ALLOW_AUTOMATION=true`；禁止 Agent 连跑 check-login |
| 公众号 / 抖音 / 配图 | ✅ 推荐 | baoyu API、PVA、tokenware-image 已验证 |
| 知乎 / 小红书 / Reddit | ✅ 用户已验证 | 国内/扩展桥；Reddit 亦属海外，禁止 Agent 代开浏览器 |
| LinkedIn / X | ❌ 默认关闭 | 禁止 Agent 代开登录、禁止连跑检测；只出稿 |
| TikTok | ⚠️ 出片为主 | 发布需 cookie；禁止反复 login |

**海外平台统一规则**：见仓库 `references/overseas-automation-rules.md`  
- Agent **不得**自动打开浏览器或 Cursor 内浏览器访问海外登录页  
- 用户须**自己**在常用浏览器登录；`check-login` 最多手动执行 **1 次/会话**

X、LinkedIn 对个人账号的**浏览器自动发帖**风控极严。建议：
- 默认关闭自动发布，仅生成 `D:/test/hermes/文章/{平台}/` 文稿由人工发布
- 或使用平台官方 API（通常需企业开发者资质）
- 勿在同一 Chrome profile 混用多平台敏感登录

## 海外工具路径（可选）
- SAU_ROOT: `tool/social-auto-upload`
