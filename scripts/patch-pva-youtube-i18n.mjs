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

const WIZARD_PATCH = `    // Step 8: Wizard — EN/ZH (skip slow legacy privacy loop)
    console.log(\`🔒 Finishing upload wizard, privacy: \${config.privacy}\`);
    await page.waitForTimeout(2000);
    const notForKids = page.getByRole('radio', { name: /(No, it's not made for kids|不，内容不是面向儿童的)/ });
    if (await notForKids.isVisible().catch(() => false))
        await notForKids.click();
    const nextBtn = page.getByRole('button', { name: /^(Next|继续)$/ });
    for (let i = 0; i < 4; i++) {
        if (await nextBtn.isVisible().catch(() => false) && await nextBtn.isEnabled().catch(() => false)) {
            await nextBtn.click();
            await page.waitForTimeout(1500);
        }
    }
    const privacy = config.privacy || 'unlisted';
    if (privacy === 'public') {
        const pub = page.getByRole('radio', { name: /^(Public|公开)$/ });
        if (await pub.isVisible().catch(() => false))
            await pub.click();
    }
    else if (privacy === 'private') {
        const priv = page.getByRole('radio', { name: /^(Private|私享)$/ });
        if (await priv.isVisible().catch(() => false))
            await priv.click();
    }
    else {
        const unlisted = page.getByRole('radio', { name: /^(Unlisted|不公开列出)$/ });
        if (await unlisted.isVisible().catch(() => false))
            await unlisted.click();
    }
    const publishBtn = page.getByRole('button', { name: /^(Publish|Schedule|发布|预定)$/ });
    await publishBtn.waitFor({ state: 'visible', timeout: 180000 });
    await publishBtn.click();
    await page.waitForTimeout(4000);
    const closeBtn = page.getByRole('button', { name: /^(Close|关闭)$/, exact: true });
    if (await closeBtn.isVisible().catch(() => false))
        await closeBtn.click();
    console.log('✅ Upload published');
});`;

let loginJs = readFileSync(files.login, 'utf8');
if (loginJs.includes('Verifying login by checking for 频道信息中心')) {
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
}
writeFileSync(files.login, loginJs);

let uploadJs = readFileSync(files.upload, 'utf8');
uploadJs = uploadJs.replace(
  `await page.getByRole('button', { name: '创建' }).click();
    await page.waitForTimeout(1000);
    // Step 4: Click "上传视频" to open file picker
    await page.getByText('上传视频').click();`,
  `await page.getByRole('button', { name: /^(Create|创建)$/ }).click();
    await page.waitForTimeout(1000);
    await page.getByText(/^(Upload videos|上传视频)$/).click();`
);

const step8Start = uploadJs.indexOf('// Step 8:');
const step8Legacy = uploadJs.indexOf('// Step 8: Set privacy/visibility');
if (step8Legacy !== -1) {
  uploadJs = uploadJs.slice(0, step8Legacy) + WIZARD_PATCH;
} else if (step8Start !== -1 && !uploadJs.includes('Finishing upload wizard')) {
  const end = uploadJs.lastIndexOf('});');
  uploadJs = uploadJs.slice(0, step8Start) + WIZARD_PATCH;
}

writeFileSync(files.upload, uploadJs);
console.log('✅ pva YouTube 英文界面补丁已应用');
