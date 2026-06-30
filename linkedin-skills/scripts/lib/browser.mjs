/**
 * LinkedIn 浏览器 — 使用系统 Chrome，避免 Playwright Chromium 被 LinkedIn 拦截。
 */
import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function defaultLinkedInProfileDir() {
  if (process.env.LINKEDIN_PROFILE_DIR) {
    return process.env.LINKEDIN_PROFILE_DIR;
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
    return join(appData, 'auto-content-pipeline', 'linkedin-chrome-profile');
  }
  return join(homedir(), '.auto-content-pipeline', 'linkedin-chrome-profile');
}

export const profileDir = defaultLinkedInProfileDir();

const STEALTH_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--no-first-run',
  '--no-default-browser-check',
];

function resolveChromeChannel() {
  if (process.env.LINKEDIN_BROWSER_CHANNEL) {
    return process.env.LINKEDIN_BROWSER_CHANNEL;
  }
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ];
  if (process.platform === 'win32' && chromePaths.some((p) => existsSync(p))) {
    return 'chrome';
  }
  return 'chrome';
}

async function applyStealth(context) {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
}

export async function acquireLinkedInPage() {
  const cdpUrl = process.env.LINKEDIN_CDP_URL || process.env.CHROME_CDP_URL;

  if (cdpUrl) {
    console.log(`附着到已打开的 Chrome: ${cdpUrl}`);
    const browser = await chromium.connectOverCDP(cdpUrl);
    const context = browser.contexts()[0];
    if (!context) {
      throw new Error('CDP 已连接但未找到浏览器上下文');
    }
    const page =
      context.pages().find((p) => p.url().includes('linkedin.com')) ||
      context.pages()[0] ||
      (await context.newPage());
    return { mode: 'cdp', browser, context, page, async release() {} };
  }

  mkdirSync(profileDir, { recursive: true });
  const channel = resolveChromeChannel();
  console.log(`使用系统 ${channel} 持久化配置: ${profileDir}`);

  const context = await chromium.launchPersistentContext(profileDir, {
    channel,
    headless: false,
    viewport: { width: 1400, height: 900 },
    locale: 'en-US',
    args: STEALTH_ARGS,
    ignoreDefaultArgs: ['--enable-automation'],
  });

  await applyStealth(context);

  const page = context.pages()[0] || (await context.newPage());
  return {
    mode: 'persistent',
    browser: null,
    context,
    page,
    async release() {
      await context.close();
    },
  };
}

export function openSystemChromeForLogin(url = 'https://www.linkedin.com/login') {
  const chromePaths = [
    process.env.LINKEDIN_CHROME_PATH,
    process.env.X_BROWSER_CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean);

  const chrome = chromePaths.find((p) => existsSync(p));
  if (!chrome) {
    return false;
  }

  const args = [`--user-data-dir=${profileDir}`, url];
  const child = spawn(chrome, args, { detached: true, stdio: 'ignore' });
  child.unref();
  return true;
}
