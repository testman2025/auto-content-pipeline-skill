/**
 * YouTube Studio 登录（英文/中文界面，浏览器不自动关闭）
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import {
  isStudioLoggedIn,
  STUDIO_LOGGED_IN,
} from './lib/youtube-studio-i18n.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const authFile = join(
  rootDir,
  'node_modules/@panda-video-automation/pva/playwright/.auth/youtube.json'
);
const profileDir = join(rootDir, 'playwright/.profile/youtube');

const STUDIO_URL =
  process.env.YOUTUBE_STUDIO_URL ||
  'https://studio.youtube.com/channel/me/videos/upload';

mkdirSync(dirname(authFile), { recursive: true });
mkdirSync(profileDir, { recursive: true });

async function saveAuth(context, reason) {
  await context.storageState({ path: authFile });
  const count = (await context.cookies()).length;
  console.log(`[${new Date().toLocaleTimeString('zh-CN')}] 登录态已保存 (${reason})，cookies=${count}`);
  console.log(`  → ${authFile}`);
}

function waitForEnter(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

console.log('=== YouTube Studio 登录（EN/ZH，浏览器保持打开）===');

const context = await chromium.launchPersistentContext(profileDir, {
  headless: false,
  viewport: { width: 1920, height: 1080 },
  locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});

const page = context.pages()[0] || (await context.newPage());
await page.goto(STUDIO_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });

let saved = false;
const deadline = Date.now() + 15 * 60 * 1000;

while (Date.now() < deadline) {
  if (await isStudioLoggedIn(page)) {
    await page.waitForTimeout(2000);
    await saveAuth(context, 'Studio 已登录');
    saved = true;
    break;
  }
  const elapsed = Math.floor((Date.now() - (deadline - 15 * 60 * 1000)) / 1000);
  console.log(`等待登录中... ${elapsed}s`);
  await page.waitForTimeout(5000);
}

if (!saved) {
  console.error('15 分钟内未检测到 Studio 登录。支持识别:', STUDIO_LOGGED_IN.join(', '));
  await waitForEnter('按 Enter 关闭浏览器...');
  await context.close();
  process.exit(1);
}

console.log('\n登录成功。可执行: npm run youtube:upload -- <视频路径> <标题>');
await waitForEnter('按 Enter 关闭浏览器...');
await context.close();
