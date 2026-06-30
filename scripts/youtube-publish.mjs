/**
 * YouTube 完整发布流程（单浏览器 / 单标签）
 *
 * 登录检查 → 当前标签打开 Studio 上传 → 选文件 → 填标题 → 向导 → 发布
 * 默认不关闭浏览器，下次在同一窗口继续。
 *
 * 用法:
 *   npm run youtube:publish -- <视频路径> [标题] [描述]
 *
 * 附着到已打开的 Chrome（推荐，真正复用你正在看的标签）:
 *   $env:CHROME_CDP_URL="http://127.0.0.1:9222"
 *   npm run youtube:publish -- video.mp4 "标题"
 */
import { existsSync } from 'fs';
import {
  acquireYouTubePage,
  ensureStudioLoggedIn,
  navigateStudioUpload,
} from './lib/youtube-browser.mjs';
import {
  completeUploadWizard,
  dismissStudioPopups,
  fillTitle,
  uploadViaStudioPage,
} from './lib/youtube-studio-i18n.mjs';

const videoPath = process.env.VIDEO_PATH || process.argv[2];
const title = process.env.VIDEO_TITLE || process.argv[3] || 'auto-content-pipeline test';
const description = process.env.VIDEO_DESC || process.argv[4] || '';
const privacy = process.env.VIDEO_PRIVACY || 'unlisted';

if (!videoPath || !existsSync(videoPath)) {
  console.error('用法: npm run youtube:publish -- <视频路径> [标题] [描述]');
  process.exit(1);
}

console.log('=== YouTube 创作 → 发布（单标签流程）===\n');

const session = await acquireYouTubePage();
const { page, context, mode } = session;

try {
  // 1. 登录（在当前标签等待，不新开窗口）
  const loggedIn = await ensureStudioLoggedIn(page, context);
  if (!loggedIn) {
    console.error('登录超时。请在本窗口完成 Google/YouTube 登录后重试。');
    process.exit(1);
  }
  console.log('✅ Studio 已登录\n');

  // 2. 当前标签进入上传页
  await navigateStudioUpload(page);
  await page.waitForTimeout(2000);
  await dismissStudioPopups(page);

  // 3. 选文件（uploadViaStudioPage 若已在 upload 页则不再跳转）
  console.log('📁 选择视频文件...');
  await uploadViaStudioPage(page, videoPath);

  // 4. 填写信息
  console.log(`✏️  标题: ${title}`);
  await fillTitle(page, title);

  if (description) {
    const descBox = page.getByRole('textbox', { name: /description/i }).first();
    if (await descBox.isVisible().catch(() => false)) {
      await descBox.fill(description);
      console.log('✏️  描述已填写');
    }
  }

  // 5. 向导 → 发布
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
}
