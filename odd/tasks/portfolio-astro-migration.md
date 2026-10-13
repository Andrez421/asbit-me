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
| A5 | S4 | Inline (parent), automated | pixel diff old vs new (full page, frozen clock, reduced motion) → zero differences |
| A6 | S5 | Inline (parent), measured | performance before/after with the same harness + build output sizes |
| A7 | S6 | Inline (parent) + live check | build in Docker, deploy through Dokploy, verify the live bytes and routes |

## Log

L1 (user request, verbatim): see S1.

L2 (decisions, verbatim): "Astro + Tailwind, efectos intactos (recomendado)" and "Sí: mover ese DOM a
build time (recomendado)".

L3 (baseline, 2026-10-13): the figures in the table above, all measured before any change. Notable:
the inline script is 53% of the file and the browser builds 333 SVG nodes plus 47 kinetic spans at
load, which is the actual optimisation target; CSS is only 24% and already minimal, so Tailwind
cannot shrink it.
