#!/usr/bin/env node
/**
 * 修补 tool/social-auto-upload YouTube 相关代码：
 * 1. cookie_auth / login 使用 YT_PROXY、有头 Chrome、放宽 Studio URL
 * 2. upload 流程人性化间隔（_human_pause）、封面上传等待、进度 100% 判定
 * 3. publish 前跳过浏览器 cookie_auth（避免连开两个窗口）
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { repoRoot } from './lib/repo-paths.mjs';

const mainPy = join(repoRoot, 'tool/social-auto-upload/uploader/youtube_uploader/main.py');
const sauCliPy = join(repoRoot, 'tool/social-auto-upload/sau_cli.py');

if (!existsSync(mainPy)) {
  console.log('[skip] social-auto-upload 未安装');
  process.exit(0);
}

let mainSrc = readFileSync(mainPy, 'utf8');
let sauCliSrc = existsSync(sauCliPy) ? readFileSync(sauCliPy, 'utf8') : '';
let changed = false;

// --- 1. cookie_auth patch ---
if (!mainSrc.includes('cookie 校验失败: 被重定向到登录页')) {
  const cookieAuthRe =
    /async def cookie_auth\(account_file\) -> bool:[\s\S]*?finally:\s*\n\s*await browser\.close\(\)/;

  const newCookieAuth = `async def cookie_auth(account_file) -> bool:
    """登录态是否仍有效：带 cookie 打开 Studio，未被踢到 Google 登录页且进入 Studio 即有效。"""
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=False,
            channel="chrome",
            proxy={"server": YT_PROXY} if YT_PROXY else None,
        )
        try:
            context = await browser.new_context(storage_state=account_file)
            context = await set_init_script(context)
            page = await context.new_page()
            await page.goto(STUDIO_URL, wait_until="domcontentloaded", timeout=120000)
            await page.wait_for_timeout(3000)
            url = page.url
            if "accounts.google.com" in url or "/signin" in url.lower():
                youtube_logger.warning(_msg("⚠️", f"cookie 校验失败: 被重定向到登录页 ({url})"))
                return False
            if "studio.youtube.com" in url:
                return True
            youtube_logger.warning(_msg("⚠️", f"cookie 校验失败: 未进入 Studio ({url})"))
            return False
        except Exception as exc:
            youtube_logger.warning(_msg("⚠️", f"cookie 校验异常: {exc}"))
            return False
        finally:
            await browser.close()`;

  if (cookieAuthRe.test(mainSrc)) {
    mainSrc = mainSrc.replace(cookieAuthRe, newCookieAuth);
    changed = true;
    console.log('[ok] patched cookie_auth');
  } else {
    console.warn('[warn] cookie_auth 结构已变，请手动核对');
  }

  const cookieGenLaunchRe =
    /browser = await playwright\.chromium\.launch\(headless=False, channel="chrome"\)/;
  if (cookieGenLaunchRe.test(mainSrc)) {
    mainSrc = mainSrc.replace(
      cookieGenLaunchRe,
      `browser = await playwright.chromium.launch(
            headless=False,
            channel="chrome",
            proxy={"server": YT_PROXY} if YT_PROXY else None,
        )`
    );
  }

  const loginWaitRe = /if "\/channel\/" in page\.url:/g;
  if (loginWaitRe.test(mainSrc)) {
    mainSrc = mainSrc.replace(
      loginWaitRe,
      'if "studio.youtube.com" in page.url and "/channel/" in page.url:'
    );
  }
} else {
  console.log('[ok] cookie_auth patch already applied');
}

// --- 2. human pace patch ---
if (!mainSrc.includes('async def _human_pause')) {
  if (!mainSrc.includes('import random')) {
    mainSrc = mainSrc.replace('import asyncio\n', 'import asyncio\nimport random\nimport re\n');
  }

  const humanPauseFn = `
async def _human_pause(page: Page, min_ms: int = 900, max_ms: int = 2200) -> None:
    """模拟真人操作间隔，降低 YouTube 风控识别率。"""
    await page.wait_for_timeout(random.randint(min_ms, max_ms))
`;

  mainSrc = mainSrc.replace(
    /def _msg\(emoji: str, text: str\) -> str:\n    return f"\{emoji\} \{text\}"\n/,
    `def _msg(emoji: str, text: str) -> str:\n    return f"{emoji} {text}"\n${humanPauseFn}`
  );

  // _click_if_present: add human pauses
  mainSrc = mainSrc.replace(
    /async def _click_if_present\(page: Page, selector: str, timeout: int = 4000\) -> bool:[\s\S]*?return False\n/,
    `async def _click_if_present(page: Page, selector: str, timeout: int = 4000, *, human: bool = True) -> bool:
    try:
        el = page.locator(selector).first
        await el.wait_for(state="visible", timeout=timeout)
        if human:
            await _human_pause(page, 400, 1000)
        await el.click()
        if human:
            await _human_pause(page, 700, 1600)
        return True
    except Exception:
        return False
`
  );

  // _fill_editable: slower typing
  mainSrc = mainSrc.replace(
    /await box\.type\(text, delay=6\)/g,
    'await box.type(text, delay=random.randint(35, 65))'
  );
  mainSrc = mainSrc.replace(
    /await page\.wait_for_timeout\(400\)\n    await _dismiss_autocomplete/,
    'await _human_pause(page, 800, 1500)\n    await _dismiss_autocomplete'
  );

  // thumbnail wait helper
  if (!mainSrc.includes('async def _wait_thumbnail_ready')) {
    const thumbFn = `
async def _wait_thumbnail_ready(page: Page, max_secs: int = 90) -> bool:
    """等封面缩略图预览出现，确认上传完成后再继续。"""
    for _ in range(max_secs):
        try:
            preview = page.locator(
                "img#img-with-fallback, ytcp-thumbnail-uploader img, #thumbnail-picker img"
            ).first
            if await preview.count() and await preview.is_visible():
                youtube_logger.info(_msg("🖼️", "封面预览已就绪"))
                await _human_pause(page, 1500, 3000)
                return True
        except Exception:
            pass
        await page.wait_for_timeout(1000)
    youtube_logger.warning(_msg("⚠️", "等封面预览超时，继续后续步骤"))
    return False

`;
    mainSrc = mainSrc.replace(
      /async def _wait_upload_complete/,
      `${thumbFn}async def _wait_upload_complete`
    );
  }

  // upload flow: replace fixed timeouts with human pauses
  mainSrc = mainSrc.replace(
    /await page\.goto\(UPLOAD_URL, wait_until="domcontentloaded"\)\n        await page\.wait_for_timeout\(3000\)/,
    `await page.goto(UPLOAD_URL, wait_until="domcontentloaded")
        await _human_pause(page, 2500, 4500)`
  );
  mainSrc = mainSrc.replace(
    /await file_input\.set_input_files\(self\.file_path\)\n\n        # 2\) 等详情对话框/,
    `await _human_pause(page, 800, 1500)
        await file_input.set_input_files(self.file_path)
        await _human_pause(page, 2000, 4000)

        # 2) 等详情对话框`
  );
  mainSrc = mainSrc.replace(
    /await thumb_input\.set_input_files\(self\.thumbnail_path\)\n                await page\.wait_for_timeout\(2000\)/,
    `await thumb_input.set_input_files(self.thumbnail_path)
                await _wait_thumbnail_ready(page)`
  );

  changed = true;
  console.log('[ok] patched human pace helpers');
} else {
  console.log('[ok] human pace patch already applied');
}

// --- 3. sau_cli: skip browser cookie_auth before publish ---
if (sauCliSrc && !sauCliSrc.includes('_youtube_cookie_file_usable')) {
  const uploadFnRe =
    /async def upload_youtube_video\(request: YouTubeVideoUploadRequest\) -> Path:[\s\S]*?await app\.main\(\)\n    return account_file/;

  const newUploadFn = `def _youtube_cookie_file_usable(account_file: Path) -> bool:
    """轻量检查 cookie 文件是否存在且可读，不在发布前再开浏览器做 cookie_auth。"""
    if not account_file.exists() or account_file.stat().st_size < 100:
        return False
    try:
        import json

        data = json.loads(account_file.read_text(encoding="utf-8"))
        return bool(data.get("cookies"))
    except Exception:
        return False


async def upload_youtube_video(request: YouTubeVideoUploadRequest) -> Path:
    account_file = resolve_account_file("youtube", request.account_name)
    # 发布前不再调用 youtube_setup/cookie_auth，避免「先开浏览器 check 再开浏览器 upload」
    # 连开两个窗口触发 Google 风控。若 cookie 失效，upload 流程内会检测登录页并抛错。
    if not _youtube_cookie_file_usable(account_file):
        raise RuntimeError(
            f"YouTube cookie is missing or expired: {account_file}. Run \`sau youtube login --account {request.account_name}\` first."
        )

    app = YouTubeVideo(
        request.title,
        str(request.video_file),
        request.tags,
        str(account_file),
        description=request.description,
        thumbnail_path=str(request.thumbnail_file) if request.thumbnail_file else None,
        playlist=request.playlist,
        visibility=request.visibility,
        debug=request.debug,
        headless=request.headless,
    )
    await app.main()
    return account_file`;

  if (uploadFnRe.test(sauCliSrc)) {
    sauCliSrc = sauCliSrc.replace(uploadFnRe, newUploadFn);
    changed = true;
    console.log('[ok] patched sau_cli upload_youtube_video (skip pre-check browser)');
  } else {
    console.warn('[warn] sau_cli upload_youtube_video 结构已变，请手动核对');
  }
} else if (sauCliSrc) {
  console.log('[ok] sau_cli skip-precheck patch already applied');
}

if (changed) {
  writeFileSync(mainPy, mainSrc, 'utf8');
  if (sauCliSrc) writeFileSync(sauCliPy, sauCliSrc, 'utf8');
  console.log('[done] sau youtube patches applied');
} else {
  console.log('[done] all sau youtube patches up to date');
}
