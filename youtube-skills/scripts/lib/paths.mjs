import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

/** youtube-skills 根目录 */
export const skillRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** auto-content-pipeline 仓库根目录 */
export const repoRoot = join(skillRoot, '..');

export const profilePath =
  process.env.USER_PROFILE_PATH || join(repoRoot, 'user-profile.md');

export const hermesRoot = process.env.HERMES_ROOT || 'D:/test/hermes';

export const defaultBgImage = join(skillRoot, 'assets/default-bg.jpg');

const skillProfileDir = join(skillRoot, 'playwright/.profile/youtube');
const legacyProfileDir = join(repoRoot, 'playwright/.profile/youtube');

/** 优先使用旧路径（迁移期兼容已有登录态） */
export const profileDir = existsSync(legacyProfileDir)
  ? legacyProfileDir
  : skillProfileDir;

export const authFile = join(
  repoRoot,
  'node_modules/@panda-video-automation/pva/playwright/.auth/youtube.json'
);
