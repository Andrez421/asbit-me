# Feature: Tailwind layout, palette shortcut fix, build-time code panels

Third round on the portfolio stack: finish what the Astro migration deliberately left out.

## Specs

S1 — The request, verbatim: "implementa los 3" — referring to the three decisions explained in the
previous turn: (a) convert the existing layout to Tailwind utilities section by section, (b) fix the
command-palette `/` shortcut, (c) move the code-texture panels to build time.

S2 — Non-negotiable from the previous round: no visual or behavioural change. Every step is gated by
the three tools in `tools/` (pixel diff at several viewports and themes, deterministic animation
comparison, interaction parity), and the pixel diff must stay at 0.

S3 — Tailwind scope, agreed in the migration round: layout only. Colours stay in CSS because they are
runtime theme variables (a static colour utility would freeze dark mode), and `effects.css` is
unlayered so a utility only takes effect once the equivalent declaration is deleted. Typography that
belongs to the fluid design scale, borders (themed colours), transitions, masks, blends and every
animation stay in the stylesheet.

S4 — The palette fix must make `/` work every time, including right after the palette has been used:
today `closePal()` restores focus into the palette's own hidden input, so the handler's typing check
suppresses the shortcut until the user clicks elsewhere. Pre-existing in both versions.

S5 — The panels move to build time because they are measured, not assumed, to be expensive: they are
1,928 of 2,933 DOM nodes (66%) and the page shows ~300 ms of long tasks from the script on desktop,
where `buildCode()` runs twice (initial + `fonts.ready`). Any byte growth must be reported as
measured.

S6 — The panels must remain robust at any viewport: the build pre-renders a budget derived from the
measured needs, and the runtime keeps a small top-up path for the (undesigned and unlikely) case of a
section taller than the budget, so a short budget can never show a truncated texture.

## Tasks

| ID | Specs | Route | Commit |
| --- | --- | --- | --- |
| B1 | S1, S3, S2 | Inline (parent) | done: layout to utilities, effect layer intact, 0 px in 7 scenarios |
| B2 | S1, S4, S2 | Inline (parent) | done: `/` works after closing the palette (gate marks it FIX) |
| B3 | S1, S5, S6 | Inline (parent) | done: panels pre-rendered, runtime clones; +4.2 KB gzip for ~137 ms less blocking |
| B4 | S2 | Inline (parent), automated | done: 0 px in 7 scenarios, animated state identical, 21/21 interactions |

## Log

L1 (user request, verbatim): "implementa los 3".

L2 (measurements taken before writing any code, 2026-10-13): panel need per column at 1440 px —
hero 80, about 73, experience 212, work 148, stack 109, contact 72; at 390 px — 78, 80, 280, 132,
169, 66. Panel text ≈ 50.3 k chars per layer at 1440 and 58.5 k at 390, doubled because the dim and
hot layers hold the same content. Long tasks on desktop: 250 ms (parse), 176 ms and 122 ms (script),
84 ms; total blocking 453 ms. On mobile: 221 ms, 55 ms, 51 ms; 177 ms blocking. DOM: 1,928 panel nodes
of 2,933 total on desktop, 2,240 of 3,245 on mobile.

L3 (Tailwind breakpoints): the design uses `max-width:1000px`, `800px`, `560px` and `hover:none`.
Tailwind's `max-*` variants compare strictly (`width < N`), so the tokens are declared one pixel above
the design's values (`--breakpoint-mq1000: 1001px`, `mq800: 801px`, `mq560: 561px`) which makes
`max-mq1000:` exactly `@media (max-width:1000px)`.

L4 (B1, two cascade traps worth remembering): layout of 14 selectors moved to utilities. First trap:
every spacing utility was inert because the design's own `*{margin:0;padding:0}` reset was *unlayered*,
and CSS gives unlayered rules priority over **any** layered one whatever the specificity — the page
lost exactly the deleted declarations (99 px in about, 603 in experience, 118 in work, 121 in stack,
16 in contact). Fix: `effects.css` now goes into a `design` layer declared *before* `utilities`, so
utilities win where they are meant to while the design keeps governing itself. Second trap:
`.menu-links` keeps `display:none` at ≤800 px in CSS, and the `flex` utility (later layer) won over
it, leaving the desktop menu visible on mobile (683–3,819 differing pixels below 800 px) — that one
declaration stays CSS-only and the reason is written in the file. After both fixes: **0 differing
pixels** at 1440, 1440 dark, 1000, 800, 560, 390 and 390 dark.

L5 (B2): `closePal()` now blurs whatever focus is left inside the dialog and the keyboard handler
ignores focus that sits inside a *closed* palette. The interaction gate reports
`FIX paletteAfterEscapeNoBlur`: the old version kept the shortcut suppressed, the new one opens the
palette — an intentional difference the gate is told to expect rather than treat as a regression.

L6 (B3): panels are rendered at build time with a per-section line budget from the measured maxima
(101/98/371/171/194/84 lines against needs of 88/85/323/149/169/73 across 320–1920 px). The runtime
clones the dim layer's nodes into the hot layer — one HTML parse instead of two — and keeps
`panelHtml` as a fallback for sections taller than the budget, so a short budget can never truncate
the texture. `.nojs .code{display:none}` preserves the no-JS rendering, and the hot layer starts with
its mask off-screen in CSS, which is the state the old code set from JS. The animation gate now
compares the marquee by *rate* (advance per 90 frames) and content width, because the old version
seeded its offset from a fallback-font measurement (650 px) and never re-seeded it with the real font
(3,174 px) — a latent bug the new version does not have, and the only reason the absolute phases
differ.

L7 (B4, measured): same harness, local against local — DOMInteractive 772→145 ms, DOMContentLoaded
773→381 ms, load 857→382 ms, FCP 688→204 ms, long-task blocking 493→356 ms (−28%). Page bytes:
92.9 KB→204.3 KB raw (HTML 48→159 KB, because the texture now ships pre-rendered) and gzip
25.2→29.5 KB (**+4.2 KB, +17%**), in exchange for removing 1,928 runtime DOM nodes and the double
panel construction. DOM node count went 2,921→3,807: the extra nodes are parsed from the HTML rather
than built by script. Reported as measured, per S5.

L8 (build parity): the local and container CSS differed by 28 bytes — the single `.absolute` rule.
The cause was a stale local Tailwind/Vite cache, not the configuration: after
`rm -rf .astro node_modules/.vite dist`, a clean local build is byte-identical to the container
(CSS 20,360 B, HTML 158,909 B). `.absolute` itself is a false-positive candidate Tailwind extracts
from the string `position:absolute` inside effects.css — harmless, a few bytes, noted for the record.
