# Runbook

## First-time setup

Use Bun, matching `package.json` `packageManager`. From the repo root, run `bun install` to install dependencies.

## Local development

Run `bun run dev` for the Next.js development server. Startup runs `scripts/prepare-dev-cache.mjs`, which removes an incomplete `.next/dev` cache when `routes-manifest.json` is missing so Next can rebuild it cleanly.

For daily development, run the dev server in a foreground terminal session only (never with `&`, `nohup`, or detached process tools). If port `3000` is occupied, stop the existing listener first, then start `bun run dev` again so `http://localhost:3000` is owned by one active foreground session.

## Content updates

Edit source content in `data/*.yml` and place optimized public assets under `public/`. `bun run test` regenerates data and fails if public raster assets are not WebP, unless they are favicon/logo exceptions documented in `scripts/optimize-public-raster.mjs`.

## Gallery media via Google Drive (no-code, no-deploy)

The `/gallery` page renders live "Event albums" straight from the **public** Google Drive folder `LUPFR GALLERY/website/` (see `lib/drive-gallery.ts`). A non-technical operator updates the website gallery entirely from Drive:

1. Open `LUPFR GALLERY/website/` in Google Drive.
2. Drop photos (`.jpg/.jpeg/.png/.webp/.gif/.heic/.avif`) and/or videos (`.mp4/.mov/.webm/.m4v`) into the matching event subfolder (e.g. `boiler_boat_003/`, `third_thursdays/`). A nested subfolder one level down (e.g. `PHOTOS/`) also works; other file types are ignored.
3. To add a whole new event album, create a new subfolder under `website/` — it renders automatically with a humanized title. For the heading to use the official event title, an engineer later adds one row to `DRIVE_FOLDER_TO_ALBUM_FOLDER` in `lib/drive-gallery.ts` (cosmetic only).
4. Wait up to **1 hour** (ISR revalidation) and refresh `https://lupfr.com/gallery`. No commit, build, or deploy is needed.

**Invariants:** the `website/` folder (and everything inside) must stay shared as **"Anyone with the link — Viewer"**; removing public access hides the section (the site logs the failure and falls back to the committed grid — it never breaks the page). Deleting or renaming files/folders in Drive is also inherited within the hour.

## Documentation discipline

Update the relevant canonical spec in `docs/` before committing any behavior, deployment, testing, content, or public-surface change. Use `docs/RUNBOOK.md` for operator workflow changes, `docs/DEPLOYMENT.md` for Vercel/staging/production changes, `docs/TESTING.md` for verification pipeline changes, `docs/API.md` for public routes/env/schema changes, `docs/ARCHITECTURE.md` for app structure changes, and `docs/CHANGELOG.md` for every user-visible or workflow change under `[Unreleased]`.

## AI-assisted content updates

When Claude Code (or any AI agent) performs a content update (new events, poster swaps, asset additions):

1. **Assets** — convert source PNG/JPEG to WebP (`cwebp -q 85`) and place under `public/events/` or the relevant `public/` subfolder.
2. **Data** — edit `data/events.yml` (or the relevant `data/*.yml`). Increment `id`; keep `dateISO` in `YYYY-MM-DD`; keep `image` paths as `/events/<file>.webp`.
3. **Verify** — run `bun run test`. All route checks and browser console crawl must pass.
4. **Document** — add a `### Added (Content — YYYY-MM-DD)` entry in `docs/CHANGELOG.md` noting the AI tool used.
5. **Stage** — run `bun run ship:dev` to push to the `dev` branch for Vercel Preview review.
6. **Promote** — after stakeholder sign-off on Preview, run `bun run promote:prod` to fast-forward `main`.

## Verification

Use `bun run test` as the single full verification gate before shipping or promoting. It builds under an isolated `.next-ci/<run>` directory so it does not delete `.next/dev`, and it refuses to start the production build while `next dev` is active. The pre-commit hook, GitHub Actions, and Vercel all run this same command. Use `bun run smoke` only for faster local smoke checks; focused gallery checks remain inside the full Vitest coverage run.

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Dev shows `ENOENT` for `.next/dev/routes-manifest.json` | Dev cache was interrupted or deleted by an older build command | Restart `bun run dev`; startup removes incomplete `.next/dev` automatically |
| `bun run test`, `bun run smoke`, or `bun run start` refuses to build | A `next dev` process for this repo is active | Stop dev before running production build or full verification |
| Build hangs at `Creating an optimized production build ...` | Another dev/build process is active or remote font optimization is waiting on network | Stop competing Next/Bun processes, remove `.next`, and keep fonts in `app/globals.css` rather than `next/font/google` |
| Browser console shows stale chunk or incomplete chunked encoding errors | Dev server was interrupted or `.next/` contains stale output | Stop dev, remove stale `.next`, then restart `bun run dev` |
| Browser console requests `/layout.css` | Legacy browser/cache/client requested an old stylesheet URL | Keep `public/layout.css` present as a no-op stylesheet; route smoke verifies it returns `text/css` |
| Lighthouse SEO says `x-robots-tag: noindex` on a `*.vercel.app` preview | Vercel Deployment Protection answered the request with `401` before the app ran | Audit `https://lupfr.com` after promotion, or use a Vercel Shareable Link / `x-vercel-protection-bypass` automation secret for staging checks |
| Public image check fails | New PNG/JPEG copied under `public/` | Convert the asset to WebP and update YAML paths |
| Contact or newsletter APIs return configuration errors | Missing Resend environment variables | Configure `RESEND_API_KEY` and required deployment secrets |
| Phone list API returns webhook configuration errors | Missing Google Sheets webhook URL | Configure `GOOGLE_SHEETS_WEBHOOK_URL` and optional secret variables |

## Credential rotation

Rotate Resend and Google Sheets webhook credentials in the deployment provider secret store. Do not commit secret values; only document environment variable names in repo docs.

**Admin portal.** When rotating `ADMIN_PASSWORD`, also rotate `ADMIN_SESSION_SECRET` (≥32 random bytes) in the same change and redeploy Preview then production. Rotating the session secret immediately invalidates existing `lupfr_admin_session` cookies (operators must log in again). Login rate limiting (`admin-login`, 5/15min/IP) is in-memory and **best-effort on Vercel** (per isolate).
