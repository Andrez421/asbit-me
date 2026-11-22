/** Focused functional checks for the portfolio's public behavior. */
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const url = process.argv[2] ?? 'http://127.0.0.1:4321';
const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  headless: true,
});
const errors = [];
const results = {};

/** `domcontentloaded` plus a bounded font wait: `networkidle0` hangs whenever
 *  an external request (Google Fonts) never settles, so the checks never
 *  depend on the network beyond the local preview server. */
const open = async (target, options = {}) => {
  await target.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000, ...options });
  await Promise.race([
    target.evaluate(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
};

try {
  const page = await browser.newPage();
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(10000);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => {
    window.__qualityRaf = 0;
    const request = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      window.__qualityRaf++;
      return request(callback);
    };
  });
  await open(page);

  results.structure = await page.evaluate(() => {
    const ids = ['home', 'work', 'about', 'experience', 'stack', 'contact'];
    return {
      main: document.querySelectorAll('main').length,
      order: ids.map((id) => document.getElementById(id)?.offsetTop),
      featured: document.querySelectorAll('#plist > .prow').length,
      archive: document.querySelectorAll('.archive-list > .prow').length,
      cases: [...document.querySelectorAll('.hero-actions a')].map((a) => a.getAttribute('href')),
    };
  });
  assert.equal(results.structure.main, 1);
  assert.equal(results.structure.featured, 3);
  assert.equal(results.structure.archive, 11);
  assert.deepEqual(results.structure.cases, ['#work', 'mailto:asbravopa@gmail.com']);
  assert.deepEqual(results.structure.order, [...results.structure.order].sort((a, b) => a - b));
  await page.waitForFunction(() => document.querySelectorAll('#name .ch.go').length === document.querySelectorAll('#name .ch').length);
  results.kineticLetters = await page.$$eval('#name .ch.go', (els) => els.length);

  results.metadata = await page.evaluate(() => ({
    og: document.querySelector('meta[property="og:image"]')?.content,
    twitter: document.querySelector('meta[name="twitter:card"]')?.content,
    schema: JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent ?? '{}'),
  }));
  assert.equal(results.metadata.og, 'https://asbit.me/og-card.png');
  assert.equal(results.metadata.twitter, 'summary_large_image');
  assert.equal(results.metadata.schema['@type'], 'Person');
  for (const path of ['/robots.txt', '/sitemap.xml', '/og-card.png', '/apple-touch-icon.png']) {
    const response = await page.goto(new URL(path, url).href);
    assert.equal(response.status(), 200, path);
  }
  await open(page);

  await page.click('.archive-toggle');
  assert.equal(await page.$eval('.project-archive', (el) => el.open), true);
  await page.click('[data-id="onbase"] > .phead');
  assert.equal(await page.$eval('[data-id="onbase"]', (el) => el.classList.contains('open')), true);
  assert.equal(await page.$eval('[data-id="onbase"] .pbody', (el) => el.hasAttribute('inert')), false);

  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  assert.equal(await page.$eval('#pal', (el) => el.open), true);
  let focusEscaped = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => {
      const active = document.activeElement;
      return active && active.tagName !== 'BODY' && !active.closest('#pal');
    })) focusEscaped = true;
  }
  assert.equal(focusEscaped, false);
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('#pal', (el) => el.open), false);
  await page.keyboard.press('/');
  assert.equal(await page.$eval('#pal', (el) => el.open), true);
  await page.keyboard.press('Escape');
  results.keyboard = 'palette focus, Escape and / passed';

  await page.click('#lang');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'en');
  assert.equal(await page.$eval('[data-i18n="hero.cases"]', (el) => el.textContent), 'View featured cases');
  await page.click('#lang');
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'es');
  await page.click('#theme');
  await page.waitForFunction(() => document.querySelector('meta[name="theme-color"]').content === '#0B0C0E');
  assert.equal(await page.$eval('meta[name="theme-color"]', (el) => el.content), '#0B0C0E');
  await page.waitForFunction(() => !document.documentElement.classList.contains('no-tr'));
  await page.click('#theme');
  await page.waitForFunction(() => document.querySelector('meta[name="theme-color"]').content === '#ECEDEF');
  assert.equal(await page.$eval('meta[name="theme-color"]', (el) => el.content), '#ECEDEF');
  results.localeTheme = 'round trips passed';
  console.error('quality: structure, metadata, keyboard, language and theme passed');
  await page.close();

  const motion = await browser.newPage();
  motion.setDefaultTimeout(5000);
  motion.setDefaultNavigationTimeout(10000);
  await motion.setViewport({ width: 1440, height: 900 });
  await motion.evaluateOnNewDocument(() => {
    window.__qualityRaf = 0;
    const request = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      window.__qualityRaf++;
      return request(callback);
    };
  });
  await motion.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await Promise.race([
    motion.evaluate(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  await motion.waitForFunction(() => document.querySelectorAll('#name .ch.go').length === document.querySelectorAll('#name .ch').length);
  await motion.evaluate(() => { window.__qualityRaf = 0; });
  await new Promise((resolve) => setTimeout(resolve, 250));
  results.visibleFrames = await motion.evaluate(() => window.__qualityRaf);
  assert.equal(results.visibleFrames > 0, true, 'visible animation must run before testing the hidden pause');
  await motion.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.__qualityRaf = 0;
  });
  await new Promise((resolve) => setTimeout(resolve, 400));
  results.hiddenFrames = await motion.evaluate(() => window.__qualityRaf);
  assert.equal(results.hiddenFrames, 0);
  await motion.close();

  results.viewports = [];
  for (const [width, height] of [[320, 700], [390, 844], [768, 900], [1440, 900]]) {
    const responsive = await browser.newPage();
    responsive.setDefaultTimeout(5000);
    responsive.setDefaultNavigationTimeout(10000);
    responsive.on('pageerror', (error) => errors.push(error.message));
    await responsive.setViewport({ width, height });
    await responsive.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await Promise.race([
      responsive.evaluate(() => document.fonts.ready),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
    const size = await responsive.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.equal(size.scroll <= size.width, true, `horizontal overflow at ${width}px`);
    results.viewports.push(width);
    await responsive.close();
  }

  const reduced = await browser.newPage();
  reduced.setDefaultTimeout(5000);
  reduced.setDefaultNavigationTimeout(10000);
  await reduced.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await reduced.evaluateOnNewDocument(() => {
    window.__qualityRaf = 0;
    const request = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      window.__qualityRaf++;
      return request(callback);
    };
  });
  await reduced.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await Promise.race([
    reduced.evaluate(() => document.fonts.ready),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);
  await reduced.evaluate(() => { window.__qualityRaf = 0; });
  await new Promise((resolve) => setTimeout(resolve, 300));
  results.reducedMotionFrames = await reduced.evaluate(() => window.__qualityRaf);
  console.error('quality: responsive viewports passed');
  assert.equal(results.reducedMotionFrames, 0);
  await reduced.close();
  assert.deepEqual(errors, []);
  results.runtimeErrors = errors;
  console.log(JSON.stringify(results, null, 2));
  console.log('\nportfolio quality checks passed');
} finally {
  await browser.close();
}
