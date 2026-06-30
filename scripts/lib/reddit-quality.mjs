import { existsSync, readFileSync } from 'fs';

/** 禁止发布的 sandbox / 测试版块（易触发 spam 且伤号） */
export const BLOCKED_SUBREDDITS = new Set([
  'test',
  'cicd',
  'sandbox',
  'testingground4bots',
  'u_material-future8082',
]);

/** 标题/正文命中即拒绝（测试帖、自动化痕迹） */
const BANNED_PHRASES = [
  /integration\s*test/i,
  /please\s+ignore/i,
  /pipeline\s*test/i,
  /test\s+post/i,
  /auto-?content-?pipeline/i,
  /\bhermes\b/i,
  /reddit-?skills?\s*test/i,
  /请忽略/,
  /集成测试/,
  /测试发帖/,
  /自动化测试/,
];

const HASHTAG_RE = /#\w+/;

export function readTextArg(args, flag, shortFlag) {
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1]) {
    const p = args[i + 1];
    if (!existsSync(p)) {
      return { error: `文件不存在: ${p}` };
    }
    return { value: readFileSync(p, 'utf8').trim(), path: p };
  }
  const j = shortFlag ? args.indexOf(shortFlag) : -1;
  if (j !== -1 && args[j + 1]) {
    const p = args[j + 1];
    if (!existsSync(p)) {
      return { error: `文件不存在: ${p}` };
    }
    return { value: readFileSync(p, 'utf8').trim(), path: p };
  }
  return { value: '' };
}

export function parseSubreddit(args) {
  const i = args.indexOf('--subreddit');
  if (i !== -1 && args[i + 1]) {
    return args[i + 1].replace(/^r\//i, '').trim();
  }
  return '';
}

export function collectPublishPayload(args, command) {
  const subreddit = parseSubreddit(args);
  const titleFromFile = readTextArg(args, '--title-file', '-t');
  if (titleFromFile.error) {
    return { error: titleFromFile.error };
  }
  const bodyFromFile = readTextArg(args, '--body-file', '-b');
  if (bodyFromFile.error) {
    return { error: bodyFromFile.error };
  }

  let title = titleFromFile.value;
  let body = bodyFromFile.value;
  let url = '';

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--title' && args[i + 1]) title = args[++i];
    else if (a === '--text' && args[i + 1]) body = args[++i];
    else if (a === '--url' && args[i + 1]) url = args[++i];
  }

  return {
    command,
    subreddit,
    title,
    body,
    url,
    titlePath: titleFromFile.path,
    bodyPath: bodyFromFile.path,
  };
}

function findBannedPhrase(text) {
  for (const re of BANNED_PHRASES) {
    if (re.test(text)) {
      return re.source;
    }
  }
  return null;
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * @returns {{ ok: true } | { ok: false, errors: string[], warnings: string[] }}
 */
export function validateRedditPublish(payload) {
  const errors = [];
  const warnings = [];
  const { subreddit, title, body, command } = payload;

  const allowTest =
    process.env.REDDIT_ALLOW_TEST_SUBREDDIT === 'true' ||
    process.env.REDDIT_ALLOW_TEST_POST === 'true';

  if (!subreddit) {
    errors.push('缺少 --subreddit');
  } else if (!allowTest && BLOCKED_SUBREDDITS.has(subreddit.toLowerCase())) {
    errors.push(
      `禁止向 r/${subreddit} 发帖（测试版块会触发 Reddit 筛选器）。` +
        '请使用垂直版块如 TikTokshop；仅本地调试可设 REDDIT_ALLOW_TEST_SUBREDDIT=true',
    );
  }

  if (!title?.trim()) {
    errors.push('标题为空');
  } else {
    if (title.length < 15) {
      errors.push(`标题过短（${title.length} 字），至少 15 字符`);
    }
    if (title.length > 300) {
      errors.push(`标题超过 Reddit 上限 300 字符（当前 ${title.length}）`);
    }
    const banned = findBannedPhrase(title);
    if (banned) {
      errors.push(`标题含禁止用语（测试/自动化痕迹）: /${banned}/`);
    }
    if (HASHTAG_RE.test(title)) {
      errors.push('标题勿使用 #hashtag（Reddit 文化易判 spam）');
    }
  }

  if (command === 'submit-text') {
    if (!body?.trim()) {
      errors.push('正文为空');
    } else {
      if (body.length < 200) {
        errors.push(`正文过短（${body.length} 字），干货帖建议 ≥200 字符`);
      }
      if (wordCount(body) < 40) {
        errors.push(`正文词数过少（${wordCount(body)} 词），建议 ≥40 词`);
      }
      const banned = findBannedPhrase(body);
      if (banned) {
        errors.push(`正文含禁止用语: /${banned}/`);
      }
      if (HASHTAG_RE.test(body)) {
        errors.push('正文勿使用 #hashtag');
      }
      if (/^.{1,5}$/s.test(body.trim())) {
        errors.push('正文像测试垃圾（过短无意义）');
      }
    }
  }

  if (command === 'submit-link') {
    if (!payload.url?.trim()) {
      errors.push('链接帖缺少 --url');
    }
  }

  if (command === 'submit-text' && body?.trim() && wordCount(body) < 40) {
    warnings.push('正文偏短，建议补充案例或 checklist 提高通过率');
  }

  if (errors.length === 0 && warnings.length === 0) {
    return { ok: true, errors: [], warnings: [] };
  }
  if (errors.length === 0) {
    return { ok: true, errors: [], warnings };
  }
  return { ok: false, errors, warnings };
}

export function formatValidationReport(result, payload) {
  const lines = ['=== Reddit 发布前质量检查 ===', ''];
  if (payload.subreddit) lines.push(`版块: r/${payload.subreddit}`);
  if (payload.title) {
    lines.push(`标题 (${payload.title.length} 字): ${payload.title.slice(0, 80)}${payload.title.length > 80 ? '…' : ''}`);
  }
  if (payload.body) {
    lines.push(`正文 (${payload.body.length} 字, ${wordCount(payload.body)} 词)`);
  }
  lines.push('');
  if (result.ok && result.warnings.length === 0) {
    lines.push('✅ 通过，可以发布');
  } else if (result.ok) {
    lines.push('✅ 通过（有警告）');
    for (const w of result.warnings) lines.push(`  ⚠️ ${w}`);
  } else {
    lines.push('❌ 未通过，已阻止发布');
    for (const e of result.errors) lines.push(`  • ${e}`);
    for (const w of result.warnings) lines.push(`  ⚠️ ${w}`);
  }
  return lines.join('\n');
}

export const PUBLISH_COMMANDS = new Set(['submit-text', 'submit-link', 'submit-image']);

export function shouldValidateCommand(command) {
  return PUBLISH_COMMANDS.has(command);
}
