# Runbook

## First-time setup

Use Bun, matching `package.json` `packageManager`. From the repo root, run `bun install` to install dependencies.

## Local development

Run `bun run dev` for the Next.js development server. Stop the dev server before running production build or full CI commands so `.next/` is not written by two processes at once.

## Content updates

Edit source content in `data/*.yml`, place optimized public assets under `public/`, then run `bun run generate-data`. Public raster assets should be WebP unless they are favicon/logo exceptions documented in `scripts/optimize-public-raster.mjs`.

## Verification

Use `bun run ci` as the full local verification gate. Use `bun run public:images:check` before deployment-focused checks to ensure no non-exempt PNG/JPEG assets remain under `public/`.

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Build or route smoke fails with missing `.next` manifest | Dev server and build wrote `.next/` concurrently | Stop dev, remove stale `.next` if needed, rerun the command |
| Public image check fails | New PNG/JPEG copied under `public/` | Convert the asset to WebP and update YAML paths |
| Contact or newsletter APIs return configuration errors | Missing Resend environment variables | Configure `RESEND_API_KEY` and required deployment secrets |
| Phone list API returns webhook configuration errors | Missing Google Sheets webhook URL | Configure `GOOGLE_SHEETS_WEBHOOK_URL` and optional secret variables |

## Credential rotation

Rotate Resend and Google Sheets webhook credentials in the deployment provider secret store. Do not commit secret values; only document environment variable names in repo docs.
