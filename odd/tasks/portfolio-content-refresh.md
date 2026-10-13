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

S8 — Second round, from the user's own PDF résumé at
`~/Descargas/Hoja_de_vida_Andres_Sebastian_Bravo_Palacios.pdf` (extracted with `pdftotext`): its
content may complement the earlier roles and the current one. Verbatim instruction: "verifica en
descargas Hoja_de_vida_Andres_Sebastian_Bravo_Palacios.pdf ahi hay informacion para complementar
los otros cargos, incluye solo cosas relevantes. si consideras que se puede sumar algo adicional a
algunas de ellas hazlo". Only work-relevant material is taken; contact and identity data stays out
of the public page.

S9 — Metric reframing rule, verbatim: "los datos y cifras son muy especificos, no necesitamos
especificar tanto mas bien covniertelo en forma de metricas/porcentajes o las mejoras realizadas,
es decir tiempo ahorrado, procesos ahorrados/optimizado/mejorado etc". Raw internal counts are
replaced by round scale plus measured improvement (percentages, time saved, processes eliminated),
and every percentage must be derivable from a figure already recorded in the evidence sources —
no invented improvements.

S10 — Fill the internal CV's own pending fields, verbatim: "llena los poendientes de cv". The PDF
is the source for the contact/education/certification fields that the CV marks `[COMPLETAR]`.

S11 — Scope note: the CV's per-project sections are its traceable-evidence layer (`Cada cifra
tiene fuente trazable`), so its raw figures stay and the metric framing is added as a human-facing
summary section instead. Flagged to the user rather than assumed.

S12 — Third round sources, verbatim instruction: "revisa en descargas Hoja de vida 2026.pdf y
Páginas desdeHOJA DE VIDA - ANDRES SEBASTIAN BRAVO PALACIOS.pdf para complementar informacion
faltante". The 2026 file is the official Colombian public-sector single résumé form and contains
the exact employment history (employer, role, dependency, start and end date) plus two extra
courses; the second file adds the Xtreme Cyber entrepreneurship, IP Technologies, the
SENA–Telefónica project context, secondary-school distinctions and nine further courses.

S13 — Tone rule, verbatim: "adecua lo necesario para que suene mas tecnico y profesional, mas
moderno y adecuado para el portafolio, por ejemplo cyber extreme coloco como emprendimiento,
soporte a medida para pymes, y las otras experiencias redactalas de mejor forma". Rewrite the
earlier roles as technical, modern achievements instead of task lists; the entrepreneurship is
framed as tailored support for small businesses.

S14 — Repo message rule, verbatim: "sobre los repos la mayoria son proivados porque son
institucionales y debido a un acuerdo de confidencialiada debo dejarlos asi, ajusta un poco el
mensaje sobre os repos y visibilidad haciendo una mencion sutil sobre el esto". The public page
and the CV must mention the confidentiality constraint once, subtly, without excusing the
portfolio.

S15 — References, verbatim: "descarta linkedin, referencias laborales: Edwin Brito Lider TIC
regional cauca, Omar Trejos Dinamizador tic regional cauca, añadelos de forma sutil". LinkedIn is
dropped everywhere; the two references are recorded in the CV, not on the public page, because
publishing third-party names and roles without their consent is not appropriate.

S16 — Known discrepancies found and **not** silently resolved: the older worksheet names
`Universidad del Cauca` (semester 6) where the current résumé and the portfolio say `UNAD`, the
technician title is dated 12/2009 in the official form versus 2010 in the other two sources, and
the official form lists one employer as `Cargando...` (a form artifact). Reported to the user.

## Tasks

| ID | Specs | Route | Commit |
| --- | --- | --- | --- |
| T1 | S1, S2, S6, S7 | Inline (parent) | Trayectoria: title, centre, 7 evidence-backed bullets + hero/facts alignment |
| T2 | S1, S3, S5, S6, S7 | Inline (parent) | Trabajo: 5 new cards + measured impact in the existing ones |
| T3 | S1, S4, S6, S7 | Inline (parent) | Stack: expanded layers + IA split from Automatización (CSS 4 columns) |
| T4 | S3, S7 | Inline (parent) + live check | verify: key parity, script syntax, ES/EN render, deployed bytes |
| T5 | S8, S9, S7 | Inline (parent) | portfolio: earlier-role context from the PDF + metric reframing of every figure |
| T6 | S10, S8 | Inline (parent) | internal CV: fill sections 1, 9 and 12 from the PDF |
| T7 | S9, S10 | Inline (parent) | internal CV: add the human-facing measured-impact summary |
| T8 | S9, S7 | Inline (parent) + live check | verify: parity, renders, deployed bytes |
| T9 | S12, S13, S7 | Inline (parent) | portfolio: full career timeline (7 entries) rewritten technically + entrepreneurship |
| T10 | S12, S14, S15, S7 | Inline (parent) | portfolio + CV: confidentiality note, references, drop LinkedIn, five new courses |
| T11 | S12, S15 | Inline (parent) | internal CV: complete employment history with exact dates per the official form |
| T12 | S7, S13 | Inline (parent) + live check | verify: parity, ES/EN render, deployed bytes |

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

L10 (second round inputs, 2026-10-13): the PDF résumé adds nothing new for R&S Soluciones, adds
context for Pear Solutions ("atención a usuarios en proyecto para el SENA") and confirms the
current role's formal title as "Analista de Sistemas (funciones de Desarrollador de Software e
Infraestructura)" — the title published on the page stays the one the user chose in S2. It is also
the source that resolves the CV's missing fields: full name, phone, portfolio URL, English B1,
role dates per employer (SENA 2024–present, Pear Solutions 2022–2023, R&S Soluciones 2016–2018),
Systems Engineering at UNAD (semester 5), Systems Technician at Politécnico del Sur 2010, and the
ten certifications with year and institution.

L11 (T5, metric reframing): raw internal counts were replaced by round scale plus measured
improvement. Percentages used, all derived from figures already in the evidence sources: browser
robot, ~3 min manual per document versus 13.4 s measured = ~93% less time per document and ~17
working days saved per campaign (133 h over 8 h); enrollment-document validation, 150–200 cases
per day handled automatically; platform migration, 100% of profiles and storage objects restored
with all backup checksums verified; paper elimination in the attendance process, both forms gone
(100%); SIRS container image reduced from ~180 MB to ~50 MB (~72% lighter); audit remediation,
81% of findings closed with evidence. Scale statements keep round figures (about 12,000
apprentices, around 1,000 devices, more than five million public contracts) and drop the exact
counts (12,032 profiles, 20,134 objects, 47,202 apprentices, 984 devices, 2,870 documents, 467
tests, 25 tables).

L12 (T6, T7): the internal CV's section 1 contact fields, section 9 education and certifications
and the section 12 checklist were completed from the PDF, and a new human-facing section records
the measured impact in percentages and time saved. Its per-project evidence tables were left
intact on purpose (S11) because that document's stated contract is that every figure is traceable;
the user was told and can ask for the same softening there.

L13 (third round, 2026-10-13): the official form supplies the exact history used to rebuild the
timeline — SENA analyst from 27/01/2025, SENA on-site support 15/04/2024–31/12/2024, Global Talent
GT 17/01/2024–31/03/2024, Pear Solutions 22/10/2022–31/12/2023, R&S Soluciones
07/07/2016–12/02/2018 — plus a 2015–2016 role and older ones (INGENIERÍA DE SUMINISTROS RYR
2011–2012, Yobana Sport 2014–2015, IP Technologies 12 months). The published page keeps seven
entries: the two SENA stages now read as a progression (support 2024 → analyst 2025–present),
Global Talent fills 2024, Pear Solutions carries the SENA–Telefónica project, Xtreme Cyber enters
as the entrepreneurship with tailored support for small businesses, R&S Soluciones is rewritten,
and the earliest roles are consolidated into one 2011–2016 line because the official form lists
one employer as `Cargando...` (an artifact) and IP Technologies was logistics-heavy.

L14 (T10): five courses added from the two PDFs (Cisco Networking 2024, computer installation and
repair 2022, TensorFlow for AI/ML/DL 2021, Innovation Lab at Universidad Nacional 2021, Machine
Learning with R 2020), bringing the published list to fifteen. The confidentiality constraint is
mentioned once, subtly, in the GitHub line and in the CV's visibility section. LinkedIn is removed
from the CV, and the two references (Edwin Brito, Líder TIC Regional Cauca; Omar Trejos,
Dinamizador TIC Regional Cauca) are recorded there rather than on the public page.
