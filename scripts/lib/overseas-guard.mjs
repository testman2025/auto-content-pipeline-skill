/**
 * 海外平台自动化门禁 — Agent 默认禁止调用登录/检测/发布。
 * 用户须在终端显式设置 OVERSEAS_ALLOW_AUTOMATION=true，且自行打开浏览器登录。
 */

const OVERSEAS_PLATFORMS = new Set(['linkedin', 'x', 'youtube', 'tiktok', 'reddit']);

export function isOverseasPlatform(name) {
  return OVERSEAS_PLATFORMS.has(String(name).toLowerCase());
}

/** 平台专用变量（如 LINKEDIN_ALLOW_AUTOMATION）或全局 OVERSEAS_ALLOW_AUTOMATION */
export function hasOverseasConsent(platform) {
  const key = `${String(platform).toUpperCase()}_ALLOW_AUTOMATION`;
  return (
    process.env.OVERSEAS_ALLOW_AUTOMATION === 'true' || process.env[key] === 'true'
  );
}

export function requireOverseasConsent(platform, action) {
  if (hasOverseasConsent(platform)) {
    return;
  }
  const label = { linkedin: 'LinkedIn', x: 'X', youtube: 'YouTube', tiktok: 'TikTok', reddit: 'Reddit' }[platform] || platform;
  console.error(`⛔ ${label} 自动化已默认关闭（防封号）。`);
  console.error(`   禁止 Agent 自动执行 ${action}、禁止自动打开浏览器。`);
  console.error('   须你本人在终端确认后执行一次：');
  console.error('   $env:OVERSEAS_ALLOW_AUTOMATION="true"; npm run <platform>:...');
  console.error('   登录请自行在浏览器打开对应网站，勿让脚本反复拉起登录页。');
  console.error('   详见 references/overseas-automation-rules.md');
  process.exit(1);
}

/**
 * 默认禁止脚本 spawn 打开浏览器。仅当用户显式要求时：
 * OVERSEAS_USER_REQUESTED_BROWSER=true
 */
export function mayLaunchBrowser(platform) {
  if (process.env.OVERSEAS_USER_REQUESTED_BROWSER === 'true' && hasOverseasConsent(platform)) {
    return true;
  }
  return false;
}

export function printManualLoginSteps(platform, url) {
  const lines = {
    linkedin: [
      '请你在自己常用的浏览器中手动打开（不要让 Agent 代开）：',
      `  ${url}`,
      '完成登录并确认能看到 Feed 后，再自行决定是否执行 check-login（仅一次）。',
    ],
    x: [
      '请手动打开 Chrome 并登录 X（不要让 Agent 代开）：',
      `  ${url}`,
    ],
  };
  for (const line of lines[platform] || [`请手动在浏览器打开: ${url}`]) {
    console.log(line);
  }
}
