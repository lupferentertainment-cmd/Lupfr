# Runbook

## First-time setup

Use Bun, matching `package.json` `packageManager`. From the repo root, run `bun install` to install dependencies.

## Local development

Run `bun run dev` for the Next.js development server. Startup runs `scripts/prepare-dev-cache.mjs`, which removes an incomplete `.next/dev` cache when `routes-manifest.json` is missing so Next can rebuild it cleanly.

## Content updates

Edit source content in `data/*.yml`, place optimized public assets under `public/`, then run `bun run generate-data`. Public raster assets should be WebP unless they are favicon/logo exceptions documented in `scripts/optimize-public-raster.mjs`.

## Verification

Use `bun run ci` as the full local verification gate. It builds under an isolated `.next-ci/<run>` directory so it does not delete `.next/dev`, and it refuses to start the production build while `next dev` is active. Use `bun run public:images:check` before deployment-focused checks to ensure no non-exempt PNG/JPEG assets remain under `public/`.

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Dev shows `ENOENT` for `.next/dev/routes-manifest.json` | Dev cache was interrupted or deleted by an older build command | Restart `bun run dev`; startup removes incomplete `.next/dev` automatically |
| `bun run build`, `bun run ci`, or `bun run verify` refuses to build | A `next dev` process for this repo is active | Stop dev before running production build or full verification |
| Build hangs at `Creating an optimized production build ...` | Another dev/build process is active or remote font optimization is waiting on network | Stop competing Next/Bun processes, remove `.next`, and keep fonts in `app/globals.css` rather than `next/font/google` |
| Browser console shows stale chunk or incomplete chunked encoding errors | Dev server was interrupted or `.next/` contains stale output | Stop dev, remove stale `.next`, then restart `bun run dev` |
| Browser console requests `/layout.css` | Legacy browser/cache/client requested an old stylesheet URL | Keep `public/layout.css` present as a no-op stylesheet; route smoke verifies it returns `text/css` |
| Public image check fails | New PNG/JPEG copied under `public/` | Convert the asset to WebP and update YAML paths |
| Contact or newsletter APIs return configuration errors | Missing Resend environment variables | Configure `RESEND_API_KEY` and required deployment secrets |
| Phone list API returns webhook configuration errors | Missing Google Sheets webhook URL | Configure `GOOGLE_SHEETS_WEBHOOK_URL` and optional secret variables |

## Credential rotation

Rotate Resend and Google Sheets webhook credentials in the deployment provider secret store. Do not commit secret values; only document environment variable names in repo docs.
