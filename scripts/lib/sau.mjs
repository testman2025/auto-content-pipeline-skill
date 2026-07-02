import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../..');

export const sauRoot =
  process.env.SAU_ROOT || join(repoRoot, 'tool/social-auto-upload');

export function sauAccount(platform) {
  const key = `${platform.toUpperCase()}_ACCOUNT_ID`;
  return process.env[key] || process.env.SAU_ACCOUNT_ID || 'default';
}

export function resolveSauCmd() {
  if (process.env.SAU_CLI_COMMAND) {
    return process.env.SAU_CLI_COMMAND.split(' ');
  }
  return ['uv', 'run', '--directory', sauRoot, 'sau'];
}

export function runSau(args, opts = {}) {
  if (!existsSync(join(sauRoot, 'sau_cli.py'))) {
    throw new Error(`social-auto-upload 未安装: ${sauRoot}\n请运行: npm run overseas:install`);
  }
  if (!existsSync(join(sauRoot, 'conf.py'))) {
    throw new Error(
      `缺少 conf.py，请执行: Copy-Item tool/social-auto-upload/conf.example.py tool/social-auto-upload/conf.py`
    );
  }
  const cmd = [...resolveSauCmd(), ...args];
  const headed = process.env.SAU_HEADED === 'true';
  const hasHeadFlag = args.some((a) => a === '--headed' || a === '--headless');
  if (headed && !hasHeadFlag) {
    cmd.push('--headed');
  }
  const { env: extraEnv, ...restOpts } = opts;
  const r = spawnSync(cmd[0], cmd.slice(1), {
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: false,
    encoding: 'utf8',
    cwd: sauRoot,
    env: { ...process.env, ...extraEnv },
    ...restOpts,
  });
  if (r.status !== 0) {
    const detail = r.stderr || r.stdout || '';
    throw new Error(`sau 失败: ${cmd.join(' ')}\n${detail}`.trim());
  }
  return r;
}

export function sauAvailable() {
  return existsSync(join(sauRoot, 'sau_cli.py'));
}
