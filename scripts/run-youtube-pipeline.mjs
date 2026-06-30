/**
 * auto-content-pipeline — YouTube 完整链路
 * 用户画像 → 脚本 → TTS → 合成 16:9 视频 → Studio 发布
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const profilePath = join(rootDir, 'user-profile.md');
const hermesRoot = 'D:/test/hermes';

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function parseProfile(text) {
  const get = (key) => {
    const m = text.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };
  return {
    channelId: get('频道 ID') || 'me',
    voice: get('TTS 音色') || 'en-US-JennyNeural',
    privacy: get('默认可见性') || 'unlisted',
    industry: get('行业'),
  };
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (r.status !== 0) {
    throw new Error(`命令失败: ${cmd} ${args.join(' ')}`);
  }
}

if (!existsSync(profilePath)) {
  console.error('缺少 user-profile.md，请先从 user-profile.template.md 复制并填写');
  process.exit(1);
}

const profile = parseProfile(readFileSync(profilePath, 'utf8'));
const ts = stamp();
const topicSlug = 'TK-Dual-Store-Playbook-2026';

const title =
  process.env.VIDEO_TITLE ||
  'TikTok Shop + DTC Store: Dual-Store Playbook for 2026';
const description = `How to run TikTok Shop for testing and a DTC store for retention.
3 product criteria | GMV Max at 2.0 ROAS | inventory sync warning
Channel: ${profile.channelId}`;

const script = `Still selling only on TikTok Shop in 2026? You are leaving money on the table.
Smart sellers run a dual-store model: TikTok Shop for discovery, and a DTC store for profit and repeat buyers.

Here is the playbook in sixty seconds.

First, product selection on TikTok Shop. Use this formula: visual impact times scene fit, divided by decision friction.
If users need ten seconds to understand the product, it will not convert.
Example: a magnetic phone stand, cost four fifty, sells at nineteen ninety-nine. Seventy-two percent margin, two thousand orders a month.

Second, ads. Cold start at fifty dollars per day. When you find winners, switch to GMV Max and target two point zero ROAS before scaling.

Third, the trap. Inventory must sync across both stores.
One seller had three hundred TikTok orders and two hundred web orders, but only three hundred units in stock. Forty percent refunds and a crashed store rating.

Under three thousand dollars budget? Start with TikTok Shop only. Build cash flow, then add the DTC store for repeat purchases.

Which stage are you in: TikTok only, DTC only, or dual-store? Comment below.`;

const dirs = {
  script: join(hermesRoot, '文章', 'YouTube'),
  image: join(hermesRoot, '图片', 'YouTube'),
  video: join(hermesRoot, '视频'),
};
for (const d of Object.values(dirs)) mkdirSync(d, { recursive: true });

const scriptPath = join(dirs.script, `${ts}_${topicSlug}.md`);
const voicePath = join(dirs.video, `${ts}_voice.mp3`);
const videoPath = join(dirs.video, `${ts}_${topicSlug}.mp4`);
const bgPath =
  join(rootDir, 'xiaohongshu-skills/left.jpg');

writeFileSync(
  scriptPath,
  `# ${title}\n\n## Description\n${description}\n\n## Voiceover Script\n\n${script}\n`,
  'utf8'
);

console.log('=== auto-content-pipeline · YouTube 全流程 ===\n');
console.log('Step 0 用户画像:', profile.industry, '| 频道', profile.channelId);
console.log('Step 3 脚本已写入:', scriptPath);

console.log('\nStep 4a TTS 配音...');
const ttsTextPath = join(dirs.video, `${ts}_tts.txt`);
writeFileSync(ttsTextPath, script, 'utf8');
run('uv', [
  'run',
  'edge-tts',
  '--voice',
  profile.voice,
  '--file',
  ttsTextPath,
  '--write-media',
  voicePath,
]);

console.log('\nStep 4b 合成 16:9 视频...');
if (!existsSync(bgPath)) {
  throw new Error(`背景图不存在: ${bgPath}`);
}
run('ffmpeg', [
  '-y',
  '-loop',
  '1',
  '-i',
  bgPath,
  '-i',
  voicePath,
  '-c:v',
  'libx264',
  '-pix_fmt',
  'yuv420p',
  '-vf',
  'scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720',
  '-c:a',
  'aac',
  '-shortest',
  videoPath,
]);

console.log('\nStep 5 发布到 YouTube Studio...');
process.env.YOUTUBE_CHANNEL_ID = profile.channelId;
process.env.VIDEO_PRIVACY = profile.privacy;
process.env.VIDEO_PATH = videoPath;
process.env.VIDEO_TITLE = title;
process.env.VIDEO_DESC = description;

run('node', [join(__dirname, 'youtube-publish.mjs'), videoPath, title, description], {
  cwd: rootDir,
  env: process.env,
});

const reportPath = join(hermesRoot, `${ts}_youtube发布报告.md`);
writeFileSync(
  reportPath,
  `# YouTube 发布报告 - ${ts}\n\n| 项目 | 值 |\n|------|-----|\n| 标题 | ${title} |\n| 视频 | ${videoPath} |\n| 脚本 | ${scriptPath} |\n| 可见性 | ${profile.privacy} |\n| 频道 | ${profile.channelId} |\n`,
  'utf8'
);

console.log('\n✅ 全流程完成');
console.log('报告:', reportPath);
