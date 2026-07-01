export const DEFAULT_MAX_DURATION_SEC = 90;

/**
 * @param {string} rate e.g. +50%
 */
export function parseTtsRateMultiplier(rate) {
  const m = String(rate || '+0%').match(/([+-]?\d+)%/);
  if (!m) return 1;
  return 1 + Number(m[1]) / 100;
}

/**
 * @param {string} text
 */
export function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * @param {string[]} sentences
 * @param {string} ttsRate
 */
export function estimateDurationSec(sentences, ttsRate = '+50%') {
  const words = countWords(sentences.join(' '));
  if (!words) return 0;
  const wpm = 150;
  const mult = parseTtsRateMultiplier(ttsRate);
  return (words / (wpm * mult)) * 60;
}

/**
 * @param {string[]} sentences
 * @param {number} maxSec
 * @param {string} ttsRate
 */
export function trimSentencesToDuration(sentences, maxSec, ttsRate = '+50%') {
  const selected = [];
  for (const s of sentences) {
    const trial = [...selected, s];
    const est = estimateDurationSec(trial, ttsRate);
    if (est > maxSec && selected.length > 0) {
      break;
    }
    selected.push(s);
  }

  return {
    sentences: selected.length ? selected : sentences.slice(0, 1),
    estimatedDuration: estimateDurationSec(selected, ttsRate),
    truncated: selected.length < sentences.length,
    removedCount: sentences.length - selected.length,
  };
}
