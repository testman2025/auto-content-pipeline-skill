import { existsSync } from 'fs';
import { spawn, spawnSync } from 'child_process';
import { join } from 'path';
import { skillPkg, toolPath } from './repo-paths.mjs';

export const linkedinCliRoot =
  process.env.LINKEDIN_CLI_ROOT || toolPath('linkedin-cli');

export const linkedinConfigPath =
  process.env.LINKEDIN_CONFIG || join(skillPkg('linkedin'), 'config.yaml');

const CHROME_PATHS = [
  process.env.LINKEDIN_CHROME_PATH,
  process.env.X_BROWSER_CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

export function ensureLinkedInCliInstalled() {
  const pkg = join(linkedinCliRoot, 'pyproject.toml');
  if (!existsSync(pkg)) {
    throw new Error(
      'linkedin-cli 未安装。请执行: npm run tool:install（会 clone frizynn/linkedin-cli 并 uv sync）'
    );
  }
}

export function linkedinCliEnv(extra = {}) {
  return {
    ...process.env,
    LINKEDIN_BROWSER: process.env.LINKEDIN_BROWSER || 'chrome',
    LINKEDIN_CONFIG: linkedinConfigPath,
    ...extra,
  };
}

export function runLinkedInCli(args, opts = {}) {
  ensureLinkedInCliInstalled();
  const cmd = ['uv', 'run', '--directory', linkedinCliRoot, 'linkedin', ...args];
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: linkedinCliRoot,
    stdio: opts.silent ? 'pipe' : 'inherit',
    encoding: opts.silent ? 'utf8' : undefined,
    shell: process.platform === 'win32',
    env: linkedinCliEnv(opts.env),
  });
  if (r.status !== 0 && !opts.allowFail) {
    process.exit(r.status ?? 2);
  }
  return r;
}

export function openSystemChrome(url = 'https://www.linkedin.com/login') {
  const chrome = CHROME_PATHS.find((p) => existsSync(p));
  if (!chrome) {
    return false;
  }
  const child = spawn(chrome, [url], { detached: true, stdio: 'ignore' });
  child.unref();
  return true;
}
