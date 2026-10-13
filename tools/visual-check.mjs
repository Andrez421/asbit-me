/**
 * Visual regression check: renders two URLs with the same deterministic
 * conditions and reports whether they differ at the pixel level.
 *
 *   node tools/visual-check.mjs <urlA> <urlB> <outDir>
 *
 * Determinism: `prefers-reduced-motion: reduce` (the design then jumps straight
 * to final states instead of animating), the live clocks hidden, and the
 * pointer-driven effects untouched because no pointer ever enters the page.
 * Exit code is 1 when any pixel differs, so it can gate a change.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const [urlA, urlB, outDir = '/tmp/visual'] = process.argv.slice(2);
if (!urlA || !urlB) {
  console.error('usage: node tools/visual-check.mjs <urlA> <urlB> [outDir]');
  process.exit(2);
}
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1'],
  headless: true,
});

async function shoot(url, name) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  // the only time-dependent pixels on the page
  await page.addStyleTag({ content: '.clock{visibility:hidden!important}' });
  // Freeze SMIL animations (the moving packet dot in the diagrams): reduced
  // motion does not stop them, so their position would differ between two
  // captures of the *same* page and produce false differences.
  await page.evaluate(() => {
    document.querySelectorAll('svg').forEach((s) => {
      if (typeof s.pauseAnimations === 'function') {
        s.setCurrentTime(0);
        s.pauseAnimations();
      }
    });
  });
  // walk the page so every IntersectionObserver-driven reveal has fired, then return to the top
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 900));
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] ?? {};
    const fcp = performance.getEntriesByName('first-contentful-paint')[0] ?? {};
    return {
      nodes: document.querySelectorAll('*').length,
      ch: document.querySelectorAll('.ch').length,
      svgNodes: document.querySelectorAll('svg *').length,
      diag: document.querySelectorAll('svg.diag').length,
      cards: document.querySelectorAll('.prow').length,
      codeLines: document.querySelectorAll('.code div').length,
      domInteractive: Math.round(nav.domInteractive ?? 0),
      dcl: Math.round(nav.domContentLoadedEventEnd ?? 0),
      load: Math.round(nav.loadEventEnd ?? 0),
      fcp: Math.round(fcp.startTime ?? 0),
    };
  });
  const file = `${outDir}/${name}.png`;
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
  return { file, metrics };
}

const A = await shoot(urlA, 'old');
const B = await shoot(urlB, 'new');
await browser.close();

const diff = (a, b) => {
  const r = spawnSync('compare', ['-metric', 'AE', a, b, 'null:'], { encoding: 'utf8' });
  const text = ((r.stderr ?? '') + (r.stdout ?? '')).trim();
  return { pixels: text === '' ? 0 : Number(text) || -1, text: text === '' ? '0' : text };
};

const report = (label, a, b) => {
  const lines = [`${label}`];
  const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])];
  for (const k of keys) lines.push(`    ${k.padEnd(15)} old=${String(a[k]).padEnd(8)} new=${String(b[k])}`);
  return lines.join('\n');
};

const pixel = diff(A.file, B.file);
const threshold = Number(process.env.MAX_DIFF_PIXELS ?? 0);
console.log(report('DOM / timing (old vs new)', A.metrics, B.metrics));
console.log(`\npixel diff: ${pixel.text} differing pixels (threshold ${threshold})`);
console.log(`  ${A.file}\n  ${B.file}`);
writeFileSync(`${outDir}/report.json`, JSON.stringify({ old: A.metrics, new: B.metrics, diff: pixel.text }, null, 2));
process.exit(Number(pixel.text) > threshold ? 1 : 0);
