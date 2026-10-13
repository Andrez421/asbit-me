/**
 * Bilingual parity check.
 *
 *   node tools/i18n-check.mjs [distDir]
 *
 * Spanish lives in the markup, English in `src/data/i18n.ts`, keyed by
 * `data-i18n` (text) and `data-i18n-aria` (accessible labels). This script reads
 * the *built* HTML — so keys generated at build time for project cards, diagrams
 * and the studies/certifications rows are included — and reports:
 *
 *   - keys present in the markup but missing from the English dictionary
 *   - keys in the dictionary that nothing references (dead weight shipped to the client)
 *
 * Exit code is 1 when either list is non-empty.
 */
import { readFileSync, readdirSync } from 'node:fs';

const dist = process.argv[2] ?? 'dist';
const html = readdirSync(dist).includes('index.html') ? readFileSync(`${dist}/index.html`, 'utf8') : '';
if (!html) {
  console.error(`no index.html in ${dist}/ — run the build first`);
  process.exit(2);
}

const dictSrc = readFileSync('src/data/i18n.ts', 'utf8');
const dict = JSON.parse(dictSrc.slice(dictSrc.indexOf('{'), dictSrc.lastIndexOf('}') + 1));

const referenced = new Set();
for (const m of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) referenced.add(m[1]);

const missing = [...referenced].filter((k) => !(k in dict));
const unused = Object.keys(dict).filter((k) => !referenced.has(k));

console.log(`referenced keys in the built HTML : ${referenced.size}`);
console.log(`keys in the English dictionary    : ${Object.keys(dict).length}`);
console.log(`missing from the dictionary      : ${missing.length}${missing.length ? ' -> ' + missing.slice(0, 10).join(', ') : ''}`);
console.log(`in the dictionary but unused     : ${unused.length}${unused.length ? ' -> ' + unused.slice(0, 10).join(', ') : ''}`);

process.exit(missing.length || unused.length ? 1 : 0);
