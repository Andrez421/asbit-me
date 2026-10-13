/**
 * Interaction parity check.
 *
 *   node tools/interaction-check.mjs <urlA> <urlB>
 *
 * The pixel diff and the animation check cover rendering and animation; this
 * tool drives the paths that only exist after a real event: the command palette
 * (keyboard), language and theme toggles, and expanding a project card. It runs
 * the same scripted scenario against both versions and compares the outcome, so
 * a mis-wired listener or a dropped attribute shows up as a difference.
 *
 * The pointer-hover effects (cursor ring, contact magnet, per-section lens
 * following the cursor) are gated behind `(hover: hover) and (pointer: fine)`,
 * which headless Chromium reports as false; the tool attempts to force a fine
 * pointer through Blink settings and reports explicitly when it could not, so
 * an untested path is never mistaken for a passing one.
 */
import puppeteer from 'puppeteer-core';

const [urlA, urlB] = process.argv.slice(2);
if (!urlA || !urlB) {
  console.error('usage: node tools/interaction-check.mjs <urlA> <urlB>');
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--hide-scrollbars',
    // pretend to be a device with a mouse, so the pointer-gated effects run
    '--blink-settings=primaryPointerType=4,availablePointerTypes=4,primaryHoverType=2,availableHoverTypes=2',
  ],
  headless: true,
});

async function scenario(url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 500));
  const out = {};
  const text = (sel) => page.$eval(sel, (e) => e.textContent.trim()).catch(() => null);
  const has = (sel) => page.$eval(sel, (e) => e.classList.contains('open')).catch(() => false);

  out.mediaFine = await page.evaluate(() => matchMedia('(hover: hover) and (pointer: fine)').matches);

  /* command palette: open with Ctrl+K */
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  out.paletteOpen = await has('#pal');
  out.paletteItems = await page.$$eval('#palList li', (ls) => ls.length);
  out.paletteHint = await text('#palHint');
  out.secretHidden = await page.$$eval('#palList li', (ls) => ls.some((l) => l.textContent.includes('sudo')));

  /* filter, move and run */
  await page.type('#palIn', 'tra');
  out.filtered = await page.$$eval('#palList li', (ls) => ls.map((l) => l.textContent.trim()));
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  out.selected = await page.$eval('#palList li.sel', (l) => l.textContent.trim()).catch(() => null);
  await page.keyboard.press('Escape');
  out.paletteClosed = !(await has('#pal'));

  /* the `/` shortcut right after closing the palette, without touching focus:
     the old version left the focus inside the hidden input and suppressed it,
     the fixed version blurs it — an intentional improvement, reported as FIX. */
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  await page.keyboard.press('Escape');
  await page.keyboard.press('/');
  out.paletteAfterEscapeNoBlur = await has('#pal');
  await page.keyboard.press('Escape');

  /* secret command through the palette */
  // A real user presses / with the focus on the page, not inside a text field.
  await page.evaluate(() => document.activeElement.blur());
  await page.type('body', '/');
  out.paletteOpenedBySlash = await has('#pal');
  await page.type('#palIn', 'sudo');
  const secretListed = await page.$$eval('#palList li', (ls) => ls.map((l) => l.textContent.trim()));
  await page.keyboard.press('Enter');
  out.secretRun = { listed: secretListed, toast: await text('#toast'), closed: !(await has('#pal')) };

  /* language round trip */
  await page.keyboard.press('Escape');
  await page.click('#lang');
  out.langEn = await page.evaluate(() => document.documentElement.lang);
  out.langEnSample = await text('[data-i18n="e2.role"]');
  out.langBtn = await text('#lang');
  await page.click('#lang');
  out.langBack = await page.evaluate(() => document.documentElement.lang);
  out.langBackSample = await text('[data-i18n="e2.role"]');

  /* theme toggle */
  await page.click('#theme');
  out.themeAfter = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('#theme');
  out.themeBack = await page.evaluate(() => document.documentElement.dataset.theme);

  /* project card toggle */
  const closed = await page.$$eval('.prow:not(.open) .phead', (b) => b.length);
  if (closed) {
    await page.click('.prow:not(.open) .phead');
    out.cardToggle = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.prow')];
      const open = rows.filter((r) => r.classList.contains('open'));
      return {
        openCount: open.length,
        expanded: open[0]?.querySelector('.phead')?.getAttribute('aria-expanded'),
        bodyInert: open[0]?.querySelector('.pbody')?.hasAttribute('inert'),
        othersInert: rows.filter((r) => !r.classList.contains('open')).every((r) => r.querySelector('.pbody').hasAttribute('inert')),
      };
    });
  }

  /* pointer-gated paths (only meaningful when a fine pointer is reported) */
  if (out.mediaFine) {
    await page.mouse.move(700, 400);
    await page.mouse.move(720, 430);
    out.ring = await page.$eval('#ring', (e) => ({ on: e.classList.contains('on'), label: e.textContent.trim() }));
    await page.mouse.move(60, 60);
    out.ringOffPage = await page.$eval('#ring', (e) => e.classList.contains('on'));
    const btn = await page.$('.ct-row a');
    const box = await btn.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.move(box.x + box.width / 2 + 10, box.y + box.height / 2 + 6);
    out.magnetTransform = await btn.evaluate((e) => e.style.transform);
  }

  await page.close();
  return out;
}

const A = await scenario(urlA);
const B = await scenario(urlB);
await browser.close();

let diffs = 0;
const SKIP = ['ring', 'ringOffPage', 'magnetTransform'];
/** Differences that are the point of the change rather than a regression. */
const EXPECTED = { paletteAfterEscapeNoBlur: true };
for (const key of Object.keys(A)) {
  const same = JSON.stringify(A[key]) === JSON.stringify(B[key]);
  const skipped = !A.mediaFine && SKIP.includes(key);
  const expected = !same && EXPECTED[key];
  if (!same && !skipped && !expected) diffs++;
  const tag = skipped ? '  SKIP' : expected ? '  FIX ' : same ? '  =  ' : '  DIF';
  console.log(`${tag} ${key}`);
  if (!same) console.log(`        old: ${JSON.stringify(A[key])}\n        new: ${JSON.stringify(B[key])}`);
}
if (!A.mediaFine) {
  console.log('\nnote: no fine pointer in headless Chromium, so the cursor ring and the');
  console.log('      contact magnet could not be exercised (skipped, not verified).');
}
console.log(`\n${diffs === 0 ? 'interaction outcomes identical' : diffs + ' differing interaction outcomes'}`);
process.exit(diffs === 0 ? 0 : 1);
