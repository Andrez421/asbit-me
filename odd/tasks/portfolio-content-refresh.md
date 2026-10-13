# Feature: portfolio content refresh — career, AI/automation and projects

Goal: give the portfolio's **Trayectoria** section the substance it is missing and complete the
sections that touch the same work (Trabajo, Stack, hero), using only evidence that exists in the
user's own material — no invented dates, titles, responsibilities or metrics.

Sources reviewed (all read before writing a single line of content):

| Source | What it contributes |
| --- | --- |
| `/home/ofcsisdev/Proyectos/tools/hoja-de-vida-developer.md` (477 lines) | Measured figures per project, infrastructure topology, practices, consolidated metrics. Its own section 12 lists "fechas exactas de vinculación laboral" and "formación académica" as still missing — so those stay untouched here. |
| `github.com/Andrez421/n8n` | Four n8n workflows plus their documentation: enrollment-document validation at 150–200 cases/day, the "AI Exam Answer" agent (Drive → OCR → LLM over MCP → Gmail/Telegram) and white-background validation. |
| Local repos under `~/Proyectos` | SIREA, SIRS, CMDB, pgaa, robot_onbase, GCly, sena-chart-studio, registro_asistencia. |
| Old portfolio (`Andrez421.github.io/index.html`) | Cross-check of the earlier profile claims. |
| Engram memories | Only this migration's observations; **no career data**, which is why the CV file is the authoritative source. |

## Specs

S1 — The request, verbatim: "vale ahora ayudame a actualizar un poco el contenido sobre todo en
cuanto a trayectoria como Analista de Sistemas, falta mas informacion ahi, para esto revisa los
proyectos, memorias engram y cualquier otra informacion adicioanl para compeltar esta seccion y
otras relacioandas que s epuedan complementar un poco. por ejemplo, trabajo mucho con IA, llm,
google cloud, n8n, entre otras cosas y en cada apartado hay diferntes temas. entonces ayudame a
complementar y actualizar donde corresponda"

S2 — Current role title (decision, verbatim): "Analista de Sistemas y Desarrollador Full Stack".
Spanish: `Analista de Sistemas y Desarrollador Full Stack`; English: `Systems Analyst and Full
Stack Developer`.

S3 — Publication rule (decision, verbatim): "Sí, impacto sí y vulnerabilidades no (recomendado)" —
impact and scale figures may be published (apprentices, devices, documents, hours saved, tests);
vulnerability counts and vulnerability types from institutional audits may **not**.

S4 — Placement (decision, verbatim): "Integrado en las secciones actuales (recomendado)" —
Trayectoria gains AI/automation bullets, Trabajo gains an n8n automation card, Stack gains the
AI/LLM/Google Cloud/n8n entries.

S5 — Projects to add (decision, verbatim): "Los 5 que faltan (recomendado)" — SIREA, SIRS, SENA
Chart Studio, GCly Mobile (Android) and Automatizaciones n8n.

S6 — Evidence rule: every added figure or claim must trace to a listed source. Unknown facts
(employment dates, references, certifications not present in the portfolio) are **not** invented;
anything still missing is reported back as a question instead.

S7 — The page is bilingual by construction: Spanish lives in the HTML element text, English lives
in the `EN` dictionary keyed by `data-i18n`. Every new or changed string needs both, and the parity
check must pass (every `data-i18n` key present in `EN`).

## Tasks

| ID | Specs | Route | Commit |
| --- | --- | --- | --- |
| T1 | S1, S2, S6, S7 | Inline (parent) | Trayectoria: title, centre, 7 evidence-backed bullets + hero/facts alignment |
| T2 | S1, S3, S5, S6, S7 | Inline (parent) | Trabajo: 5 new cards + measured impact in the existing ones |
| T3 | S1, S4, S6, S7 | Inline (parent) | Stack: expanded layers + IA split from Automatización (CSS 4 columns) |
| T4 | S3, S7 | Inline (parent) + live check | verify: key parity, script syntax, ES/EN render, deployed bytes |

## Log

L1 (user request, verbatim): see S1.

L2 (decisions, verbatim): "Analista de Sistemas y Desarrollador Full Stack"; "Sí, impacto sí y
vulnerabilidades no (recomendado)"; "Integrado en las secciones actuales (recomendado)"; "Los 5
que faltan (recomendado)".

L3 (evidence, 2026-10-13): the CV file's measured figures used here — PGAA ~12,000 apprentices,
62 programs, 25 tables with RLS, RCA/RBAC 7 roles; full platform migration 12,032 profiles and
20,134 storage objects with a 19/19 SHA-256 verified backup; robot OnBase 2,870 documents at 100%
in 52 runs ≈ 133 hours saved; CMDB 984 devices across 3 sites; Chart Studio 47,202 apprentices in
the PE-04 dataset and 28 charts; ~4,000 automated tests across projects; 15 ADRs; 5 hosts; ~70
audit findings (**deliberately not published**, per S3). n8n: 150–200 cases/day and the MCP agent
come from the repository's own `Informe.md` and `README.md`.

L4 (T1): role title updated in the hero line, the facts box and the experience entry; the
organisation line gained the centre (Centro de Comercio y Servicios) from the CV; the four generic
bullets became seven that name the platforms, the AI validation pipeline, the n8n and Playwright
automation with their measured impact, the five-server infrastructure, the storage migration, the
security-by-design practice (no vulnerability counts) and quality plus mentoring.

L5 (T2): added SIREA, SIRS, SENA Chart Studio, GCly Mobile and Automatizaciones n8n; measured
figures added to PGAA, robot OnBase, CMDB, Registro de Asistencia and Secopia descriptions.

L6 (T3): the AI column was split into `IA` (Gemini / Vertex AI, LLM, MCP, OCR, Vercel AI SDK,
Document AI) and `Automatización` (n8n, Playwright, Google Apps Script, Google Workspace); the
four base layers gained Astro, Android/Kotlin, Go, SQLAlchemy, Supabase self-hosted, Typesense,
OpenTelemetry and OpenObserve; `.cols+.cols` now renders four columns.

L7 (T4, closed): checks actually observed — 47 `data-i18n` keys with **0** missing from the
English dictionary and **0** unused entries; the inline script passes `node --check`; 14 project
objects with valid shape and no `{es}` literal without its `{en}` pair; headless Chromium renders
both branches (Spanish, and English forced through the same code path the EN button uses) with 7
bullets, 14 cards, the `IA` / `Automatización` columns and zero `undefined` in the DOM; the
Trayectoria, Trabajo and Stack sections were captured and reviewed as images. Live check after
deploy: `https://asbit.me` serves body sha256 `9c012c44…21de9`, identical to the local
`index.html`, with the new strings present in the served HTML.

L8 (correction, 2026-10-13): I first concluded that auto-deploy had broken, because the live site
kept serving the older bytes and the newest deployment row still named an old commit. That
conclusion was wrong and the fault was mine: six commits (`bbfcdd3`, `ae805c0`, `03415c8`,
`ef05715`, `9d0b253`, `121201d`) had been committed **without pushing** — my commit command
dropped the `git push` I had been appending before. Auto-deploy was healthy the whole time: a
deployment row exists for every commit that was actually pushed (`c4666ab` 05:01, `85c54ad`
05:08, `a3ad730` 05:24), and `git ls-remote` from Dokploy's own clone returned `a3ad730`, exactly
the pushed head. Pushing the six commits produced deployment 08:44 (`done`) on its own. Practical
rule for the rest of this work: push in the same command as the commit, or check
`git log origin/main..HEAD` before blaming the deploy. Note also that Dokploy stores a GitHub App
installation token inside its clone's `origin` URL (root-readable, valid about an hour), which is
why a raw `git remote -v` on the host prints a credential.

L9 (one content judgement to confirm): the `Secopia` card described "sensitive data workflows with
encryption and secure backups", which contradicts the project's own record — the CV describes it
as the open-source **public procurement search** over SECOP I and II (5M+ contracts, Typesense
index of ~1.9M documents, MCP server), the live infrastructure on the host runs
`secopia-search` with Typesense and Redis, and the domain is `secop-ia.app`. The card was updated
to the search-engine description on that evidence and its stack corrected from `Python, Go, Docker`
to `Next.js, TypeScript, Typesense, Redis, Docker`. Flagged here for the user to confirm or revert.
