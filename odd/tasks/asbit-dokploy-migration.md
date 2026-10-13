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
| T5 | S7, S8 | User-owned (Cloudflare Tunnel hostname) + parent verification | cutover: tunnel public hostname `asbit.me` → `http://localhost:80` |
| T6 | S7 | User-owned (Cloudflare Redirect Rules) + parent verification | `www.asbit.me` and `asbit.dev` 301 → `https://asbit.me` |
| T7 | S2 | Parent, after the Cloudflare fixes | unpublish GitHub Pages + remove `CNAME` from `Andrez421.github.io` |
| T8 | S1 | User-owned (Cloudflare Scrape Shield) + parent re-check | stop Email Address Obfuscation from rewriting the HTML, then verify byte fidelity |

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

L12 (T4 checks extended, 2026-10-13): auto-deploy verified for real — pushing `c4666ab`
produced deployment `Y0ztsbpaoXEP` (`done`, title = commit subject) with no manual trigger.
Content checks on the delivered file: 1 inline `<script>`, `node --check` passes; 36 `id`s and
6 internal anchors, none dangling; sections `about/experience/work/stack/contact`;
`canonical` = `https://asbit.me`; document starts with a doctype and closes with `</html>`.
Visual check: headless Chromium (1440px) against the container renders the hero, nav, theme and
language toggles and both web fonts, with no console or network errors.

L13 (T6 decisions, 2026-10-13, verbatim): "Redirección en Cloudflare (recomendado)" for
`www.asbit.me`; "Despublicar Pages y quitar CNAME (recomendado)" for `Andrez421.github.io`;
"Redirigir a asbit.me (recomendado)" for the broken `asbit.dev` apex. Redirect rules are
evaluated at the Cloudflare edge with `concat("https://asbit.me", http.request.uri.path)`,
status 301, query string preserved: one in the `asbit.me` zone for hostname `www.asbit.me` and
one in the `asbit.dev` zone for hostname `asbit.dev` (which also clears the current HTTP 525
without touching the broken origin). Pages stays published until the cutover check passes, so
the rollback path (revert the `asbit.me` DNS record) keeps serving the old design.

L14 (T5 done, T6/T8 blocked, 2026-10-13): `asbit.me` now serves the new site —
`https://asbit.me/` → 200, `<title>Andrés Sebastián Bravo — Desarrollador Full Stack</title>`,
`server: cloudflare`, `last-modified` = the nginx file timestamp. So the tunnel hostname works and
the Dokploy origin is behind it.

Two separate defects, both on the Cloudflare side, with evidence:

1. `www.asbit.me` does not resolve: `dig www.asbit.me` → `status: NXDOMAIN`, 0 answers. Redirect
   Rules are evaluated at the edge only for hostnames that resolve to Cloudflare through a
   **proxied** record in the zone, so the rule can never fire. Fix: add a proxied (orange)
   `A www → 192.0.2.1` record (RFC 5737 documentation address; never contacted because the edge
   answers first) or a proxied `CNAME www → asbit.me` in the `asbit.me` zone.
2. `asbit.dev` still reaches an origin instead of matching a rule: `https://asbit.dev/` → 525 and
   `http://asbit.dev/` → 200 with a foreign parked page (`data-adblockkey`, `lang="en"`).
   Redirect Rules are scoped per zone, so a rule authored in the `asbit.me` zone with a
   `hostname eq "asbit.dev"` expression never sees asbit.dev traffic; the rule has to live in the
   `asbit.dev` zone.

Also observed (T8): Cloudflare rewrites the delivered HTML. Diff against `index.html` shows
`mailto:asbravopa@gmail.com` replaced by `/cdn-cgi/l/email-protection#…` plus
`<span class="__cf_email__" data-cfemail="…">[email protected]</span>`, and an injected
`/cdn-cgi/scripts/…/email-decode.min.js` before the inline script, so the served body hash is
`170c5c3f…f016` instead of `8367ea09…f76602`. Functional check in a real browser (headless
Chromium, JS on): the decode script runs before the kinetic-typography block, so the DOM ends up
with `asbravopa@gmail.com` and `href="mailto:asbravopa@gmail.com"` — the page is not visibly
broken, but byte fidelity between the repo and what Cloudflare serves is lost (and the no-JS
case degrades to `[email protected]`).

L15 (T6 cause confirmed, 2026-10-13): the user confirmed the `asbit.dev` redirect rule is created
in the **`asbit.me`** zone (verbatim: "Está en la zona asbit.me"), which is exactly why asbit.dev
traffic never matches it: Redirect Rules are scoped per zone. Fix is to create it in the
`asbit.dev` zone, scoped to the apex only — `Hostname equals asbit.dev`, never a
`*.asbit.dev` wildcard, because `engram.asbit.dev` is a live Dokploy app that must keep working —
and to remove or disable the misplaced rule in the `asbit.me` zone (where only the `www` rule
belongs). T7 stays pending until these Cloudflare fixes are verified, so the GitHub Pages
fallback survives the troubleshooting window.

L16 (T6 dashboard path blocked, 2026-10-13): the user's screenshot
(`~/Imágenes/screenshot-2026-10-13_00-42-39.png`) shows the rule form filled in exactly as
specified — custom filter expression `(http.host eq "asbit.dev")`, `Tipo: Dinámico`,
`concat("https://asbit.me", http.request.uri.path)`, `301 - Permanent Redirect`, preserve query
string on — yet saving fails with `action is required for action parameters`. Cloudflare's
rulesets API requires a redirect rule to carry both `action: "redirect"` and
`action_parameters` (see Create a redirect rule via API), so the dashboard is building an
incomplete ruleset payload: the defect is in the panel's save path, not in the rule the user
authored. Three ways around it, in order of effort: (1) retry from an incognito window or with
the dashboard language set to English, in case a stale localized bundle is at fault; (2) create
the rules and the `www` record through the Cloudflare API with a scoped token, which skips the
dashboard entirely; (3) fall back to a Page Rule forwarding URL on `asbit.dev/*`
(`https://asbit.me/$1`, 301) or account-level Bulk Redirects.

L17 (T6 token gap, 2026-10-13): the minted token authenticates but carries only zone read.
Probed against the live API: `GET /zones` → 200, `GET /zones/{id}` → 200,
`GET /zones/{id}/rulesets` (metadata list) → 200, while `GET /zones/{id}/dns_records` → 403
`Authentication error`, `GET /zones/{id}/rulesets/{id}` → 403 `request is not authorized`, and
`GET /zones/{id}/settings/email_obfuscation` → 403 `Authentication error`. Note that
`GET /user/tokens/verify` answers 401 `Invalid API Token` for this `cfat_` token format, so a
token must be probed with real endpoints rather than trusted on that call. Writes need
`Zone → DNS: Edit`, `Zone → Config → Rules: Edit` and `Zone → Zone Settings: Edit`, scoped to both
`asbit.me` (`fde5bf5b8937295e9a097108924cdcda`) and `asbit.dev`
(`813763f2bb2cc0701cbaf2934b131325`).

L18 (consequence, 2026-10-13): neither zone holds a single redirect rule today — the
`http_request_dynamic_redirect` rulesets exist but are empty (`asbit.dev`
`bc1885148edf40efa201dc54ca28dc39` v4, `asbit.me` `9b1ff0c9444749509cc59ea2c459f317` v3). The
dashboard never persisted anything, not even the `www` rule, which matches the
`action is required for action parameters` failure. Rules must be added to those existing
rulesets rather than creating new ones.

L19 (T6 still blocked, 2026-10-13): after the user reported editing the token permissions
("edite los permisos del token, no estan como dices, pero habilite todos los relacionados"), a
re-probe with the same stored token still returns 403 on all four endpoints. Two rounds 30 s
apart (01:07:28 and 01:07:59) give identical results, so this is not propagation lag. Either the
permission change did not persist (the same class of failure as the redirect-rule save) or it was
applied to a different token — the `cfat_` prefix suggests the newer token format, where a
user-owned token and an account-owned token can both exist. The alternative that avoids the
Cloudflare write path entirely stays on the table: two more tunnel public hostnames
(`www.asbit.me`, `asbit.dev`) plus a 301 in the container's nginx, versioned in this repo and
verifiable over SSH.
