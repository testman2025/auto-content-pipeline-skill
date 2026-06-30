#!/usr/bin/env node
/**
 * 修补 tool/reddit-skills：Reddit 2026 发帖页标题在 post-composer-title 内，非 faceplate-textarea-input。
 * 在 npm run tool:install 后自动执行。
 */
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { repoRoot } from './lib/repo-paths.mjs';

const publishPy = join(repoRoot, 'tool/reddit-skills/scripts/reddit/publish.py');

if (!existsSync(publishPy)) {
  console.log('[skip] reddit-skills 未安装');
  process.exit(0);
}

let src = readFileSync(publishPy, 'utf8');

if (src.includes("via: 'post-composer-title'")) {
  console.log('[ok] reddit publish patch already applied');
  process.exit(0);
}

const oldBlock = `def _fill_title_shadow(page: BridgePage, title: str) -> None:
    """Fill the title via the shadow DOM textarea inside faceplate-textarea-input."""
    title_js = json.dumps(title)
    result = page.evaluate(
        f"""
        (() => {{
            const fti = document.querySelector('faceplate-textarea-input[name="title"]');
            if (!fti || !fti.shadowRoot)
                return JSON.stringify({{ok: false, error: "no title element"}});
            const ta = fti.shadowRoot.querySelector('textarea');
            if (!ta) return JSON.stringify({{ok: false, error: "no textarea in shadow"}});
            ta.focus();
            ta.value = {title_js};
            ta.dispatchEvent(new Event('input', {{bubbles: true}}));
            ta.dispatchEvent(new Event('change', {{bubbles: true}}));
            return JSON.stringify({{ok: true}});
        }})()
    """
    )`;

const newBlock = `def _fill_title_shadow(page: BridgePage, title: str) -> None:
    """Fill the title via shadow DOM (faceplate-textarea-input or post-composer-title)."""
    title_js = json.dumps(title)
    result = page.evaluate(
        f"""
        (() => {{
            function setTextarea(ta, value) {{
                const proto = Object.getPrototypeOf(ta);
                const desc = Object.getOwnPropertyDescriptor(proto, 'value');
                if (desc && desc.set) desc.set.call(ta, value);
                else ta.value = value;
                ta.dispatchEvent(new Event('input', {{bubbles: true}}));
                ta.dispatchEvent(new Event('change', {{bubbles: true}}));
            }}
            const fti = document.querySelector('faceplate-textarea-input[name="title"]');
            if (fti && fti.shadowRoot) {{
                const ta = fti.shadowRoot.querySelector('textarea');
                if (ta) {{
                    setTextarea(ta, {title_js});
                    return JSON.stringify({{ok: true, via: 'faceplate-textarea-input'}});
                }}
            }}
            const pct = document.querySelector('post-composer-title');
            if (pct && pct.shadowRoot) {{
                const ta = pct.shadowRoot.querySelector('textarea[name="title"], textarea');
                if (ta) {{
                    setTextarea(ta, {title_js});
                    return JSON.stringify({{ok: true, via: 'post-composer-title'}});
                }}
            }}
            return JSON.stringify({{ok: false, error: "no title element"}});
        }})()
    """
    )`;

if (!src.includes(oldBlock)) {
  console.warn('[warn] reddit publish.py 结构已变，请手动核对标题选择器');
  process.exit(0);
}

src = src.replace(oldBlock, newBlock);
writeFileSync(publishPy, src, 'utf8');
console.log('[ok] patched reddit publish title selector (post-composer-title)');
