import { existsSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { repoRoot } from './repo-paths.mjs';

export const baoyuWechatSkillRoot =
  process.env.BAOYU_WECHAT_SKILL_ROOT ||
  join(repoRoot, 'tool/baoyu-skills/skills/baoyu-post-to-wechat');

export const baoyuMarkdownHtmlSkillRoot =
  process.env.BAOYU_MD_HTML_SKILL_ROOT ||
  join(repoRoot, 'tool/baoyu-skills/skills/baoyu-markdown-to-html');

export const baoyuWechatScriptsDir = join(baoyuWechatSkillRoot, 'scripts');
export const baoyuMarkdownHtmlScriptsDir = join(baoyuMarkdownHtmlSkillRoot, 'scripts');

export function ensureBaoyuWechatInstalled() {
  const skillMd = join(baoyuWechatSkillRoot, 'SKILL.md');
  if (!existsSync(skillMd)) {
    throw new Error(
      'baoyu-post-to-wechat 未安装。请执行: npm run wechat:install'
    );
  }
}

export function ensureBaoyuMarkdownHtmlInstalled() {
  const skillMd = join(baoyuMarkdownHtmlSkillRoot, 'SKILL.md');
  if (!existsSync(skillMd)) {
    throw new Error(
      'baoyu-markdown-to-html 未安装。请执行: npm run wechat:install'
    );
  }
}

function installScriptsDeps(scriptsDir, label) {
  const pkg = join(scriptsDir, 'package.json');
  if (!existsSync(pkg)) {
    return;
  }
  const nodeModules = join(scriptsDir, 'node_modules');
  if (existsSync(nodeModules)) {
    return;
  }
  console.log(`[wechat] 安装 ${label} 脚本依赖...`);
  const r = spawnSync('npm', ['install', '--omit=dev'], {
    cwd: scriptsDir,
    stdio: 'inherit',
    shell: true,
  });
  if (r.status !== 0) {
    throw new Error(`${label} 依赖安装失败`);
  }
}

export function ensureBaoyuWechatDeps() {
  ensureBaoyuWechatInstalled();
  ensureBaoyuMarkdownHtmlInstalled();
  installScriptsDeps(baoyuWechatScriptsDir, 'baoyu-post-to-wechat');
  installScriptsDeps(baoyuMarkdownHtmlScriptsDir, 'baoyu-markdown-to-html');
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

export function runBaoyuWechatScript(scriptName, args = [], opts = {}) {
  ensureBaoyuWechatDeps();
  const scriptPath = join(baoyuWechatScriptsDir, scriptName);
  if (!existsSync(scriptPath)) {
    throw new Error(`脚本不存在: ${scriptPath}`);
  }
  const bun = resolveBunCmd();
  const cmd = [...bun, scriptPath, ...args];
  const r = spawnSync(cmd[0], cmd.slice(1), {
    cwd: baoyuWechatScriptsDir,
    stdio: opts.silent ? 'pipe' : 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0 && !opts.allowFail) {
    process.exit(r.status ?? 1);
  }
  return r;
}
