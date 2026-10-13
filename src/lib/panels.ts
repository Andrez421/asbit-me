import { SNIPS } from '../data/code';

/**
 * Code-texture panel content, built at build time.
 *
 * This is the same content the runtime used to generate: three columns, each
 * filled with SNIPS snippets starting at `index * 2 + column * 3`, until the
 * requested number of lines is reached. Keeping the maths identical is what
 * makes the pre-rendered panel indistinguishable from the generated one.
 */
const KW =
  /\b(create|alter|table|policy|using|select|export|const|async|await|try|except|def|return|services|jobs|steps|uses|new|if|else|for|in|can|accept)\b/g;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const hl = (s: string) => esc(s).replace(KW, '<span class="k">$1</span>');

/** Section order used by the panels: 0 hero, 1 about, 2 experience, 3 work, 4 stack, 5 contact. */
export function panelHtml(index: number, lines: number): string {
  let out = '';
  for (let column = 0; column < 3; column++) {
    let done = 0;
    let j = index * 2 + column * 3;
    let html = '';
    while (done < lines) {
      const s = SNIPS[j % SNIPS.length];
      html += hl(s) + '\n\n';
      done += s.split('\n').length + 1;
      j++;
    }
    out += `<div>${html}</div>`;
  }
  return out;
}

/**
 * Lines per column rendered for each section, from the measured need across the
 * designed viewport range (320, 390, 1440 and 1920 px wide) plus a margin:
 *
 *   hero 88 · about 85 · experience 323 · work 149 · stack 169 · contact 73
 *
 * A section taller than its budget is not a designed case; the runtime falls back
 * to generating that panel on the fly, so a short budget can never truncate it.
 */
export const PANEL_LINES = [101, 98, 371, 171, 194, 84] as const;
