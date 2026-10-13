# Feature: migrate the portfolio to Astro + Tailwind without touching the effects

Goal: replace the single self-contained `index.html` with a real project — Astro 7 (static output)
plus Tailwind 4 — that produces the *same* site, byte-for-byte in appearance, while removing the
runtime DOM construction the current inline script performs.

## Baseline measured before writing any code (2026-10-13)

| Metric | Value |
| --- | --- |
| `index.html` | 67,516 B — inline `<script>` 36,437 B (53%), inline `<style>` 16,342 B (24%), markup 14,737 B (21%) |
| Compressed | gzip 23,813 B · brotli 24,648 B |
| External requests | 4 (two preconnects, the Google Fonts stylesheet, one link) |
| Live timing | TTFB ~0.43 s, total ~0.47 s |
| Runtime DOM | 2,968 nodes; **333 SVG nodes and 47 kinetic spans built by JS at load**, plus 14 project cards and the studies/certifications rows |
| Headless timing (harness, 3 runs) | FCP 560/560/608 ms · DOMContentLoaded 619/645/746 ms · load 650/751/797 ms |
| Tooling | node 26.5.1 · pnpm 11.9 · ImageMagick `compare` · astro 7.3.8 · tailwindcss 4.3.3 |

## Specs

S1 — The request, verbatim: "ahora quiero mejorar completamente el stack del portafolio para que
sea mas profesional y mas optimo y robusto por ejemplo astro+tailwind, procede a migrar el proyecto
y luego verifica si con esto se puede mejorar el rendimiento sin perder o modificar los efectos o
animaciones actuales".

S2 — Tailwind scope (decision, verbatim): "Astro + Tailwind, efectos intactos (recomendado)".
Tailwind is configured with the design's tokens in `@theme` and used for layout; the effect layer
(kinetic typography, grain, cursor ring, reveals, marquees, `color-mix`, view transitions) stays
authored CSS, imported unchanged.

S3 — Build-time rendering (decision, verbatim): "Sí: mover ese DOM a build time (recomendado)" — the
SVG diagrams, the kinetic character spans, the 14 project cards and the studies/certifications rows
become static HTML; the script only wires interaction.

S4 — Hard constraint: no effect or animation may be lost or altered. Verified by pixel diffing the
old and new renders with `prefers-reduced-motion` forced (deterministic frames), full page, with the
live clock frozen on both sides.

S5 — Honest reporting rule: Astro + Tailwind does **not** materially reduce CSS here (16 KB of
hand-written, fully used CSS); the gains reported must be the ones actually measured — build-time
DOM, fewer runtime nodes, hashed cacheable assets, smaller repeat-visit payload.

S6 — Deployment unchanged: same Dokploy application `portafolio-asbit-rzcv7e`, same domain, same
push-to-deploy flow. The Dockerfile becomes multi-stage (node build → nginx serve `dist/`).

S7 — The i18n behaviour stays runtime (instant toggle, no navigation): Spanish text stays in the
markup, English in a dictionary, both keyed by `data-i18n`, and the parity check must keep passing.

## Tasks

| ID | Specs | Route | Commit |
| --- | --- | --- | --- |
| A1 | S1, S6 | Inline (parent) | scaffold: package.json, astro.config, tsconfig, Dockerfile, tooling |
| A2 | S2, S7 | Inline (parent) | extract `effects.css` and the data modules verbatim; Tailwind `@theme` with the tokens |
| A3 | S3, S7 | Inline (parent) | components: layout, nav, hero, about, experience, work, stack, contact, project card, diagram |
| A4 | S3, S7 | Inline (parent) | port the runtime script to wire the static DOM (no DOM construction) |
| A5 | S4 | Inline (parent), automated | pixel diff old vs new → **0 differing pixels** |
| A6 | S5 | Inline (parent), measured | performance before/after with the same harness + build output sizes |
| A7 | S6 | Inline (parent) + live check | done: Dokploy built the multi-stage image, service 1/1, live diff 0 px |

## Log

L1 (user request, verbatim): see S1.

L2 (decisions, verbatim): "Astro + Tailwind, efectos intactos (recomendado)" and "Sí: mover ese DOM a
build time (recomendado)".

L3 (baseline, 2026-10-13): the figures in the table above, all measured before any change. Notable:
the inline script is 53% of the file and the browser builds 333 SVG nodes plus 47 kinetic spans at
load, which is the actual optimisation target; CSS is only 24% and already minimal, so Tailwind
cannot shrink it.

L4 (A1–A4, 2026-10-13): the repo is now an Astro 7 project (`src/` with `layouts`, `components`,
`data`, `lib`, `scripts`, `styles`, plus `tools/` for the checks and a multi-stage Dockerfile).
`src/styles/effects.css` is the old stylesheet **verbatim** (16,342 B, untouched);
`src/styles/tailwind.css` imports only `tailwindcss/theme.css` + `tailwindcss/utilities.css` and adds
the design tokens in an `@theme` block. Preflight is deliberately not imported so the design's own
reset keeps governing. Tailwind's default palette is tree-shaken away (0 `--color-*` variables
emitted); its cost is the ~3.3 KB uncompressed utilities/`@property` layer. The runtime script lost
its DOM construction entirely: it now collects the pre-rendered kinetic spans, and the project list
for the command palette is read from the DOM instead of importing the 16 KB data module.

L5 (A5, A6, 2026-10-13): the verification harness (`tools/visual-check.mjs`, puppeteer-core against
the system chromium + ImageMagick) renders both versions full page with `prefers-reduced-motion`,
the clocks hidden and SMIL animations frozen, and reports **0 differing pixels** out of ~14.7 M
(14,40×10,220 px). A control run (new vs new) also diffs 0, so the measurement is stable; the first
attempt showed 64 differing pixels that turned out to be the diagram's `animateMotion` packet dot,
which reduced motion does not stop — the fix was to freeze SMIL in the harness, not in the page.
Structural parity is exact: 47 kinetic spans, 333 SVG nodes, 14 diagrams, 14 cards and 36 code-panel
lines in both versions. Same-harness timings: FCP 408 → 216 ms, DOMContentLoaded 799 → 374 ms,
DOMInteractive 799 → 29 ms. Build output: index.html 48,230 B (gzip 9,838), CSS 19,680 B (gzip 5,366),
JS 24,995 B (gzip 10,311) — 92.9 KB total (gzip 25.2 KB) against 67.5 KB (gzip 23.4 KB) before, so the
first visit is ~1.8 KB heavier gzipped while a repeat visit drops from 23.4 KB to 9.8 KB because CSS
and JS are now hashed and cacheable. Reported as measured, per S5.

L6 (A7, deploy, 2026-10-13): the first Docker attempt failed with `corepack: not found` — Node 26
images no longer bundle corepack — so the build stage installs pnpm explicitly (`npm install -g
pnpm@11.9.0`). The image then built and served correctly locally (200, 48,230 B, CSS 200) and in
Dokploy: the deployment went `running` → `done` in ~25 s, the service stayed 1/1, and the live site
returns 200 with 48,230 B, the expected title and the hashed CSS/JS assets. The four routes still
behave: `asbit.me` 200, `www.asbit.me` 301, `asbit.dev` 301, `engram.asbit.dev` 301. Live pixel diff
against the pre-migration site: **0 differing pixels**. Live TTFB 0.44/0.47/0.66 s (0.43 s before the
change — same order, measured through Cloudflare and the tunnel).

L7 (build parity and tooling, 2026-10-13): Tailwind's scanning is now scoped (`source(none)` plus
explicit `@source` for components, layouts, pages, scripts and tools) so a local build and the
container build emit byte-identical CSS — 18,142 B in both, against 19,680 B local / 18,453 B
container before the fix. Two repeatable gates live in `tools/`: `visual-check.mjs` (full-page pixel
diff via puppeteer-core + ImageMagick, exit code 1 on any difference) and `i18n-check.mjs` (bilingual
parity over the built HTML). Lesson worth keeping: `prefers-reduced-motion` does **not** stop SMIL, so
the harness must freeze animations (`setCurrentTime(0)` + `pauseAnimations()`); otherwise the moving
packet dot in the diagrams produces ~64 false-positive pixels, which is exactly the false alarm the
first run produced.

L8 (verification gaps closed, 2026-10-13): the independent verifier rightly flagged that a single
1440 px reduced-motion capture covers neither the animations, nor other themes and viewports, nor
event-driven paths. All three gaps were then closed with new evidence rather than argument:

- **Themes and viewports:** extra pixel diffs at 1440 dark, 390 light and 390 dark — **0 differing
  pixels** in every combination.
- **Animation:** `tools/animation-check.mjs` replaces `performance.now()`/`requestAnimationFrame`
  with a stepping queue before any page script runs, advances the same 180 frames in both versions
  and compares what the effects actually write: kinetic typography weights, revealed elements,
  active nav link, marquee transforms, scroll progress and the per-section lens masks. All six
  groups are identical. The second finding of that run was a harness bug, not a page bug: the design
  sets `scroll-behavior: smooth`, so the page was still mid-scroll when the fake frames ran, which
  made three groups differ even against the same page; forcing `scroll-behavior: auto` for the check
  turned the control run into a deterministic pass.
- **Interactions:** `tools/interaction-check.mjs` drives the command palette (Ctrl+K, filtering,
  arrow navigation, Escape, opening with `/`, the hidden `sudo` command), the language round trip,
  the theme toggle, expanding a project card, and — with a fine pointer forced through Blink settings
  — the cursor ring and the contact magnet: **21 of 21 outcomes identical**.

One pre-existing defect surfaced during that last check, present identically in both versions and
therefore not a regression: after the palette has been used once, `closePal()` returns focus into
its hidden input, so the `/` shortcut stays inhibited until the user clicks elsewhere. Reported to
the user for a separate decision; the migration does not change it.
