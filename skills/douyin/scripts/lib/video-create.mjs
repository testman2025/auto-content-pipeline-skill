import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';
import { parseVtt, buildAss } from './vtt-to-scenes.mjs';

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  if (r.status !== 0) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
  return r;
}

function probeDuration(mediaPath) {
  const r = spawnSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      mediaPath,
    ],
    { encoding: 'utf8', shell: true }
  );
  if (r.status !== 0) return 30;
  const n = Number.parseFloat((r.stdout || '').trim());
  return Number.isFinite(n) && n > 0 ? n : 30;
}

/**
 * @param {{ text: string, voice: string, outputDir: string, basename: string }} opts
 */
export function createDouyinTextVideo(opts) {
  const { text, voice, outputDir, basename } = opts;

  mkdirSync(outputDir, { recursive: true });

  const workDir = join(outputDir, basename);
  mkdirSync(workDir, { recursive: true });

  const ttsTextPath = join(workDir, 'tts.txt');
  const voicePath = join(workDir, 'voice.mp3');
  const vttPath = join(workDir, 'subs.vtt');
  const assPath = join(workDir, 'subs.ass');
  const videoPath = join(outputDir, `${basename}.mp4`);

  writeFileSync(ttsTextPath, text, 'utf8');

  console.log('[douyin] TTS...');
  run('uv', [
    'run',
    'edge-tts',
    '--voice',
    voice,
    '--file',
    ttsTextPath,
    '--write-media',
    voicePath,
    '--write-subtitles',
    vttPath,
  ]);

  if (!existsSync(voicePath)) {
    throw new Error(`TTS output missing: ${voicePath}`);
  }

  const cues = existsSync(vttPath) ? parseVtt(vttPath) : [];
  if (!cues.length) {
    throw new Error(`No subtitles parsed from: ${vttPath}`);
  }

  const ass = buildAss(cues);
  writeFileSync(assPath, ass, 'utf8');

  const duration = probeDuration(voicePath) + 0.5;
  const assForFfmpeg = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  console.log('[douyin] Compositing 1080x1920 MP4...');
  run('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    `color=c=black:s=1080x1920:d=${duration.toFixed(2)}`,
    '-i',
    voicePath,
    '-vf',
    `ass='${assForFfmpeg}'`,
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-shortest',
    videoPath,
  ]);

  return {
    videoPath,
    voicePath,
    vttPath,
    assPath,
    workDir,
    duration,
    cueCount: cues.length,
  };
}
