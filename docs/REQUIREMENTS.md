# Requirements

**Core.**

- Marketing site for LUPFR Entertainment: present events, artists, services, and partners; capture contact and newsletter signups.
- Content editable without code changes: YAML in `data/` + images in `public/`.
- Contact form and newsletter signup must send email via Resend to a configured inbox; subscriber receives welcome email for newsletter.
- Site must deploy to Vercel; build uses Bun and runs `generate-data` before `next build`.

**Constraints.**

- No database; no user accounts. Email is the only persistent “backend” action (send-only).
- Resend must be configured (`RESEND_API_KEY`); no silent degradation—API returns explicit error if missing.
- Canonical documentation lives in `docs/` (OVERVIEW, ARCHITECTURE, DESIGN, API, DEPLOYMENT, TESTING, REQUIREMENTS); docs are repo-only, not served with the site.

**Non-goals (current scope).**

- No CMS or admin UI; no automated tests in repo (see TESTING.md for strategy when tests are added).
