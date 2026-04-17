# LUPFR

San Francisco's premier music event production company. Creating unforgettable experiences in the Bay and beyond.

## Setup

This project uses **Bun** for install, scripts, and lint. Vercel is configured to use Bun for install and build.

1. Install dependencies: `bun install`
2. Copy environment: `cp .env.example .env.local`
3. Add your [Resend](https://resend.com) API key to `.env.local`:
   - `RESEND_API_KEY=re_xxxxxxxxx` (get a key at https://resend.com/api-keys)
   - Required for the contact form and newsletter signup to send email to `will@lupfr.com`
4. Run dev: `bun run dev`

## Resend

Contact form submissions and newsletter signups are sent via [Resend](https://resend.com). Without `RESEND_API_KEY` in `.env.local`, those endpoints return an error asking you to add the key. Verify your `lupfr.com` domain in Resend and use a key with send permission.

## Content and images (data-driven UI)

Site content (events, artists, services, corporate partners) lives in **`data/`** as YAML files. Images live in **`public/`** (e.g. `public/artists/`, `public/events/`, `public/corporate_partners/`). To add or edit content without touching code:

1. **Add or replace images** in the right `public/` subfolder (e.g. `public/artists/`, `public/events/`, `public/past_events/`, `public/corporate_partners/`).
2. **Edit the matching YAML** in `data/` (e.g. `data/artists.yml`, `data/events.yml`, `data/services.yml`, `data/partners.yml`). Use paths from the site root, e.g. `image: "/artists/yourfile.jpg"` (no `public/` in the path).
3. **Rebuild**: `bun run build` runs `generate-data` first, which turns YAML into JSON under `lib/data/generated/` so the app can use the new content.

See comments at the top of each `data/*.yml` file for field descriptions. Non-technical editors can add images and update YAML; no component code changes are required.

## Build & Lint

- `bun run dev` – development server
- `bun run build` – runs `generate-data` then production build
- `bun run start` – run production server
- `bun run lint` – run ESLint
- `bun run verify` – lint, build, then route smoke (`scripts/verify-routes.sh`); matches GitHub Actions CI
- `bun run precommit` – same as `verify`; this sequence also runs automatically before each commit after `bun install` (git hook from `scripts/pre-commit`)

## Vercel (production deploys)

The site is deployed on Vercel. Pushes to `main` normally trigger an automatic deployment.

Preview-first + tagged production flow (CLI):

- `bun run vercel:env:check` – confirm required Vercel secrets exist in preview and production.
- `bun run vercel:preview` – run CI and deploy a preview build.
- Validate forms/signups on preview.
- Create and push a release tag (`vX.Y.Z`).
- Check out that tag and run `bun run vercel:prod:from-tag`.

**If a push didn’t trigger a deploy:**

1. **Git integration** – [Vercel → Account → Authentication](https://vercel.com/account/authentication): ensure your GitHub (or Git) login is connected and has access to this repo.
2. **Repo permissions** – If you only granted access to certain repos, add `lupferentertainment-cmd/Lupfr` (or this repo) to the allowed list in GitHub’s Vercel app settings.
3. **Commit author** – The commit author email must match the email of the Git account linked to Vercel. Check with `git log -1` and fix with `git config user.email "your@email.com"` if needed.
4. **Private repo + team** – For a team project, the commit author must be a member of the Vercel team (or owner for Hobby).

**Redeploy now (without pushing again):**

- In [Vercel Dashboard](https://vercel.com/dashboard) open the project → **Deployments** → open the latest deployment → **⋯** → **Redeploy** (use “Use existing Build Cache” or not).
- Or create a **Deploy Hook**: Project **Settings** → **Git** → **Deploy Hooks** → add a hook, then call that URL (e.g. `curl -X POST "https://api.vercel.com/v1/integrations/deploy/…"`) to trigger a new deployment.
