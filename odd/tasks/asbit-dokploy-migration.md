# Feature: migrate the asbit.me portfolio from GitHub Pages to Dokploy on vps-oracle

Goal: serve the new portfolio version (this project folder's `index-v3.html`) from a Dokploy
application on `vps-oracle`, retiring the GitHub Pages deployment while keeping `asbit.me` as
the primary domain.

Source repo: `Andrez421/asbit-me` (new). Runtime host: `vps-oracle` (Dokploy v0.29.10 +
Traefik v3.6.7, public IP 149.130.184.190, Cloudflare Tunnel to `http://localhost:80`).

## Specs

S1 — The new version to publish is the file in this project folder, not the repo copy.
Quote (verbatim): "ahora usare la nueva veersion que esta en la carpeta de este proyecto pero ya
no lo quiero desplegar a travez de github con el dominio en cloudflare si no quier que sea un
despliegue desde dokploy como otros proyecto que estan en vps-oracle".

S2 — GitHub Pages + Cloudflare-as-Pages-origin is retired.
Quote (verbatim): "ya no lo quiero desplegar a travez de github con el dominio en cloudflare".

S3 — Deployment must go through Dokploy, like the other projects on vps-oracle.
Quote (verbatim): "si no quier que sea un despliegue desde dokploy como otros proyecto que estan
en vps-oracle".

S4 — SSH verification against the host is part of the work.
Quote (verbatim): "utiliza ssh para conectarte y verificar y ayudame a migrarlo".

S5 — Repo decision (questionnaire, option 1): "Repo nuevo (recomendado) — p. ej.
Andrez421/asbit-me" → new repository, old site untouched until the DNS cutover.

S6 — Dokploy credential decision (questionnaire, custom answer): "usa cualquier api key de las
que estan". Verified 2026-10-13: the three stored keys (`miapikey`, `api_key`,
`gcly-ops-minted`) are hashes, not usable tokens (all return HTTP 401 against
`/api/project.all`), so a new key or the panel UI is required.

S7 — DNS/origin decision (questionnaire, custom answer): "yo lo cambio pero no deberia pauntar a
una ip si no a localhost 80 como los demas, ya que utilizo tunel y traefik hace el resto".
The tunnel already maps public hostnames to `http://localhost:80` (cloudflared log:
`ingressRule=3 originService=http://localhost:80`); Traefik does host-based routing.

S8 — Primary domain (questionnaire): "asbit.me (como está ahora)". The HTML `canonical` and
`og:url` already point to `https://asbit.me`.

S9 — Serve the static page from a container image built by Dokploy, matching the existing app
pattern on the host: `sourceType=github`, `buildType=dockerfile`, `autoDeploy=true`, domain on
port 80, Traefik router on entrypoint `web` (Cloudflare terminates TLS; `acme.json` is empty).

## Tasks

| ID | Specs | Route | Commit |
| --- | --- | --- | --- |
| T1 | S1, S9 | Inline (parent) | 1396c59 — scaffold: index.html + Dockerfile + README + .gitignore |
| T2 | S5 | Inline (parent) | repo `Andrez421/asbit-me` created, `main` pushed (1396c59) |
| T3 | S3, S6, S9 | Inline (parent, Dokploy API) | app `portafolio-asbit-rzcv7e` + domain `asbit.me:80` |
| T4 | S4, S9 | Inline (parent, verified over SSH) | deploy `done`, service 1/1, router verified |
| T5 | S7, S8 | User-owned (Cloudflare Tunnel hostname) + parent verification | DNS cutover to the tunnel |
| T6 | S2 | User decision at close | retire GitHub Pages / `CNAME`, decide `www` + broken `asbit.dev` |

## Log

L1 (user request, verbatim): "verifica el archivo y mi repo en github Andrez421.github.io se trata
de mi portafolio personal, quiero cambiar la forma de deplegarlo y renovarlo, es decir que ahora
usare la nueva veersion que esta en la carpeta de este proyecto pero ya no lo quiero desplegar a
travez de github con el dominio en cloudflare si no quier que sea un despliegue desde dokploy como
otros proyecto que estan en vps-oracle, utiliza ssh para conectarte y verificar y ayudame a
migrarlo"

L2 (questionnaire answers, verbatim): repo = "Repo nuevo (recomendado) — p. ej.
Andrez421/asbit-me"; Dokploy route = "(custom) usa cualquier api key de las que estan";
DNS = "(custom) yo lo cambio pero no deberia pauntar a una ip si no a localhost 80 como los demas,
ya que utilizo tunel y traefik hace el resto"; domain = "asbit.me (como está ahora)".

L3 (evidence, 2026-10-13): `Andrez421/Andrez421.github.io` is public, branch `main`,
`index.html` (39 KB, title "A. Sebastian — Full Stack Developer"), `CNAME` = `asbit.me`,
`README.md`; GitHub Pages built with `build_type: legacy`, source `main:/`.
`dig` shows `asbit.me` and `www.asbit.me` behind Cloudflare; `www` 301s to `asbit.me`
(`x-github-request-id` present). `asbit.dev` root answers HTTP 525; `engram.asbit.dev` is a
Dokploy app.

L4 (evidence, 2026-10-13): vps-oracle runs Dokploy v0.29.10 (panel :3000, reachable from
internet), Traefik v3.6.7 (80/443, entrypoint `web` only for app routers), `cloudflared` service
with a token-run tunnel, user `ofcsisadmin` in the `docker` group. Existing apps:
`portafolioharryarroyo-frontend-wrepnb` (harryarroyo.art), `gcly-app-gg8qpb` (gcly.app),
`secopia-web-vkjqx2` (secop-ia.app), `engram-llqkt9` (engram.asbit.dev). All GitHub-sourced apps
use `buildType=dockerfile` and the GitHub provider installation owned by `Andrez421`.

L5 (evidence, 2026-10-13): TLS terminates at Cloudflare (`acme.json` empty, Traefik 443 answers
with `TRAEFIK DEFAULT CERT`); routers generated by Dokploy use entrypoint `web`, i.e. origin is
plain HTTP on port 80, matching S7 and S9.

L6 (evidence, 2026-10-13): no usable Dokploy API token exists in the database (S6); API
`/api/project.all` returns 401 for every stored key value and for the `${prefix}_${key}` forms.

L7 (T1 done, 2026-10-13): commit `1396c59` on `main` — `Dockerfile` (nginx:alpine +
`COPY index.html`), `README.md`, `.gitignore` (`.atl/` plus the local `index-v3.html`
snapshot), `.dockerignore`, this document, and `index.html` byte-identical to `index-v3.html`
(sha256 `8367ea0915ec9ab6d4a63be095b2888f6acc14bfbcb81a19fd7ab3e7a0f76602`).
Check (applicable, run once): local `docker build` + container serve → HTTP 200 and the served
body hashes to the same sha256 as `index.html`.

L8 (T2 done, 2026-10-13): created public repository `Andrez421/asbit-me` (default branch
`main`) with `gh repo create --source=. --remote=origin --push`; `origin` tracks `main`.

L9 (T3 blocker, 2026-10-13): confirmed the Dokploy keys are unrecoverable — the panel logs
repeat `Error verifying API key Error: Invalid API key.` for the stored `key`, for
`${prefix}_${key}`, and for `Authorization: Bearer`; `/api/project.all` answers 401 while
`/api/health` answers 200. T3 waits for a freshly minted key (panel → Settings → API Keys)
or for the application to be created in the panel.

L10 (T3 done, 2026-10-13): the user minted a key (user-scoped prefix `asbit`), stored locally at
`~/.config/asbit/dokploy-api-key` (mode 600, outside the repo) and used only against
`http://127.0.0.1:3000` on the host, never over public HTTP. `GET /api/project.all` → 200.
Created project `asbit` (projectId `fmChozsjkm650jYyKUx_B`, environment `production`
`Xbt1vlZwcatHdS3aSUNfS`) and application `portafolio-asbit-rzcv7e` (applicationId
`fbH1LlHXOPDgvDNjOoN1V`).

Operational finding: in Dokploy v0.29.10 `POST /api/application.create` silently ignores
`sourceType`, `githubId`, `owner`, `repository`, `branch` and `buildType` (the app is created as
`nixpacks` with a null repository). The working sequence is `project.create` →
`application.create` → `application.saveGithubProvider` (`githubId=9WnjbkA0K6zE3425ehA67`,
`owner=Andrez421`, `repository=asbit-me`, `branch=main`, `buildPath=/`) →
`application.saveBuildType` (`buildType=dockerfile`, `dockerfile=./Dockerfile`,
`herokuVersion=24`, `railpackVersion=0.15.4` — the endpoint validates every field, including the
builders this app does not use) → `domain.create` (`asbit.me`, port 80, `https=false`,
`certificateType=none`) → `application.deploy`. The GitHub App already listed
`Andrez421/asbit-me` (verified via `github.getGithubRepositories`), so no repository-access
change was needed.

L11 (T4 done, 2026-10-13): deployment `2al_hsBhG1ygd4jNjwuj8` finished `done`; swarm service
`portafolio-asbit-rzcv7e` is `1/1`; Dokploy wrote
`/etc/dokploy/traefik/dynamic/portafolio-asbit-rzcv7e.yml` with `Host(`asbit.me`)` routing to
`http://portafolio-asbit-rzcv7e:80` on entrypoint `web`. Checks: `curl -H "Host: asbit.me"
http://127.0.0.1/` → 200, 55213 bytes, body sha256 `8367ea09…f76602` (identical to
`index.html`), title `Andrés Sebastián Bravo — Desarrollador Full Stack`; an unknown Host
returns 404, so the router is host-scoped and not a catch-all.
