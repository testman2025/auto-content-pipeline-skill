# 用户画像 — 社媒运营基线配置

> 首次运行时复制为 `user-profile.md` 并填写。`user-profile.md` 含账号信息，请勿提交 Git。

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

## YouTube 配置（启用时填写）
- 频道名称:
- 频道 ID: (如 UCxxxxxxxx)
- Studio 语言: English / 中文
- 默认可见性: unlisted / public / private
- TTS 音色: en-US-JennyNeural
- sau 账号名: default

## LinkedIn 配置（启用时填写）
- 个人主页 slug:
- 默认语言: English / 中文

## TikTok 配置（启用时填写）
- sau 账号名: default
- 默认标签: #fyp

## X (Twitter) 配置（启用时填写）
- 账号 handle: (@username)
- 发帖模式: 常规帖 / X Article（长文需 Premium）
- 字符上限: 280（非 Premium）/ 10000（Premium）
- 默认标签: #YourTag
- Chrome profile: `%APPDATA%\baoyu-skills\chrome-profile`（Windows）

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

## 平台风控提示

X、LinkedIn 对个人账号的**浏览器自动发帖**风控极严，存在封号风险。建议：
- 默认关闭自动发布，仅生成 `D:/test/hermes/文章/{平台}/` 文稿由人工发布
- 或使用平台官方 API（通常需企业开发者资质）
- 勿在同一 Chrome profile 混用多平台敏感登录

## 海外工具路径（可选）
- SAU_ROOT: `tool/social-auto-upload`
