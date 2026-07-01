#!/usr/bin/env node
/**
 * LinkedIn 个人号 CLI — 封装 frizynn/linkedin-cli（tool/linkedin-cli）
 * 公司主页发布预留，见 references/company-page.md
 */
import { existsSync, readFileSync } from 'fs';
import {
  ensureLinkedInCliInstalled,
  linkedinConfigPath,
  openSystemChrome,
  runLinkedInCli,
} from '../../../scripts/lib/linkedin-cli.mjs';

function parseArgs(argv) {
  const opts = { visibility: 'connections' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--text' || a === '-t') opts.text = argv[++i];
    else if (a === '--file' || a === '-f') opts.file = argv[++i];
    else if (a === '--visibility') opts.visibility = argv[++i];
    else if (!a.startsWith('-') && !opts.text) opts.text = a;
  }
  opts.text = process.env.LINKEDIN_POST_TEXT || opts.text || '';
  return opts;
}

function assertPersonalAccountMode() {
  const mode = (process.env.LINKEDIN_ACCOUNT_TYPE || 'personal').toLowerCase();
  if (mode === 'company') {
    console.error(
      '❌ 公司主页发布尚未接入。请将 user-profile 中 LinkedIn 账号类型设为 personal，或见 skills/linkedin/references/company-page.md'
    );
    process.exit(1);
  }
}

async function cmdLogin() {
  assertPersonalAccountMode();
  ensureLinkedInCliInstalled();

  if (!openSystemChrome('https://www.linkedin.com/login')) {
    console.log('未找到系统 Chrome，请在浏览器中打开 https://www.linkedin.com/login 并完成登录。');
  } else {
    console.log('已在系统 Chrome 中打开 LinkedIn 登录页。');
  }

  console.log('');
  console.log('个人号登录说明：');
  console.log('  1. 在 Chrome 中登录 linkedin.com（与日常浏览同一浏览器配置）');
  console.log('  2. linkedin-cli 将从 Chrome 读取 Cookie（browser-cookie3）');
  console.log('  3. 勿将 Cookie 写入 Git；可选设置 LINKEDIN_COOKIE_HEADER 环境变量');
  console.log('');
  console.log('登录完成后按 Enter 检查会话...');
  await new Promise((r) => process.stdin.once('data', r));

  runLinkedInCli(['auth-status']);
}

function cmdCheckLogin() {
  assertPersonalAccountMode();
  const r = runLinkedInCli(['auth-status'], { allowFail: true });
  process.exit(r.status === 0 ? 0 : 1);
}

function cmdPublish(argv) {
  assertPersonalAccountMode();
  const { text, file, visibility } = parseArgs(argv);
  let content = text;
  if (file) {
    if (!existsSync(file)) {
      console.error('文件不存在:', file);
      process.exit(1);
    }
    content = readFileSync(file, 'utf8');
  }
  if (!content.trim()) {
    console.error('用法: cli.mjs publish --text "帖子内容" 或 --file article.md [--visibility public|connections]');
    process.exit(1);
  }

  if (!['connections', 'public'].includes(visibility)) {
    console.error('--visibility 仅支持 connections 或 public');
    process.exit(1);
  }

  console.log(`发布目标: 个人号 Feed | 可见性: ${visibility}`);
  runLinkedInCli(['post', content, '--visibility', visibility]);
  console.log('✅ LinkedIn 个人帖已提交（linkedin-cli）');
}

const [command, ...rest] = process.argv.slice(2);

if (!command) {
  console.log(`LinkedIn CLI（个人号 · frizynn/linkedin-cli）

  login | check-login | publish --text "..." | publish --file path.md

环境变量:
  LINKEDIN_CLI_ROOT         tool/linkedin-cli 路径
  LINKEDIN_CONFIG           默认 skills/linkedin/config.yaml
  LINKEDIN_BROWSER          读 Cookie 的浏览器（默认 chrome）
  LINKEDIN_COOKIE_HEADER    完整 Cookie 头（比浏览器抽取更稳）
  LINKEDIN_ACCOUNT_TYPE     personal（默认）| company（预留，未实现）

npm: linkedin:login | linkedin:check-login | linkedin:publish

配置: ${linkedinConfigPath}`);
  process.exit(0);
}

if (command === 'login') {
  await cmdLogin();
} else if (command === 'check-login') {
  cmdCheckLogin();
} else if (command === 'publish') {
  cmdPublish(rest);
} else {
  console.error('未知命令:', command);
  process.exit(1);
}
