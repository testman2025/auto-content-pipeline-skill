/**
 * 复用已打开的浏览器标签，避免每次新开 Playwright 窗口。
 *
 * 优先级：
 * 1. CHROME_CDP_URL — 附着到你已打开的 Chrome（需 --remote-debugging-port=9222）
 * 2. playwright/.profile/youtube — 持久化 Chromium（登录后保持同一窗口）
 * 3. auth 文件 — 兜底（会新开窗口，不推荐）
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { isStudioLoggedIn } from './youtube-studio-i18n.mjs';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '../..');
const authFile = join(
  rootDir,
  'node_modules/@panda-video-automation/pva/playwright/.auth/youtube.json'
);
const profileDir = join(rootDir, 'playwright/.profile/youtube');

const STUDIO_URL_RE = /studio\.youtube\.com|youtube\.com\/upload/;

function pickStudioPage(context) {
  const pages = context.pages();
  return (
    pages.find((p) => STUDIO_URL_RE.test(p.url())) ||
    pages.find((p) => !p.url().startsWith('about:')) ||
    pages[0] ||
    null
  );
}

export async function acquireYouTubePage() {
  const cdpUrl = process.env.CHROME_CDP_URL || process.env.PLAYWRIGHT_CDP_URL;

  if (cdpUrl) {
    console.log(`附着到已打开的 Chrome: ${cdpUrl}`);
    const browser = await chromium.connectOverCDP(cdpUrl);
    const context = browser.contexts()[0];
    if (!context) {
      throw new Error('CDP 已连接但未找到浏览器上下文');
    }
    const page = pickStudioPage(context) || (await context.newPage());
    console.log(`复用标签页: ${page.url() || '(新标签)'}`);
    return {
      mode: 'cdp',
      browser,
      context,
      page,
      async release() {
        /* 不关闭用户自己的 Chrome */
      },
    };
  }

  mkdirSync(profileDir, { recursive: true });
  try {
    const context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      args: ['--disable-blink-features=AutomationControlled'],
    });
    const page = pickStudioPage(context) || (await context.newPage());
    console.log('复用 Playwright 持久化浏览器（同一窗口/标签）');
    console.log(`当前标签: ${page.url() || 'about:blank'}`);
    return {
      mode: 'persistent',
      browser: null,
      context,
      page,
      async release() {
        /* 保持窗口打开，供下次继续操作 */
      },
    };
  } catch (err) {
    console.log(`持久化浏览器被占用，尝试 auth 文件: ${String(err.message).slice(0, 100)}`);
  }

  if (!existsSync(authFile)) {
    throw new Error('无可用浏览器会话。请先: npm run youtube:login\n或启动 Chrome: chrome.exe --remote-debugging-port=9222');
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    storageState: authFile,
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });
  const page = await context.newPage();
  console.log('⚠️ 使用 auth 文件（会新开窗口）。建议用 CDP 或先 youtube:login 保持 profile 窗口');
  return {
    mode: 'auth-fallback',
    browser,
    context,
    page,
    async release() {
      await context.close();
      await browser.close();
    },
  };
}

export async function saveAuth(context) {
  mkdirSync(dirname(authFile), { recursive: true });
  await context.storageState({ path: authFile });
  console.log(`登录态已同步到: ${authFile}`);
}

export async function ensureStudioLoggedIn(page, context, { waitMinutes = 15 } = {}) {
  if (await isStudioLoggedIn(page)) {
    return true;
  }

  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'me';
  if (!STUDIO_URL_RE.test(page.url())) {
    await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/upload`, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
  }

  console.log('请在当前浏览器窗口完成登录（不会新开标签）...');
  const deadline = Date.now() + waitMinutes * 60 * 1000;
  while (Date.now() < deadline) {
    if (await isStudioLoggedIn(page)) {
      await saveAuth(context);
      return true;
    }
    await page.waitForTimeout(5000);
  }
  return false;
}

export async function navigateStudioUpload(page) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'me';
  const target = `https://studio.youtube.com/channel/${channelId}/videos/upload`;

  if (page.url().includes('/videos/upload')) {
    console.log('已在 Studio 上传页，继续当前标签操作');
    return;
  }

  if (page.url().includes('studio.youtube.com')) {
    console.log('已在 YouTube Studio，当前标签跳转到上传页');
    await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
    return;
  }

  console.log('导航到 YouTube Studio 上传页（当前标签）');
  await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
}
