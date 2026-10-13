# asbit.me — personal portfolio

Single-page portfolio for Andrés Sebastián Bravo, served by nginx from a container
image built by [Dokploy](https://dokploy.com) on the `vps-oracle` host.

## Contents

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: inline CSS, inline SVG icons, one inline script, no build step. |
| `Dockerfile` | `nginx:alpine` + `index.html` copied to the web root. |
| `odd/tasks/asbit-dokploy-migration.md` | Deployment migration record (specs, tasks, evidence). |

## Deployment

Dokploy application `portafolio-asbit` builds this repository from the `main` branch
(source type GitHub, Dockerfile build) and routes the domain through the host Traefik
instance on port 80. Cloudflare terminates TLS in front of the host.

Push to `main` and Dokploy redeploys automatically.

External runtime dependencies: the Google Fonts stylesheet linked in `index.html`.
Everything else is inlined, so the page renders even if that request fails (system
font fallbacks are declared in every `font-family` stack).
