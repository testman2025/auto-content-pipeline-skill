/** YouTube Studio 中英文 UI 选择器（英文界面优先） */

export const STUDIO_LOGGED_IN = [
  'text=Channel content',
  'text=Dashboard',
  'text=频道信息中心',
  'button[aria-label="Account"]',
  'button[aria-label="Create"]',
  'button[aria-label="创建"]',
];

export const STUDIO_NOT_LOGGED_IN = [
  'text=Sign in',
  'text=登录',
  'input[type="email"]',
  'input[name="identifier"]',
];

export const LABELS = {
  create: /^(Create|创建)$/,
  uploadVideos: /^(Upload videos|上传视频)$/,
  signIn: /^(Sign in|登录)$/,
  notForKids: /(No, it's not made for kids|不，内容不是面向儿童的)/,
  next: /^(Next|继续)$/,
  publish: /^(Publish|发布)$/,
  close: /^(Close|关闭)$/,
  public: /^(Public|公开)$/,
  unlisted: /^(Unlisted|不公开列出)$/,
  private: /^(Private|私享)$/,
  channelContent: /^(Channel content|频道信息中心)$/,
  dashboard: /^(Dashboard)$/,
};

export async function dismissStudioPopups(page) {
  const closeAskStudio = page.getByRole('button', { name: /^Close$/ });
  if (await closeAskStudio.isVisible().catch(() => false)) {
    await closeAskStudio.click();
    await page.waitForTimeout(500);
  }
}

export async function isStudioLoggedIn(page) {
  for (const sel of STUDIO_NOT_LOGGED_IN) {
    try {
      if (await page.locator(sel).first().isVisible({ timeout: 400 })) {
        return false;
      }
    } catch {
      // continue
    }
  }
  for (const sel of STUDIO_LOGGED_IN) {
    try {
      if (await page.locator(sel).first().isVisible({ timeout: 800 })) {
        return true;
      }
    } catch {
      // continue
    }
  }
  return (
    page.url().includes('studio.youtube.com') &&
    !page.url().includes('accounts.google.com')
  );
}

export async function clickCreateUpload(page) {
  await dismissStudioPopups(page);
  await page.getByRole('button', { name: LABELS.create }).click();
  await page.waitForTimeout(800);
  await page.getByText(LABELS.uploadVideos).click();
  await page.waitForTimeout(1500);
}

export async function fillTitle(page, title) {
  const candidates = [
    page.getByRole('textbox', { name: /title/i }),
    page.locator('#title-textarea #textbox'),
    page.locator('ytcp-social-suggestion-input #textbox'),
    page.locator('[aria-label*="Add a title" i]'),
    page.locator('[aria-label*="title" i][contenteditable="true"]'),
  ];
  for (const loc of candidates) {
    const box = loc.first();
    try {
      await box.waitFor({ state: 'visible', timeout: 20000 });
      await box.click();
      try {
        await box.fill(title);
      } catch {
        await page.keyboard.press('Control+A');
        await page.keyboard.type(title, { delay: 15 });
      }
      return;
    } catch {
      // next
    }
  }
  throw new Error('未找到标题输入框（Title / 标题）');
}

export async function uploadViaStudioPage(page, videoPath) {
  const channelId = process.env.YOUTUBE_CHANNEL_ID || 'me';
  await page.goto(`https://studio.youtube.com/channel/${channelId}/videos/upload`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await page.waitForTimeout(3000);
  await dismissStudioPopups(page);

  if (await page.locator('text=Sign in').first().isVisible().catch(() => false)) {
    throw new Error('未登录，请运行 npm run youtube:login');
  }

  // 英文 Studio：先出现 Select files / 拖放对话框
  const selectFilesBtn = page.getByRole('button', { name: /^(Select files|选择文件)$/ });
  if (await selectFilesBtn.isVisible().catch(() => false)) {
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 60000 }),
      selectFilesBtn.click(),
    ]);
    await fileChooser.setFiles(videoPath);
  } else {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.waitFor({ state: 'attached', timeout: 60000 });
    await fileInput.setInputFiles(videoPath);
  }

  // 选文件后才出现 Title 输入框
  const titleBox = page.getByRole('textbox', { name: /title/i }).first();
  await titleBox.waitFor({ state: 'visible', timeout: 180000 });
  await page.waitForTimeout(2000);
}

/** @deprecated 使用 uploadViaStudioPage */
export async function uploadViaDirectPage(page, videoPath) {
  return uploadViaStudioPage(page, videoPath);
}

export async function completeUploadWizard(page, { privacy = 'unlisted' } = {}) {
  // 等待小视频处理完成（大文件需更久）
  console.log('等待视频处理...');
  for (let i = 0; i < 24; i++) {
    const publishReady = page.getByRole('button', { name: /^(Publish|Schedule|发布|预定)$/ });
    if (await publishReady.isVisible().catch(() => false)) {
      break;
    }
    const checksDone = page.getByText(/Upload complete|Checks complete|上传完成|检查完毕/i);
    if (await checksDone.isVisible().catch(() => false)) {
      break;
    }
    await page.waitForTimeout(5000);
  }

  const notForKids = page.getByRole('radio', { name: LABELS.notForKids });
  if (await notForKids.isVisible().catch(() => false)) {
    await notForKids.click();
    await page.waitForTimeout(500);
  }

  // 逐步点 Next，直到出现 Publish/Schedule
  for (let step = 0; step < 8; step++) {
    const publishBtn = page.getByRole('button', { name: /^(Publish|Schedule|发布|预定)$/ });
    if (await publishBtn.isVisible().catch(() => false)) {
      break;
    }
    const nextBtn = page.getByRole('button', { name: LABELS.next });
    if (await nextBtn.isVisible().catch(() => false)) {
      const enabled = await nextBtn.isEnabled().catch(() => false);
      if (enabled) {
        await nextBtn.click();
        await page.waitForTimeout(2000);
        continue;
      }
    }
    await page.waitForTimeout(2000);
  }

  if (privacy === 'unlisted') {
    const unlisted = page.getByRole('radio', { name: LABELS.unlisted });
    if (await unlisted.isVisible().catch(() => false)) {
      await unlisted.click();
    } else {
      await page.getByText(LABELS.unlisted).first().click().catch(() => {});
    }
  } else if (privacy === 'private') {
    const priv = page.getByRole('radio', { name: LABELS.private });
    if (await priv.isVisible().catch(() => false)) {
      await priv.click();
    }
  } else {
    const pub = page.getByRole('radio', { name: LABELS.public });
    if (await pub.isVisible().catch(() => false)) {
      await pub.click();
    }
  }

  const publishBtn = page.getByRole('button', { name: /^(Publish|Schedule|Save|Done|发布|预定)$/ });
  const visible = await publishBtn.first().isVisible().catch(() => false);
  if (!visible) {
    const names = await page.getByRole('button').allTextContents();
    throw new Error(`未找到 Publish 按钮。当前可见按钮: ${names.filter(Boolean).slice(0, 20).join(' | ')}`);
  }
  await publishBtn.first().click();
  await page.waitForTimeout(4000);

  const closeBtn = page.getByRole('button', { name: LABELS.close, exact: true });
  if (await closeBtn.isVisible().catch(() => false)) {
    await closeBtn.click();
  }
}
