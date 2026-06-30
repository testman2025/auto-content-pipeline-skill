/**
 * 知乎正文：Markdown / 纯文本 → HTML（多 <p> 段落，供 pyzhihu API 直发）
 */

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text) {
  let out = escapeHtml(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__(.+?)__/g, '<strong>$1</strong>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  return out;
}

function isLikelyHtml(source) {
  const trimmed = source.trim();
  return /^<(!DOCTYPE|html|p|div|h[1-6]|strong|br|ul|ol|blockquote)\b/i.test(trimmed);
}

function normalizeTableLine(line) {
  if (!/^\|.+\|$/.test(line.trim())) {
    return null;
  }
  if (/^\|[\s\-:|]+\|$/.test(line.trim())) {
    return '';
  }
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim())
    .filter(Boolean)
    .join('、');
}

/**
 * @param {string} source
 * @returns {string} HTML body for Zhihu article
 */
export function markdownToZhihuHtml(source) {
  const raw = source.replace(/\r\n/g, '\n').trim();
  if (!raw) {
    return '';
  }
  if (isLikelyHtml(raw)) {
    return raw;
  }

  let text = raw;
  // 首行 # 标题由 --title 单独传，正文里去掉
  text = text.replace(/^#\s+.+?\n+/, '');

  const blocks = [];
  const lines = text.split('\n');
  let buffer = [];

  function flushBuffer() {
    const joined = buffer.join('\n').trim();
    buffer = [];
    if (!joined) {
      return;
    }

    const tableBits = joined
      .split('\n')
      .map(normalizeTableLine)
      .filter((line) => line !== null);
    if (tableBits.length > 0 && tableBits.length === joined.split('\n').length) {
      const prose = tableBits.filter(Boolean).join('；');
      if (prose) {
        blocks.push(prose);
      }
      return;
    }

    blocks.push(joined);
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || /^---+$/.test(trimmed)) {
      flushBuffer();
      continue;
    }
    if (/^#{2,6}\s+/.test(trimmed)) {
      flushBuffer();
      blocks.push(trimmed.replace(/^#{2,6}\s+/, ''));
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushBuffer();
      blocks.push(trimmed.replace(/^>\s?/, ''));
      continue;
    }
    buffer.push(line);
  }
  flushBuffer();

  return blocks
    .map((block) => {
      const withBreaks = inlineMarkdown(block).replace(/\n/g, '<br>');
      return `<p>${withBreaks}</p>`;
    })
    .join('');
}
