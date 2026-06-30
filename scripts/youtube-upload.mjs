/**
 * YouTube 视频上传（英文/中文 Studio）
 */
import { chromium } from 'playwright';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  completeUploadWizard,
  dismissStudioPopups,
  fillTitle,
  isStudioLoggedIn,
  uploadViaDirectPage,
} from './lib/youtube-studio-i18n.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const authFile = join(
  rootDir,
  'node_modules/@panda-video-automation/pva/playwright/.auth/youtube.json'
);
const profileDir = join(rootDir, 'playwright/.profile/youtube');

const videoPath = process.env.VIDEO_PATH || process.argv[2];
const title = process.env.VIDEO_TITLE || process.argv[3] || 'auto-content-pipeline test';
const description = process.env.VIDEO_DESC || process.argv[4] || '';
const privacy = process.env.VIDEO_PRIVACY || 'unlisted';

if (!videoPath || !existsSync(videoPath)) {
  console.error('用法: npm run youtube:upload -- <视频路径> [标题] [描述]');
  process.exit(1);
}

let context;
if (existsSync(profileDir)) {
  try {
    context = await chromium.launchPersistentContext(profileDir, {
      headless: false,
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      args: ['--disable-blink-features=AutomationControlled'],
    });
    console.log('使用已登录的 Playwright profile');
  } catch (err) {
    console.log('Profile 被占用，改用 auth 文件:', err.message?.slice(0, 80));
  }
}

if (!context) {
  if (!existsSync(authFile)) {
    console.error('请先运行: npm run youtube:login');
    process.exit(1);
  }
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  context = await browser.newContext({
    storageState: authFile,
    viewport: { width: 1920, height: 1080 },
    locale: 'en-US',
  });
  console.log('使用 auth 文件登录态');
}

const page = context.pages()[0] || (await context.newPage());

if (!(await isStudioLoggedIn(page))) {
  console.log('校验 Studio 登录态...');
  await page.goto('https://studio.youtube.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}
if (!(await isStudioLoggedIn(page))) {
  console.error('登录态无效，请重新: npm run youtube:login');
  await context.close();
  process.exit(1);
}

console.log('打开 YouTube 上传页...');
await uploadViaDirectPage(page, videoPath);
await dismissStudioPopups(page);

console.log(`标题: ${title}`);
await fillTitle(page, title);

if (description) {
  const descBox = page.getByRole('textbox', { name: /description/i }).first();
  if (await descBox.isVisible().catch(() => false)) {
    await descBox.fill(description);
  }
}

console.log(`可见性: ${privacy}`);
await completeUploadWizard(page, { privacy });

console.log('上传流程已完成，浏览器保持 30 秒供确认...');
await page.waitForTimeout(30000);
await context.close();
