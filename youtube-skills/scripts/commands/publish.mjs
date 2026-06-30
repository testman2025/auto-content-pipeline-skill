import { existsSync } from 'fs';
import {
  acquireYouTubePage,
  ensureStudioLoggedIn,
  navigateStudioUpload,
} from '../lib/browser.mjs';
import {
  completeUploadWizard,
  dismissStudioPopups,
  fillTitle,
  uploadViaStudioPage,
} from '../lib/studio-i18n.mjs';

function parseArgs(argv) {
  const opts = { privacy: process.env.VIDEO_PRIVACY || 'unlisted' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--video' || a === '-v') opts.video = argv[++i];
    else if (a === '--title' || a === '-t') opts.title = argv[++i];
    else if (a === '--description' || a === '-d') opts.description = argv[++i];
    else if (a === '--privacy' || a === '-p') opts.privacy = argv[++i];
    else if (!a.startsWith('-') && !opts.video) opts.video = a;
    else if (!a.startsWith('-') && !opts.title) opts.title = a;
    else if (!a.startsWith('-') && !opts.description) opts.description = a;
  }
  opts.video = process.env.VIDEO_PATH || opts.video;
  opts.title = process.env.VIDEO_TITLE || opts.title || 'YouTube upload';
  opts.description = process.env.VIDEO_DESC || opts.description || '';
  return opts;
}

export async function cmdPublish(argv) {
  const { video, title, description, privacy } = parseArgs(argv);

  if (!video || !existsSync(video)) {
    console.error('用法: cli.mjs publish --video <绝对路径> --title "标题" [--description "描述"] [--privacy unlisted]');
    process.exit(1);
  }

  console.log('=== YouTube 发布（单标签流程）===\n');

  const session = await acquireYouTubePage();
  const { page, context, mode } = session;

  try {
    const loggedIn = await ensureStudioLoggedIn(page, context);
    if (!loggedIn) {
      console.error('登录超时。请在本窗口完成 Google/YouTube 登录后重试。');
      process.exit(1);
    }
    console.log('✅ Studio 已登录\n');

    await navigateStudioUpload(page);
    await page.waitForTimeout(2000);
    await dismissStudioPopups(page);

    console.log('📁 选择视频文件...');
    await uploadViaStudioPage(page, video);

    console.log(`✏️  标题: ${title}`);
    await fillTitle(page, title);

    if (description) {
      const descBox = page.getByRole('textbox', { name: /description/i }).first();
      if (await descBox.isVisible().catch(() => false)) {
        await descBox.fill(description);
        console.log('✏️  描述已填写');
      }
    }

    console.log(`🔒 可见性: ${privacy}`);
    await completeUploadWizard(page, { privacy });

    console.log('\n✅ 发布流程完成');
    console.log(`   模式: ${mode}`);
    console.log(`   标签: ${page.url()}`);
    console.log('   浏览器保持打开，可继续手动检查或下次在同一窗口发布');
  } catch (err) {
    console.error('\n❌ 发布失败:', err.message);
    process.exit(1);
  } finally {
    await session.release();
    process.exit(0);
  }
}
