# Deployment

**Platform.** Vercel. Pushes to `main` trigger automatic deployment. Build command uses Bun: install and build run with Bun; `build` script is `bun run generate-data && next build`.

**Environment.**

- **Required:** `RESEND_API_KEY` – Resend API key with send permission. Without it, contact and newsletter API routes return 500.
- **Optional:** `RESEND_TO_EMAIL` – Override recipient for contact and newsletter (default: `entertainment@lupfr.com`).

Set in Vercel: Project → Settings → Environment Variables. No other runtime secrets.

**Build.** `generate-data` reads `data/*.yml` and writes `lib/data/generated/*.json`; then Next.js build runs. Ensure all required YAML files exist in `data/` (events, artists, services, partners) so generated JSON is present.

**Troubleshooting (from README).** If deploy does not trigger: check Git integration and repo access in Vercel; ensure commit author email matches linked Git account; for teams, author must be in Vercel team. Redeploy from dashboard (Deployments → Redeploy) or use a Deploy Hook.

**Docs.** `docs/` is for the repo only; it is not deployed or served as part of the site.
