import { sauAccount, runSau, sauAvailable } from '../../../../scripts/lib/sau.mjs';
import { isStudioLoggedIn } from '../lib/studio-i18n.mjs';
import {
  acquireYouTubePage,
  navigateStudioUpload,
} from '../lib/browser.mjs';

export async function cmdCheckLogin() {
  if (sauAvailable()) {
    const account = sauAccount('youtube');
    const r = runSau(['youtube', 'check', '--account', account], { silent: true });
    const out = (r.stdout || '').trim();
    const loggedIn = out === 'valid';
    console.log(JSON.stringify({ ok: true, loggedIn, account, backend: 'sau' }, null, 2));
    process.exit(loggedIn ? 0 : 1);
  }

  const session = await acquireYouTubePage();
  const { page } = session;
  try {
    await navigateStudioUpload(page);
    const loggedIn = await isStudioLoggedIn(page);
    console.log(JSON.stringify({ ok: true, loggedIn, backend: 'playwright', url: page.url() }, null, 2));
    process.exit(loggedIn ? 0 : 1);
  } finally {
    await session.release();
    process.exit(process.exitCode ?? 0);
  }
}

export async function cmdLogin() {
  if (!sauAvailable()) {
    console.error('请先安装 social-auto-upload，见 skills/youtube/skills/youtube-upload/references/runtime-requirements.md');
    process.exit(1);
  }
  const account = sauAccount('youtube');
  console.log(`=== sau youtube login (account: ${account}) ===\n`);
  runSau(['youtube', 'login', '--account', account]);
}
