# asbit.me — personal portfolio

Single-page portfolio for Andrés Sebastián Bravo, built with **Astro 7** and **Tailwind 4**,
served as static files by nginx from a container image built by [Dokploy](https://dokploy.com).

## Stack

| Piece | Why |
| --- | --- |
| Astro 7 (static output) | Components, data modules and a build step; renders the project cards, SVG diagrams, kinetic spans and the studies/certifications rows **at build time** instead of in the browser. |
| Tailwind 4 | Configured with the design tokens in `@theme` (`src/styles/tailwind.css`). Only `theme` + `utilities` are imported — deliberately **no preflight**, so the design's own reset keeps governing the base styles. |
| Authored CSS | `src/styles/effects.css` holds the effect layer (kinetic typography, grain, cursor ring, reveals, marquees, `color-mix`, view transitions) exactly as it was designed. The colours are runtime theme variables, so the effects layer stays CSS rather than becoming utility classes. |

## Layout

```
src/
  layouts/Base.astro        head, meta, fonts, global stylesheet, runtime script
  components/               Chrome, Nav, Hero, About, Experience, Work, ProjectCard, Stack, Contact, Overlays
  data/                     projects, studies + certs, code snippets, English strings
  lib/                      render helpers (kinetic spans, project diagrams)
  scripts/portfolio.ts      runtime behaviour (theme, language, reveals, lenses, palette, clock)
  styles/                   tailwind.css (theme + utilities) and effects.css (untouched design CSS)
tools/
  visual-check.mjs          pixel-diff regression check (puppeteer-core + ImageMagick)
  i18n-check.mjs            bilingual parity check over the built HTML
```

## Commands

```bash
pnpm install        # dependencies
pnpm dev            # local dev server with HMR
pnpm build          # static output in dist/
pnpm preview        # serve dist/ locally
pnpm i18n-check     # every data-i18n key must exist in the English dictionary, and vice versa
pnpm visual-check <urlA> <urlB> [outDir]   # full-page pixel diff, reduced motion, frozen animations
```

## Bilingual behaviour

Spanish lives in the markup, English in `src/data/i18n.ts`, both keyed by `data-i18n`
(text) and `data-i18n-aria` (accessible labels). The toggle swaps them in place — no navigation —
and `pnpm i18n-check` fails if the two sides drift apart.

## Deployment

Dokploy application `portafolio-asbit`, in project `asbit` (environment `production`), builds this
repository from `main`: the multi-stage `Dockerfile` runs `pnpm build` on `node:26-alpine` and copies
`dist/` into `nginx:alpine`. Push to `main` and Dokploy redeploys automatically.

Runtime path on the host: Cloudflare terminates TLS, the `cloudflared` tunnel forwards the public
hostname to `http://localhost:80`, and Traefik routes `Host(asbit.me)` to this container.
