# Requirements

**Core.**

- Marketing site for LUPFR Entertainment: present events, artists, services, gallery media, and partners; capture contact and newsletter signups.
- Content editable without code changes: YAML in `data/` + images in `public/`.
- Contact form and newsletter signup must send email via Resend to a configured inbox; subscriber receives welcome email for newsletter.
- Contact-list signup must collect **name** and at least **one of** email or phone, then forward payloads to a configured Google Sheets webhook (UI surfaces vary; see `docs/API.md`).
- Site must deploy to Vercel; the public build gate is `bun run test`, which uses Bun and runs data generation before `bunx --bun next build --webpack`.

**Constraints.**

- No database; no multi-user account table. Email is the only persistent public “backend” action (send-only). A gated **operator shell** at `/admin` (and `admin.lupfr.com`) may use a single shared env credential + signed session cookie — not a CMS and not a user database.
- Resend must be configured (`RESEND_API_KEY`); no silent degradation—API returns explicit error if missing.
- Canonical documentation lives in `docs/` (OVERVIEW, ARCHITECTURE, DESIGN, API, DEPLOYMENT, TESTING, REQUIREMENTS); docs are repo-only and guarded from public route exposure.

**Non-goals (current scope).**

- No CMS / in-browser YAML or media editing; no mutating `data/*` from the operator UI.
- No OAuth, magic links, SSO, or multi-user admin accounts (session cookie shape may grow later without a rewrite).

**Quality gates.**

- **CI / merge readiness:** `bun run test` — public raster check, ESLint, Vitest with coverage thresholds (`vitest.config.ts`), production build, route/external-link QA, and browser runtime crawl (see `docs/TESTING.md`). Vercel and GitHub Actions use the same command.
- **Faster local gate:** `bun run smoke` omits coverage and browser crawl but keeps the production build and route/external-link QA.
