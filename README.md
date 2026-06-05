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

Site content (events, gallery, artists, services, corporate partners) lives in **`data/`** as YAML files. Images live in **`public/`** (e.g. `public/artists/`, `public/events/` for event card heroes, `public/gallery/` for the home photo carousel, `public/corporate_partners/`). To add or edit content without touching code:

1. **Add or replace images** in the right `public/` subfolder. Event list metadata lives in `data/events.yml` with `image: /events/...` (single hero per event). The home **Gallery** section uses `data/gallery.yml` with paths like `/gallery/...`; those assets are not required to match the events list 1:1. Upcoming vs past is computed from `dateISO`, not from folders.
2. **Edit the matching YAML** in `data/` (e.g. `data/artists.yml`, `data/events.yml`, `data/services.yml`, `data/partners.yml`). Use paths from the site root, e.g. `image: "/artists/yourfile.webp"` (no `public/` in the path). If you drop in JPEG/PNG, run `bun run _images:optimize`, then fix any path renames in YAML.
3. **Verify**: `bun run test` regenerates data, checks image formats, builds, and runs the full safety gate before the change ships.

**Media formats.** **Photos** for the site (events, artists, gallery, partners, hero stills) are **WebP** in `public/` (favicons under `public/favicon/` and the brand mark under `public/logos/` stay PNG as needed). **Video** uses **MP4** (e.g. hero backgrounds). **M4A/AAC** is for audio files, not images—do not use it for photos.

See comments at the top of each `data/*.yml` file for field descriptions. Non-technical editors can add images and update YAML; no component code changes are required.

## Commands

- `bun run dev` – one local development server.
- `bun run start` – one local production server path; builds first, then runs `next start`.
- `bun run test` – one full gate: public image check, lint, coverage, typecheck/build, client-bundle scan, route/external-link QA, and browser console/runtime crawl. Local CI, pre-commit, GitHub Actions, and Vercel use this.
- `bun run smoke` – one faster local smoke gate: public image check, lint, typecheck/build, client-bundle scan, and route/external-link QA; no coverage or browser crawl.
- `bun run ship:dev` – one staging ship path; pushes the current clean Git commit to `origin/dev` for Vercel Preview.
- `bun run promote:prod` – one production promotion path; fast-forwards `origin/main` to the validated `origin/dev` commit after typed confirmation.

## Vercel (production deploys)

The site is deployed on Vercel. Pushes to `main` normally trigger an automatic deployment.

Preview-first Git flow:

1. Commit normally; the pre-commit hook runs `bun run test`.
2. `bun run ship:dev` to push the current commit to Vercel Preview (`dev`).
3. Validate forms/signups on the Preview URL.
4. `bun run promote:prod` to fast-forward production (`main`) from validated `dev`.

**If a push didn’t trigger a deploy:**

1. **Git integration** – [Vercel → Account → Authentication](https://vercel.com/account/authentication): ensure your GitHub (or Git) login is connected and has access to this repo.
2. **Repo permissions** – If you only granted access to certain repos, add `lupferentertainment-cmd/Lupfr` (or this repo) to the allowed list in GitHub’s Vercel app settings.
3. **Commit author** – The commit author email must match the email of the Git account linked to Vercel. Check with `git log -1` and fix with `git config user.email "your@email.com"` if needed.
4. **Private repo + team** – For a team project, the commit author must be a member of the Vercel team (or owner for Hobby).

**Redeploy now (without pushing again):**

- In [Vercel Dashboard](https://vercel.com/dashboard) open the project → **Deployments** → open the latest deployment → **⋯** → **Redeploy** (use “Use existing Build Cache” or not).
- Or create a **Deploy Hook**: Project **Settings** → **Git** → **Deploy Hooks** → add a hook, then call that URL (e.g. `curl -X POST "https://api.vercel.com/v1/integrations/deploy/…"`) to trigger a new deployment.
