#!/usr/bin/env node
/**
 * 修补 tool/social-auto-upload/uploader/youtube_uploader/main.py：
 * - cookie_auth / login 使用 YT_PROXY
 * - check 与 login 一致用有头 Chrome（避免 headless 误判 invalid）
 * - 放宽 Studio URL 判定（studio.youtube.com 即可，不必 /channel/）
 * - 校验失败时输出日志
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { repoRoot } from './lib/repo-paths.mjs';

const mainPy = join(repoRoot, 'tool/social-auto-upload/uploader/youtube_uploader/main.py');

if (!existsSync(mainPy)) {
  console.log('[skip] social-auto-upload 未安装');
  process.exit(0);
}

let src = readFileSync(mainPy, 'utf8');

if (src.includes('cookie 校验失败: 被重定向到登录页')) {
  console.log('[ok] sau youtube cookie_auth patch already applied');
  process.exit(0);
}

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

if (!cookieAuthRe.test(src)) {
  console.warn('[warn] youtube_uploader/main.py cookie_auth 结构已变，请手动核对 patch');
  process.exit(0);
}

src = src.replace(cookieAuthRe, newCookieAuth);

const cookieGenLaunchRe =
  /browser = await playwright\.chromium\.launch\(headless=False, channel="chrome"\)/;

if (cookieGenLaunchRe.test(src)) {
  src = src.replace(
    cookieGenLaunchRe,
    `browser = await playwright.chromium.launch(
            headless=False,
            channel="chrome",
            proxy={"server": YT_PROXY} if YT_PROXY else None,
        )`
  );
}

const loginWaitRe =
  /if "\/channel\/" in page\.url:/g;

if (loginWaitRe.test(src)) {
  src = src.replace(
    loginWaitRe,
    'if "studio.youtube.com" in page.url and "/channel/" in page.url:'
  );
}

writeFileSync(mainPy, src, 'utf8');
console.log('[ok] patched sau youtube cookie_auth (YT_PROXY + headed check + Studio URL + logging)');
