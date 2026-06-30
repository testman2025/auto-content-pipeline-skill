# YouTube 发布（英文 Studio）

## 登录

```bash
npm run youtube:login
```

- 识别 **Channel content** / **Dashboard**（英文）或 **频道信息中心**（中文）
- 浏览器**不会自动关闭**，按 Enter 后才关

## 上传

```bash
npm run youtube:upload -- "D:/test/hermes/视频/xxx.mp4" "视频标题"
```

## 与 pva 的关系

| 命令 | 说明 |
|------|------|
| `npm run youtube:login` | 推荐，EN/ZH，不自动关浏览器 |
| `pva youtube login` | 不推荐，只认中文且自动关浏览器 |
| `pva youtube upload` | `npm install` 后会自动打英文补丁，也可用 |
| `npm run youtube:patch-pva` | 手动重新打 pva 英文补丁 |

## 英文界面关键文案

| 步骤 | 英文 | 中文 |
|------|------|------|
| 创建 | Create | 创建 |
| 上传 | Upload videos | 上传视频 |
| 儿童内容 | No, it's not made for kids | 不，内容不是面向儿童的 |
| 下一步 | Next | 继续 |
| 不公开列出 | Unlisted | 不公开列出 |
| 发布 | Publish | 发布 |
| 关闭 | Close | 关闭 |
