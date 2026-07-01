import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import { parseVtt, buildAss, prepareDisplayCues } from './vtt-to-scenes.mjs';
import { defaultBgmPath } from './paths.mjs';

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
 * 生成默认轻柔 BGM（无版权合成音，可替换为自有 mp3）
 */
export function ensureDefaultBgm() {
  if (existsSync(defaultBgmPath)) return defaultBgmPath;

  const assetsDir = dirname(defaultBgmPath);
  mkdirSync(assetsDir, { recursive: true });

  console.log('[douyin] Generating default BGM...');
  run('ffmpeg', [
    '-y',
    '-f',
    'lavfi',
    '-i',
    'anoisesrc=c=pink:d=180:a=0.015',
    '-f',
    'lavfi',
    '-i',
    'sine=frequency=196:duration=180',
    '-filter_complex',
    '[0:a]highpass=f=120,lowpass=f=800[v0];[1:a]volume=0.008[v1];[v0][v1]amix=inputs=2:duration=longest,atrim=0:180,afade=t=in:st=0:d=3,afade=t=out:st=170:d=10,volume=0.6',
    '-c:a',
    'libmp3lame',
    '-q:a',
    '6',
    defaultBgmPath,
  ]);

  return defaultBgmPath;
}

/**
 * @param {{ text: string, voice: string, workDir: string, ttsRate?: string }} opts
 */
export function synthesizeTts(opts) {
  const { text, voice, workDir, ttsRate = '+50%' } = opts;
  mkdirSync(workDir, { recursive: true });

  const ttsTextPath = join(workDir, 'tts.txt');
  const voicePath = join(workDir, 'voice.mp3');
  const vttPath = join(workDir, 'subs.vtt');

  writeFileSync(ttsTextPath, text, 'utf8');

  console.log(`[douyin] TTS (rate ${ttsRate})...`);
  run('uv', [
    'run',
    'edge-tts',
    '--voice',
    voice,
    '--rate',
    ttsRate,
    '--file',
    ttsTextPath,
    '--write-media',
    voicePath,
    '--write-subtitles',
    vttPath,
  ]);

  return { voicePath, vttPath, duration: probeDuration(voicePath) + 0.5 };
}

/**
 * @param {{ voicePath: string, vttPath: string, workDir: string, videoPath: string, duration: number, bgmPath?: string, bgmVolume?: number }} opts
 */
export function renderFfmpegAss(opts) {
  const {
    voicePath,
    vttPath,
    workDir,
    videoPath,
    duration,
    bgmPath,
    bgmVolume = 0.14,
  } = opts;

  const rawCues = parseVtt(vttPath);
  const cues = prepareDisplayCues(rawCues);
  if (!cues.length) {
    throw new Error(`No subtitles parsed from: ${vttPath}`);
  }

  const assPath = join(workDir, 'subs.ass');
  writeFileSync(assPath, buildAss(cues), 'utf8');

  const assForFfmpeg = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  let bgm = bgmPath;
  if (!bgm || !existsSync(bgm)) {
    bgm = ensureDefaultBgm();
  }

  console.log('[douyin] ffmpeg ASS + BGM compositing 1080x1920...');

  const dur = duration.toFixed(2);
  const vol = bgmVolume.toFixed(3);

  if (bgm && existsSync(bgm)) {
    const bgmEsc = bgm.replace(/\\/g, '/').replace(/:/g, '\\:');
    run('ffmpeg', [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=1080x1920:d=${dur}`,
      '-i',
      voicePath,
      '-stream_loop',
      '-1',
      '-i',
      bgm,
      '-filter_complex',
      `[2:a]atrim=0:${dur},asetpts=PTS-STARTPTS,volume=${vol}[bgm];[1:a]volume=1.0[voice];[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]`,
      '-map',
      '0:v',
      '-map',
      '[aout]',
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
  } else {
    run('ffmpeg', [
      '-y',
      '-f',
      'lavfi',
      '-i',
      `color=c=black:s=1080x1920:d=${dur}`,
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
  }

  return {
    assPath,
    cueCount: cues.length,
    renderer: 'ffmpeg-ass',
    bgmPath: bgm,
    ttsRate: opts.ttsRate,
  };
}
