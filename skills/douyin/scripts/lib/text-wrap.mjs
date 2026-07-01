/** 竖屏 1080 宽、左右边距后，每行安全字数 */
const MAX_CHARS_PER_LINE = 12;
const MAX_LINES = 2;
const MAX_CHARS_PER_CUE = MAX_CHARS_PER_LINE * MAX_LINES;

/**
 * @param {string} text
 * @param {number} maxPerLine
 */
export function wrapPlainLines(text, maxPerLine = MAX_CHARS_PER_LINE) {
  const lines = [];
  let rest = text.trim();
  while (rest && lines.length < MAX_LINES) {
    if (rest.length <= maxPerLine) {
      lines.push(rest);
      break;
    }
    let cut = maxPerLine;
    const probe = rest.slice(0, maxPerLine + 6);
    const punct = Math.max(
      probe.lastIndexOf('，'),
      probe.lastIndexOf('、'),
      probe.lastIndexOf('。'),
      probe.lastIndexOf(' '),
      probe.lastIndexOf('！'),
      probe.lastIndexOf('？')
    );
    if (punct >= 4) cut = punct + 1;
    lines.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest && lines.length === MAX_LINES) {
    const last = lines[MAX_LINES - 1];
    if (last.length + rest.length > maxPerLine) {
      lines[MAX_LINES - 1] = `${last.slice(0, maxPerLine - 1)}…`;
    } else {
      lines[MAX_LINES - 1] = last + rest;
    }
  }
  return lines;
}

/**
 * @param {string} text
 */
export function fontSizeForText(text) {
  const lines = text.includes('\\N') ? text.split('\\N') : wrapPlainLines(text);
  const maxLen = Math.max(...lines.map((l) => l.length), 1);
  if (maxLen <= 8) return 64;
  if (maxLen <= 12) return 54;
  return 46;
}

/**
 * 超长 VTT 条拆成多条，按字数比例分配时间
 * @param {{ start: number, end: number, text: string }[]} cues
 * @param {(t: string) => string} toFancy
 */
export function splitAndWrapCues(cues, toFancy) {
  const out = [];
  for (const cue of cues) {
    const chunks = chunkByLength(cue.text, MAX_CHARS_PER_CUE);
    if (chunks.length === 1) {
      const lines = wrapPlainLines(cue.text);
      const display = lines.join('\n');
      out.push({
        start: cue.start,
        end: cue.end,
        text: display,
        fancyText: lines.map((l) => toFancy(l)).join('\\N'),
      });
      continue;
    }
    const totalLen = cue.text.length;
    const dur = Math.max(cue.end - cue.start, 0.6);
    let t = cue.start;
    for (const chunk of chunks) {
      const ratio = chunk.length / totalLen;
      const segDur = Math.max(dur * ratio, 0.5);
      const lines = wrapPlainLines(chunk);
      out.push({
        start: t,
        end: t + segDur,
        text: lines.join('\n'),
        fancyText: lines.map((l) => toFancy(l)).join('\\N'),
      });
      t += segDur;
    }
  }
  return out;
}

/**
 * @param {string} text
 * @param {number} maxLen
 */
function chunkByLength(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  let rest = text;
  while (rest.length > maxLen) {
    let cut = maxLen;
    const probe = rest.slice(0, maxLen + 4);
    const punct = Math.max(
      probe.lastIndexOf('，'),
      probe.lastIndexOf('。'),
      probe.lastIndexOf('！'),
      probe.lastIndexOf('？'),
      probe.lastIndexOf('、')
    );
    if (punct >= 6) cut = punct + 1;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) chunks.push(rest);
  return chunks;
}
