# Requirements

**Core.**

- Marketing site for LUPFR Entertainment: present events, artists, services, gallery media, and partners; capture contact and newsletter signups.
- Content editable without code changes: YAML in `data/` + images in `public/`.
- Contact form and newsletter signup must send email via Resend to a configured inbox; subscriber receives welcome email for newsletter.
- Contact-list signup must collect **name** and at least **one of** email or phone, then forward payloads to a configured Google Sheets webhook (UI surfaces vary; see `docs/API.md`).
- Site must deploy to Vercel; the public build gate is `bun run test`, which uses Bun and runs data generation before `bunx --bun next build --webpack`.

**Constraints.**

- No multi-user account table and no CMS. Public marketing actions remain send-only (Resend) plus the Google Sheets phone-list webhook. An optional **Supabase** project may store operator-facing copies of phone-list contacts and consent-gated first-party telemetry (`page_impression` / `cta_click`) for the `/admin` portal — Sheets stays source of record for leads; Supabase must not replace or break the webhook path.
- A gated **operator shell** at `/admin` (and `admin.lupfr.com`) uses a single shared env credential + signed session cookie — not a CMS and not a user database. It may embed **real** Vercel Web Analytics API series (never invented traffic numbers).
- Resend must be configured (`RESEND_API_KEY`); no silent degradation—API returns explicit error if missing.
- Canonical documentation lives in `docs/` (OVERVIEW, ARCHITECTURE, DESIGN, API, DEPLOYMENT, TESTING, REQUIREMENTS); docs are repo-only and guarded from public route exposure.

**Third-party consent (hard content guardrail).**

- **Will Lupfer's father must not be referenced on the site, and neither must Nike.** Owner relayed the objection directly on 2026-08-08: *"My dad doesn't want him or Nike mentioned."* The AUG 8 restructure design file's founder bio contains exactly this material — a 20-year Nike tenure, Phil Knight as the LUPFR blueprint, and a "Nike had Just Do It" parallel — so any future port of that bio **must drop those passages**, not paraphrase them. This is a named living person's stated refusal of consent, not a copy preference.
- **Will's founder bio is embargoed** until the owner says otherwise (same message: *"Don't put my bio up rn"*). Eliott's bio is unaffected.
- Enforced by `tests/unit/founder-bio-consent.test.ts`, which fails on these terms appearing in shipped copy (`data/`, `components/`, `app/`). Remove the guard only on an explicit owner instruction recorded in `docs/CHANGELOG.md`.

**Non-goals (current scope).**

- No CMS / in-browser YAML or media editing; no mutating `data/*` from the operator UI.
- No OAuth, magic links, SSO, or multi-user admin accounts (session cookie shape may grow later without a rewrite).

**Quality gates.**

- **CI / merge readiness:** `bun run test` — public raster check, ESLint, Vitest with coverage thresholds (`vitest.config.ts`), production build, route/external-link QA, and browser runtime crawl (see `docs/TESTING.md`). Vercel and GitHub Actions use the same command.
- **Faster local gate:** `bun run smoke` omits coverage and browser crawl but keeps the production build and route/external-link QA.
