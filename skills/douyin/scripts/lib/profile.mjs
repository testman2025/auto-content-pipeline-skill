import { existsSync, readFileSync } from 'fs';
import { profilePath } from './paths.mjs';

export function loadDouyinProfile() {
  const defaults = {
    voice: 'zh-CN-YunxiNeural',
    hashtags: '#跨境电商 #TikTokShop',
    style: 'fancy-text-black',
  };

  if (!existsSync(profilePath)) {
    return defaults;
  }

  const text = readFileSync(profilePath, 'utf8');
  const section = text.match(/## 抖音配置[\s\S]*?(?=\n## |$)/);
  if (!section) {
    return defaults;
  }

  const sectionText = section[0];

  const getInSection = (key) => {
    const m = sectionText.match(new RegExp(`${key}:\\s*(.+)`));
    return m ? m[1].trim() : '';
  };

  return {
    voice: getInSection('TTS 音色') || defaults.voice,
    hashtags: getInSection('默认话题') || defaults.hashtags,
    style: getInSection('视频样式') || defaults.style,
  };
}
