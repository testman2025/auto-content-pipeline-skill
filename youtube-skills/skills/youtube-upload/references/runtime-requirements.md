# 运行前提

## 安装 social-auto-upload

```powershell
cd auto-content-pipeline-skill
powershell -ExecutionPolicy Bypass -File scripts/install-overseas-tools.ps1
cd tool/social-auto-upload
copy conf.example.py conf.py
uv pip install -e .
patchright install chromium
```

## 验证 sau

```powershell
uv run --directory tool/social-auto-upload sau youtube --help
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `SAU_ROOT` | 默认 `tool/social-auto-upload` |
| `YOUTUBE_ACCOUNT_ID` | sau 账号名，默认 `default` |
| `SAU_HEADED=true` | 有头模式（登录推荐） |

## 代理（国内）

编辑 `tool/social-auto-upload/conf.py`：

```python
YT_PROXY = "http://127.0.0.1:7890"
```

## 回退方案

若 `sau` 未安装或失败，设置：

```powershell
$env:YOUTUBE_PUBLISH_BACKEND = "playwright"
```

将使用 `youtube-skills` 内置 Playwright Studio 自动化。
