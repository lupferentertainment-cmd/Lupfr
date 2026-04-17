# Deployment

**Platform.** Vercel. Pushes to `main` trigger automatic deployment. Build command uses Bun: install and build run with Bun; `build` script is `bun run generate-data && next build`.

**Environment.**

- **Required:** `RESEND_API_KEY` – Resend API key with send permission. Without it, contact and newsletter API routes return 500.
- **Required:** `GOOGLE_SHEETS_WEBHOOK_URL` – Google Apps Script web app URL that accepts JSON POST and appends a row in your sheet. Without it, `/api/phone-list` returns 500.
- **Optional:** `RESEND_TO_EMAIL` – Override recipient for **newsletter internal notifications** only (default: `will@lupfr.com`). Contact form submissions always go to `will@lupfr.com` via `CONTACT_FORM_TO_EMAIL`.

Set in Vercel: Project → Settings → Environment Variables. No other runtime secrets.

Verify required vars in Vercel with:

1. `bun run vercel:env:check`

If missing, add each variable interactively:

1. `vercel env add GOOGLE_SHEETS_WEBHOOK_URL preview`
2. `vercel env add GOOGLE_SHEETS_WEBHOOK_URL production`
3. `vercel env add RESEND_API_KEY preview`
4. `vercel env add RESEND_API_KEY production`

**Preview-first flow (CLI).**

1. `vercel link`
2. `bun run vercel:preview`
3. Validate signup flow on preview URL.
4. Tag release candidate commit: `git tag vX.Y.Z && git push origin vX.Y.Z`
5. Checkout the tag to deploy exactly tagged source: `git checkout vX.Y.Z`
6. `bun run vercel:prod:from-tag`
7. Return to your branch (for example): `git checkout main`

If preview or production returns `Google Sheets webhook rejected the request.`, validate the Google Apps Script deployment access is set to allow unauthenticated web app POST calls ("Anyone") and confirm the current deployment URL is authorized by your script policy.

**Build.** `generate-data` reads `data/*.yml` and writes `lib/data/generated/*.json`; then Next.js build runs. Ensure all required YAML files exist in `data/` (events, artists, services, partners) so generated JSON is present.

**CI (GitHub Actions).** On every push and pull request, `.github/workflows/ci.yml` runs `bun run lint`, `bun run build`, and `bash scripts/verify-routes.sh`. The route script starts `next start` locally after build and asserts `/`, every `/events/[slug]` from generated data, and a synthetic missing path (expects HTTP 404). This mirrors the production static output Vercel serves after the same build command.

**Troubleshooting (from README).** If deploy does not trigger: check Git integration and repo access in Vercel; ensure commit author email matches linked Git account; for teams, author must be in Vercel team. Redeploy from dashboard (Deployments → Redeploy) or use a Deploy Hook.

**Docs.** `docs/` is for the repo only; it is not deployed or served as part of the site.
