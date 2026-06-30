/**
 * 为 @panda-video-automation/pva 打英文 Studio 适配补丁（npm install 后执行）
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pvaDir = join(root, 'node_modules/@panda-video-automation/pva/dist/automations/YouTube');

const files = {
  login: join(pvaDir, 'login-youtube.spec.js'),
  upload: join(pvaDir, 'upload-video.spec.js'),
};

if (!existsSync(files.login)) {
  console.error('pva 未安装，请先 npm install');
  process.exit(1);
}

let loginJs = readFileSync(files.login, 'utf8');
loginJs = loginJs.replace(
  `console.log('🔍 Verifying login by checking for 频道信息中心...');
    const dashboardText = page.getByText('频道信息中心').first();
    await dashboardText.waitFor({ state: 'visible', timeout: 30000 });
    await test_1.test.expect(dashboardText).toBeVisible({ timeout: 30000 });
    console.log('✅ Login verified: 频道信息中心 is visible');`,
  `console.log('🔍 Verifying login (EN/ZH Studio)...');
    const dashboardText = page.getByText(/^(Channel content|Dashboard|频道信息中心)$/).first();
    await dashboardText.waitFor({ state: 'visible', timeout: 60000 });
    await test_1.test.expect(dashboardText).toBeVisible({ timeout: 60000 });
    console.log('✅ Login verified: Studio dashboard visible');`
);
writeFileSync(files.login, loginJs);

let uploadJs = readFileSync(files.upload, 'utf8');
uploadJs = uploadJs.replace(
  `await page.getByRole('button', { name: '创建' }).click();
    await page.waitForTimeout(1000);
    // Step 4: Click "上传视频" to open file picker
    await page.getByText('上传视频').click();`,
  `await page.getByRole('button', { name: /^(Create|创建)$/ }).click();
    await page.waitForTimeout(1000);
    // Step 4: Click upload menu (EN/ZH)
    await page.getByText(/^(Upload videos|上传视频)$/).click();`
);
uploadJs = uploadJs.replace(
  `await page.getByRole('radio', { name: '不，内容不是面向儿童的' }).click();
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByRole('button', { name: '继续' }).click();
    await page.getByRole('radio', { name: '公开', exact: true }).click();
    await page.getByRole('button', { name: '发布' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('button', { name: '关闭', exact: true }).click();`,
  `const notForKids = page.getByRole('radio', { name: /(No, it's not made for kids|不，内容不是面向儿童的)/ });
    if (await notForKids.isVisible().catch(() => false)) await notForKids.click();
    const nextBtn = page.getByRole('button', { name: /^(Next|继续)$/ });
    for (let i = 0; i < 3; i++) {
        if (await nextBtn.isVisible().catch(() => false)) { await nextBtn.click(); await page.waitForTimeout(1200); }
    }
    const privacy = config.privacy || 'unlisted';
    if (privacy === 'public') {
        const pub = page.getByRole('radio', { name: /^(Public|公开)$/ });
        if (await pub.isVisible().catch(() => false)) await pub.click();
    } else if (privacy === 'private') {
        const priv = page.getByRole('radio', { name: /^(Private|私享)$/ });
        if (await priv.isVisible().catch(() => false)) await priv.click();
    } else {
        const unlisted = page.getByRole('radio', { name: /^(Unlisted|不公开列出)$/ });
        if (await unlisted.isVisible().catch(() => false)) await unlisted.click();
    }
    await page.getByRole('button', { name: /^(Publish|发布)$/ }).click();
    await page.waitForTimeout(3000);
    const closeBtn = page.getByRole('button', { name: /^(Close|关闭)$/, exact: true });
    if (await closeBtn.isVisible().catch(() => false)) await closeBtn.click();`
);
writeFileSync(files.upload, uploadJs);

console.log('✅ pva YouTube 英文界面补丁已应用');
