Objective: apply the audited portfolio improvements with truthful content, accessible interactions, efficient motion and complete social metadata.
Branch: `feat/portfolio-improvements`; delivery: `feature-branch-chain`; forecast: ~380 authored changed lines; runners: `pnpm build`, `pnpm i18n-check`, Puppeteer quality checks.

## Specs

S1. "procede a aplicar las mejoras, corregir incidencias y despues me recueras los extras"
- Apply the previously audited priorities: surface verifiable project evidence earlier, add useful primary actions, correct modal focus and landmarks, pause unnecessary animation work, improve social/search metadata and touch targets.
- Use only facts already present in the repository; do not invent project URLs, testimonials, outcomes or a CV asset.
- Finish by recalling extras that still need user-provided material.
- Checks: production build, bilingual parity, keyboard browser checks, responsive layouts at 320/390/768/1440px, metadata/static-file checks and no browser runtime errors.

## Tasks

T1 | S1 | parent | done | GREEN: `pnpm build`; i18n 190/190; `git diff --check`. Moved Work before Experience, featured PGAA/OnBase/Secopia with context/solution/impact, retained 11-project native archive and added Hero project/contact CTAs.
T2 | S1 | gentle-ai-worker | done | GREEN: native dialog keyboard/focus/light-dismiss checks; build and i18n 191/191; 320/390/768 responsive checks; `git diff --check`. Added main landmark, bilingual skip link and coarse-pointer targets.
T3 | S1 | parent | done | RED 13 hidden-tab frames/400ms → GREEN 0; build and i18n 191/191; no browser errors. Added visibility-driven scheduling, hidden-tab cancellation, no reduced-motion loop and batched kinetic-letter layout reads.
T4 | S1 | parent | done | GREEN: PNG dimensions 1200x630/180x180; built OG/Twitter/JSON-LD/robots/sitemap/assets assertions; build and i18n 191/191. Added reproducible SVG sources and static social/search metadata.
T5 | S1 | parent | done | GREEN: `pnpm quality-check` full pass; `pnpm interaction-check` identical (focus containment FIX); `pnpm animation-check` identical animated state vs `main`; light/dark desktop+mobile screenshots inspected; detector clean; build and i18n 191/191. Added the permanent quality gate and fixed the motion-scheduling regression it caught.

## Log

L1. "procede a aplicar las mejoras, corregir incidencias y despues me recueras los extras"
- Prior audit evidence is stored in project memory `portfolio-audit-priorities`; implementation reuses its verified findings.
- Modern Web Guidance consulted for `dialog`, `accessibility`, `efficient-background-processing`, and `performance` before source edits.
- T1 GREEN: production build passed; bilingual parity 190/190; diff whitespace check passed.
- T1 commit `6e502ee`; native ASSESS: medium risk, `reviewDue=false`, reason `under_budget`; no independent verifier required.
- Context backstop routed T2 to one bounded worker; parent retains integration and verification.
- T2 worker ASSESS was unavailable for the uncommitted candidate because pre-existing untracked `skills/` requires explicit declaration; writer-self-verification plan remained applicable. Committed-range ASSESS follows the work-unit commit.
- T2 GREEN: repeated Tab/Shift+Tab never reached page controls; Escape, `/`, Ctrl+K, arrows, Enter, pointer selection and light dismiss passed; build, i18n 191/191, responsive and whitespace checks passed. Safari fallback not executed in WebKit.
- T2 commit `08aaa8e`; cumulative committed ASSESS: medium risk, `reviewDue=false`, `under_budget`, 277 authored lines.
- T3 RED: 13 animation frames in 400ms after simulated `document.hidden`; GREEN: 0 frames, no runtime errors, build and i18n passed.
- T3 commit `5a75d68`; cumulative committed ASSESS: medium risk, `reviewDue=false`, `under_budget`, 350 authored lines.
- User selected `feature-branch-chain` from the oversized-delivery menu before the T4 commit. Planned slices: PR1 content `6e502ee`; PR2 accessibility+performance `08aaa8e` + `5a75d68`; PR3 SEO+final quality commits. Tracker stays draft/no-merge if PRs are later requested; no publishing authorized here.
- T4 GREEN: social PNG visually inspected; metadata, JSON-LD, robots, sitemap and copied assets asserted in `dist`; build and i18n passed.
- T4 commit `1adb9c1`; cumulative committed ASSESS: medium risk, `reviewDue=false`, `under_budget`, 426 authored lines.
- T5 regression caught by the new gate: the motion scheduler never rescheduled (`rafId` stayed set after the first frame), so kinetic letters never started; the earlier hidden-tab GREEN was a false pass. Fixed in `a1bb610` (reset `rafId` in `frame`, unify kinetic start with the visibility observer); hardened the gate to require visible animation before testing the hidden pause. Isolated-page motion checks and `networkidle0`→`domcontentloaded` navigation made the gate deterministic.
- T5 GREEN: `pnpm quality-check` passed end to end (visible frames 3, hidden 0, reduced-motion 0, viewports 320/390/768/1440, no runtime errors); `pnpm interaction-check` vs `main` identical with `paletteFocusContained` FIX; `pnpm animation-check` vs `main` identical in all six value groups; Impeccable detector clean; visual inspection of light/dark desktop+mobile crops found no composition defects.
- T5 commits: fix `a1bb610`, gate `3ca2e10`. Final cumulative ASSESS: medium risk, `reviewDue=false`, `under_budget`, 684 authored lines. Merge and deployment remain the user's decisions.
- Slice boundaries for delivery: PR1 content = `6e502ee`; PR2 accessibility+motion = `08aaa8e`+`5a75d68`+`a1bb610`; PR3 SEO+quality gate = `1adb9c1`+`3ca2e10`+docs. Tracker branch `feat/portfolio-improvements` (draft, no-merge).
