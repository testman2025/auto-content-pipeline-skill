#!/usr/bin/env node
/**
 * LinkedIn 发布 CLI — 文本帖（系统 Chrome + Playwright）
 * 技能来源: jarvis-survives/openclaw-linkedin-skill
 */
import { existsSync, readFileSync } from 'fs';
import { acquireLinkedInPage, openSystemChromeForLogin, profileDir } from './lib/browser.mjs';

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

async function cmdLogin() {
  const useChromeOnly = process.env.LINKEDIN_LOGIN_CHROME_ONLY === 'true';

  if (useChromeOnly || openSystemChromeForLogin('https://www.linkedin.com/login')) {
    console.log(`配置目录: ${profileDir}`);
    console.log('已用系统 Chrome 打开 LinkedIn 登录页。');
    console.log('若仍提示「浏览器不安全」，请确认打开的是 Chrome 而非 Playwright Chromium。');
    console.log('登录完成后按 Enter 保存会话...');
    await new Promise((r) => process.stdin.once('data', r));
    console.log('✅ 登录会话已保存在 Chrome profile');
    return;
  }

  const { context, page, release } = await acquireLinkedInPage();
  try {
    await page.goto('https://www.linkedin.com/login', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    console.log(`配置目录: ${profileDir}`);
    console.log('请在浏览器中完成 LinkedIn 登录，完成后按 Enter...');
    await new Promise((r) => process.stdin.once('data', r));
    console.log('✅ 登录会话已保存在 Chrome profile');
  } finally {
    await release();
  }
}

async function cmdCheckLogin() {
  const { context, page, release } = await acquireLinkedInPage();
  try {
    await page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
    await page.waitForTimeout(2000);
    const url = page.url();
    const onLoginPage =
      url.includes('/login') ||
      url.includes('/uas/') ||
      url.includes('/checkpoint/') ||
      (await page.locator('input#username, input[name="session_key"]').first().isVisible().catch(() => false));
    const hasStartPost = await page
      .getByRole('button', { name: /Start a post|开始发帖/i })
      .first()
      .isVisible()
      .catch(() => false);
    const loggedIn = !onLoginPage && hasStartPost;
    console.log(JSON.stringify({ ok: true, loggedIn, url, profileDir }, null, 2));
    process.exit(loggedIn ? 0 : 1);
  } finally {
    await release();
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
    content = readFileSync(file, 'utf8');
  }
  if (!content.trim()) {
    console.error('用法: cli.mjs publish --text "帖子内容" 或 --file article.md');
    process.exit(1);
  }

  const { page, release } = await acquireLinkedInPage();
  try {
    await page.goto('https://www.linkedin.com/feed/', {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    });
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
    if (/login|secure|browser/i.test(err.message)) {
      console.error('提示: 先执行 npm run linkedin:login，并确保使用系统 Chrome 登录');
    }
    process.exit(1);
  } finally {
    await release();
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
  console.log(`LinkedIn CLI（系统 Chrome）

  login | check-login | publish --text "..."

环境变量:
  LINKEDIN_PROFILE_DIR      Chrome 配置目录
  LINKEDIN_CDP_URL          附着已打开的 Chrome CDP（如 http://127.0.0.1:9222）
  LINKEDIN_LOGIN_CHROME_ONLY=true  登录时仅用系统 Chrome 打开`);
  process.exit(command ? 1 : 0);
}

await handlers[command]();
