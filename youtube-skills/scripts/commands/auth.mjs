import readline from 'readline';
import {
  acquireYouTubePage,
  ensureStudioLoggedIn,
  navigateStudioUpload,
} from '../lib/browser.mjs';
import { isStudioLoggedIn } from '../lib/studio-i18n.mjs';

function waitForEnter(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(message, () => {
      rl.close();
      resolve();
    });
  });
}

export async function cmdCheckLogin() {
  const session = await acquireYouTubePage();
  const { page, context } = session;
  try {
    await navigateStudioUpload(page);
    const loggedIn = await isStudioLoggedIn(page);
    console.log(JSON.stringify({ ok: true, loggedIn, url: page.url() }, null, 2));
    if (!loggedIn) {
      process.exitCode = 1;
    }
    return loggedIn;
  } finally {
    await session.release();
    process.exit(process.exitCode ?? 0);
  }
}

export async function cmdLogin() {
  console.log('=== YouTube Studio 登录（单窗口，不自动关闭）===\n');
  console.log('提示: 附着已打开的 Chrome:');
  console.log('  chrome.exe --remote-debugging-port=9222');
  console.log('  $env:CHROME_CDP_URL="http://127.0.0.1:9222"\n');

  const session = await acquireYouTubePage();
  const { page, context, mode } = session;

  await navigateStudioUpload(page);
  const ok = await ensureStudioLoggedIn(page, context);

  if (!ok) {
    console.error('登录失败或超时');
    await session.release();
    process.exit(1);
  }

  console.log(`\n✅ 登录成功（模式: ${mode}）`);
  console.log('接下来发布: node youtube-skills/scripts/cli.mjs publish --video <路径> --title "标题"');
  await waitForEnter('\n按 Enter 结束脚本（浏览器窗口保持打开）...');
  await session.release();
}
