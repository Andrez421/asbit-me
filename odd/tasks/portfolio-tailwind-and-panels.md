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
| B1 | S1, S3, S2 | Inline (parent) | layout of the 11 selectors to Tailwind utilities; delete only those declarations |
| B2 | S1, S4, S2 | Inline (parent) | palette `/` fix + interaction gate asserts it |
| B3 | S1, S5, S6 | Inline (parent) | panels rendered at build with a measured budget; runtime clones and tops up |
| B4 | S2 | Inline (parent), automated | all three gates at 1440/1000/800/560 × light/dark, live check, before/after measurement |

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
