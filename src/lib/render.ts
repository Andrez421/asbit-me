import type { I18n } from '../data/projects';

/** Spanish value of a bilingual literal. */
export const es = (v: I18n): string => (typeof v === 'string' ? v : v.es);

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Builds the exact DOM the old runtime script created for `[data-kin]`: one
 * `<span class="w" aria-hidden="true">` per word containing one
 * `<span class="ch">` per character, single spaces between words.
 * Rendering it at build time removes ~47 nodes of runtime work.
 */
export function kinetic(text: string): string {
  return text
    .split(' ')
    .map(
      (word) =>
        `<span class="w" aria-hidden="true">${[...word]
          .map((c) => `<span class="ch">${esc(c)}</span>`)
          .join('')}</span>`,
    )
    .join(' ');
}
