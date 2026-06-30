import { existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { repoRoot } from './repo-paths.mjs';

export const baoyuSkillRoot =
  process.env.BAOYU_X_SKILL_ROOT ||
  join(repoRoot, 'tool/baoyu-skills/skills/baoyu-post-to-x');

export const baoyuScriptsDir = join(baoyuSkillRoot, 'scripts');

export function ensureBaoyuXInstalled() {
  const skillMd = join(baoyuSkillRoot, 'SKILL.md');
  if (!existsSync(skillMd)) {
    throw new Error(
      `baoyu-post-to-x 未安装。请执行: npm run overseas:install`
    );
  }
}

export function ensureBaoyuXDeps() {
  ensureBaoyuXInstalled();
  const nodeModules = join(baoyuScriptsDir, 'node_modules');
  if (existsSync(nodeModules)) {
    return;
  }
  console.log('[x-skills] 安装 baoyu-post-to-x 脚本依赖...');
  const r = spawnSync('npm', ['install', '--omit=dev'], {
    cwd: baoyuScriptsDir,
    stdio: 'inherit',
    shell: true,
  });
  if (r.status !== 0) {
    throw new Error('baoyu-post-to-x 依赖安装失败');
  }
}

function resolveBunCmd() {
  if (process.env.BUN_BIN) {
    return [process.env.BUN_BIN];
  }
  const bunCheck = spawnSync('bun', ['--version'], { shell: true, stdio: 'pipe' });
  if (bunCheck.status === 0) {
    return ['bun'];
  }
  return ['npx', '-y', 'bun'];
}

export function runBaoyuScript(scriptName, args = [], opts = {}) {
  ensureBaoyuXDeps();
  const scriptPath = join(baoyuScriptsDir, scriptName);
  if (!existsSync(scriptPath)) {
    throw new Error(`脚本不存在: ${scriptPath}`);
  }
  const bun = resolveBunCmd();
  const cmd = [...bun, scriptPath, ...args];
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: baoyuScriptsDir,
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0 && !opts.allowFail) {
    process.exit(r.status ?? 1);
  }
  return r;
}
