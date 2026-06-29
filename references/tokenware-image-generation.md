# Tokenware AI 生图 API 参考

> 当 FAL 余额耗尽时的替代方案。已验证 tokenware.ai 的 `gpt-image-2` 模型稳定可用。

## 调用地址

```
POST https://www.tokenware.ai/v1/images/generations
```

认证方式：`Authorization: Bearer {OPENAI_API_KEY}`（与 tokenware 聊天 API 同个 key）

## 可用模型

| 模型ID | 类型 | 说明 |
|--------|------|------|
| `gpt-image-2` | 通用 | 首选，质量稳定速度快 |
| `gpt-image-2-2026-04-21` | 通用 | 同上，固定快照版本 |
| `gpt-image-1` | 通用 | 稍旧但更快 |
| `gpt-image-1-mini` | 快速 | 低质量快速出图 |
| `imagen-4.0-generate-001` | Google | 高质量，稍慢 |
| `imagen-4.0-ultra-generate-001` | Google | 最高质量，最慢 |
| `imagen-4.0-fast-generate-001` | Google | 快速版 |
| `imagen-3.0-generate-002` | Google | 旧版 |
| `gemini-3.1-flash-image-preview` | Gemini | 实验性 |
| `gemini-3-pro-image-preview` | Gemini | 实验性 |

## 尺寸对照表

| 用途 | 尺寸 | aspect_ratio |
|------|------|-------------|
| 知乎封面 | `1792x1024` | 16:9 |
| 公众号封面 | `1792x1024` | 16:9 |
| 小红书卡片 | `1024x1792` | 3:4 |
| 抖音封面/背景 | `1792x1024` | 16:9 |
| 正方形 | `1024x1024` | 1:1 |

## 代码模板

```python
import json, urllib.request, base64, os

# 从 Hermes .env 读取 key（路径: hermes config env-path）
import os
env_path = os.environ.get("HERMES_ENV_PATH", os.path.expanduser("~/.hermes/.env"))
key = ""
with open(env_path) as f:
    for line in f:
        if line.strip().startswith("OPENAI_API_KEY=") and "***" not in line:
            key = line.split("=", 1)[1].strip().strip('"').strip("'")
            break

payload = {
    "model": "gpt-image-2",
    "prompt": "你的提示词",
    "n": 1,
    "size": "1792x1024",
    "response_format": "url"  # 或 "b64_json"
}
req = urllib.request.Request(
    "https://www.tokenware.ai/v1/images/generations",
    data=json.dumps(payload).encode('utf-8'),
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}"
    }
)
resp = json.loads(urllib.request.urlopen(req, timeout=120).read())
img_url = resp['data'][0]['url']

# 下载保存
out_path = "D:/test/hermes/图片/知乎/封面.png"
os.makedirs(os.path.dirname(out_path), exist_ok=True)
req2 = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(req2, timeout=30) as f, open(out_path, 'wb') as out:
    out.write(f.read())
```

## 注意事项

- `response_format="url"` 返回的 URL 有时效性（约几小时），下载到本地再保存
- timeout 设置 120 秒以上，gpt-image-2 出图约 30-60 秒
- 提示词建议加中英文双语说明，效果更好
- 3:4 竖版 (`1024x1792`) 用于小红书卡片图
