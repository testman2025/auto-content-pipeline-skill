import { existsSync, readFileSync } from 'fs';
import { profilePath, resolveBgmPath } from './paths.mjs';

export function loadDouyinProfile() {
  const defaults = {
    voice: 'zh-CN-YunxiNeural',
    hashtags: '#跨境电商 #TikTokShop',
    style: 'fancy-text-black',
    ttsRate: '+50%',
    bgmVolume: 0.14,
    bgmPath: '',
  };

  if (!existsSync(profilePath)) {
    return { ...defaults, bgmPath: resolveBgmPath('') || '' };
  }

  const text = readFileSync(profilePath, 'utf8');
  const section = text.match(/## 抖音配置[\s\S]*?(?=\n## |$)/);
  if (!section) {
    return { ...defaults, bgmPath: resolveBgmPath('') || '' };
  }

  const sectionText = section[0];

  const getInSection = (key) => {
    const m = sectionText.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  const bgmCustom = getInSection('背景音乐');
  const volRaw = getInSection('BGM 音量');
  let bgmVolume = defaults.bgmVolume;
  if (volRaw) {
    const n = Number.parseFloat(volRaw);
    if (Number.isFinite(n) && n > 0 && n <= 1) bgmVolume = n;
  }

  return {
    voice: getInSection('TTS 音色') || defaults.voice,
    hashtags: getInSection('默认话题') || defaults.hashtags,
    style: getInSection('视频样式') || defaults.style,
    ttsRate: getInSection('TTS 语速') || process.env.DOUYIN_TTS_RATE || defaults.ttsRate,
    bgmVolume,
    bgmPath: resolveBgmPath(bgmCustom) || '',
  };
}
