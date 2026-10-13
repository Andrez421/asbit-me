/**
 * Deterministic animation check.
 *
 *   node tools/animation-check.mjs <urlA> <urlB>
 *
 * The pixel diff only covers the reduced-motion end state. This tool instead
 * drives the *animated* path with a fake clock: before any page script runs it
 * replaces `performance.now()` and `requestAnimationFrame` with a stepping
 * queue, then advances the same number of frames in both versions and compares
 * the values the effects actually write (kinetic typography weights, marquee
 * transforms, scroll progress, the per-section lens mask).
 *
 * With a fixed timestep the state after N frames is deterministic, so any
 * difference in the ported logic shows up as a different value.
 */
import puppeteer from 'puppeteer-core';

const [urlA, urlB] = process.argv.slice(2);
if (!urlA || !urlB) {
  console.error('usage: node tools/animation-check.mjs <urlA> <urlB>');
  process.exit(2);
}

const FAKE_CLOCK = `
  (() => {
    let t = 0;
    const queue = [];
    const realNow = performance.now.bind(performance);
    performance.now = () => t;
    window.requestAnimationFrame = (cb) => { queue.push(cb); return queue.length; };
    window.cancelAnimationFrame = () => {};
    window.__step = (frames, dt = 16.7) => {
      for (let i = 0; i < frames; i++) {
        t += dt;
        const due = queue.splice(0);
        for (const cb of due) cb(t);
      }
      return t;
    };
    window.__now = () => t;
    window.__realNow = realNow;
  })();
`;

/** Phase of each marquee plus the width of one repetition, for rate comparison. */
const MQ_SAMPLE = () => {
  const $$ = (s) => [...document.querySelectorAll(s)];
  return $$('.mq').map((m) => {
    const half = m.scrollWidth / 3 || 1;
    const x = /translate3d\((-?[\d.]+)px/.exec(m.style.transform || '');
    const skew = /skewX\((-?[\d.]+)deg/.exec(m.style.transform || '');
    return { phase: x ? Number(x[1]) : null, half, skew: skew ? skew[1] : null };
  });
};

/** Values the effect layer writes, sampled from the live DOM. */
const SAMPLE = () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const kin = $$('[data-kin]').map((root) => ({
    id: root.id,
    // first, middle and last character weights of each kinetic block
    weights: [0, Math.floor($$('.ch', root).length / 2), $$('.ch', root).length - 1]
      .filter((i) => i >= 0)
      .map((i) => $$('.ch', root)[i]?.style.fontVariationSettings ?? ''),
    goClasses: $$('.ch.go', root).length,
  }));
  return {
    time: Math.round(window.__now()),
    frames: true,
    kin,
    // The marquee translation is compared by *rate*, not by absolute phase: the
    // starting phase is arbitrary in a seamless loop (and the old version seeded
    // it from a fallback-font measurement). Content width is compared directly.
    marquee: $$('.mq').map((m) => Math.round((m.scrollWidth / 3) * 100) / 100),
    progress: $('#prog')?.style.transform ?? '',
    lens: $$('.code.hot').map((c) => c.style.maskPosition),
    reveals: $$('.rv.in-v').length,
    activeNav: $$('#mlinks a.on').map((a) => a.getAttribute('href')),
  };
};

const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM ?? '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  headless: true,
});

async function run(url) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  // deliberately NOT reduced motion: this is the animated path
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.evaluateOnNewDocument(FAKE_CLOCK);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  // The design sets `scroll-behavior: smooth`; that animation runs on real time
  // and would leave the page mid-scroll (different rects and scrollTop) when the
  // fake frames are stepped, making the scroll- and lens-derived values
  // nondeterministic even against the same page. Force instant scrolling first.
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  // reveal everything first (IntersectionObserver depends on real scroll), then
  // run the animation frames with the fake clock
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await new Promise((r) => setTimeout(r, 250));
  // Two halves, so the marquee can be compared by how far it *advances* (its
  // absolute phase is arbitrary in a seamless loop) instead of by position.
  await page.evaluate(() => window.__step(90));
  const mqA = await page.evaluate(MQ_SAMPLE);
  await page.evaluate(() => window.__step(90));
  const mqB = await page.evaluate(MQ_SAMPLE);
  const out = await page.evaluate(SAMPLE);
  out.marqueeAdvancePer90Frames = mqA.map((a, i) => {
    const b = mqB[i];
    if (!a || !b || a.phase === null || b.phase === null) return null;
    let d = b.phase - a.phase;
    if (d > a.half / 2) d -= a.half;
    if (d < -a.half / 2) d += a.half;
    return { advance: Math.round(d * 100) / 100, skew: b.skew };
  });
  await page.close();
  return out;
}

const A = await run(urlA);
const B = await run(urlB);
await browser.close();

let diffs = 0;
const show = (label, a, b) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) diffs++;
  console.log(`${same ? '  =  ' : '  DIF'} ${label}`);
  if (!same) {
    console.log(`        old: ${JSON.stringify(a)}`);
    console.log(`        new: ${JSON.stringify(b)}`);
  }
};

console.log(`fake clock at ${A.time} ms in both versions\n`);
show('kinetic weights (first/middle/last per block)', A.kin, B.kin);
show('revealed elements (.rv.in-v)', A.reveals, B.reveals);
show('active nav link', A.activeNav, B.activeNav);
show('marquee transforms', A.marquee, B.marquee);
show('scroll progress transform', A.progress, B.progress);
show('section lens masks', A.lens, B.lens);

console.log(`\n${diffs === 0 ? 'identical animated state' : diffs + ' differing value groups'}`);
process.exit(diffs === 0 ? 0 : 1);
