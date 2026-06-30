#!/usr/bin/env node
/**
 * LinkedIn 发布 CLI — 文本帖（Playwright）
 * 技能来源: jarvis-survives/openclaw-linkedin-skill
 */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = join(skillRoot, '..');
const profileDir = join(skillRoot, 'playwright/.profile/linkedin');

function parseArgs(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i];
    else if (a === '--file' || a === '-f') opts.file = argv[++i];
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  opts.text = process.env.LINKEDIN_POST_TEXT || opts.text || '';
  return opts;
}

async function acquirePage() {
  mkdirSync(profileDir, { recursive: true });
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1400, height: 900 },
    locale: 'en-US',
  });
  const page = context.pages()[0] || (await context.newPage());
  return { context, page };
}

async function cmdLogin() {
  const { context, page } = await acquirePage();
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  console.log('请在浏览器中完成 LinkedIn 登录，完成后按 Enter...');
  await new Promise((r) => process.stdin.once('data', r));
  console.log('✅ 登录会话已保存在 playwright profile');
  await context.close();
}

async function cmdCheckLogin() {
  const { context, page } = await acquirePage();
  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForTimeout(2000);
    const url = page.url();
    const onLoginPage =
      url.includes('/login') ||
      url.includes('/uas/') ||
      (await page.locator('input#username, input[name="session_key"]').first().isVisible().catch(() => false));
    const hasStartPost = await page
      .getByRole('button', { name: /Start a post|开始发帖/i })
      .first()
      .isVisible()
      .catch(() => false);
    const loggedIn = !onLoginPage && hasStartPost;
    console.log(JSON.stringify({ ok: true, loggedIn, url }, null, 2));
    process.exit(loggedIn ? 0 : 1);
  } finally {
    await context.close();
  }
}

async function cmdPublish(argv) {
  const { text, file } = parseArgs(argv);
  let content = text;
  if (file) {
    if (!existsSync(file)) {
      console.error('文件不存在:', file);
      process.exit(1);
    }
    const { readFileSync } = await import('fs');
    content = readFileSync(file, 'utf8');
  }
  if (!content.trim()) {
    console.error('用法: cli.mjs publish --text "帖子内容" 或 --file article.md');
    process.exit(1);
  }

  const { context, page } = await acquirePage();
  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 120000 });
    const startPost = page.getByRole('button', { name: /Start a post|开始发帖/i }).first();
    await startPost.click({ timeout: 30000 });
    await page.waitForTimeout(1500);

    const editor = page.locator('[contenteditable="true"]').first();
    await editor.waitFor({ state: 'visible', timeout: 30000 });
    await editor.click();
    await editor.fill(content);

    const postBtn = page.getByRole('button', { name: /^Post$|^发布$/ }).last();
    await postBtn.click({ timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('✅ LinkedIn 帖子已提交');
  } catch (err) {
    console.error('❌ 发布失败:', err.message);
    process.exit(1);
  } finally {
    await context.close();
    process.exit(0);
  }
}

const [command, ...rest] = process.argv.slice(2);
const handlers = {
  login: cmdLogin,
  'check-login': cmdCheckLogin,
  publish: () => cmdPublish(rest),
};

if (!handlers[command]) {
  console.log(`LinkedIn CLI\n\n  login | check-login | publish --text "..."`);
  process.exit(command ? 1 : 0);
}

await handlers[command]();
