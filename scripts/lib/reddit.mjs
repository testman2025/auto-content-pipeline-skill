import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { toolPath } from './repo-paths.mjs';

export const redditRoot = process.env.REDDIT_SKILLS_ROOT || toolPath('reddit-skills');

export function ensureRedditSkillsInstalled() {
  const cli = toolPath('reddit-skills', 'scripts', 'cli.py');
  if (!existsSync(cli)) {
    throw new Error('reddit-skills 未安装。请执行: npm run tool:install');
  }
}

export function runRedditCli(args, opts = {}) {
  ensureRedditSkillsInstalled();
  const cmd = ['uv', 'run', '--directory', redditRoot, 'python', 'scripts/cli.py', ...args];
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: redditRoot,
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0 && !opts.allowFail) {
    process.exit(r.status ?? 2);
  }
  return r;
}
