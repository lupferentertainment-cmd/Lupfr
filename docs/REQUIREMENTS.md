# Requirements

**Core.**

- Marketing site for LUPFR Entertainment: present events, artists, services, gallery media, and partners; capture contact and newsletter signups.
- Content editable without code changes: YAML in `data/` + images in `public/`.
- Contact form and newsletter signup must send email via Resend to a configured inbox; subscriber receives welcome email for newsletter.
- Contact-list signup must collect **name** and at least **one of** email or phone, then forward payloads to a configured Google Sheets webhook (UI surfaces vary; see `docs/API.md`).
- Site must deploy to Vercel; build uses Bun and runs `generate-data` before `bunx --bun next build --webpack`.

**Constraints.**

- No database; no user accounts. Email is the only persistent “backend” action (send-only).
- Resend must be configured (`RESEND_API_KEY`); no silent degradation—API returns explicit error if missing.
- Canonical documentation lives in `docs/` (OVERVIEW, ARCHITECTURE, DESIGN, API, DEPLOYMENT, TESTING, REQUIREMENTS); docs are repo-only and guarded from public route exposure.

**Non-goals (current scope).**

- No CMS or admin UI.

**Quality gates.**

- **CI / merge readiness:** `bun run ci` — ESLint, Vitest with coverage thresholds (`vitest.config.ts`), production build, and `verify:routes` (see `docs/TESTING.md`). Vercel and GitHub Actions use the same `ci:vercel` / `ci` path as documented there.
- **Faster local gate:** `bun run verify` omits coverage; pre-commit runs a smaller test subset plus `verify`.
