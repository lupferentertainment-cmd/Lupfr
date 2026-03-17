# LUPFR

San Francisco's premier music event production company. Creating unforgettable experiences in the Bay and beyond.

## Setup

This project uses **Bun**. With [Corepack](https://nodejs.org/api/corepack.html) enabled (`corepack enable`), `npm install` and `npm run` will use Bun.

1. Install dependencies: `bun install`
2. Copy environment: `cp .env.example .env.local`
3. Add your [Resend](https://resend.com) API key to `.env.local`:
   - `RESEND_API_KEY=re_xxxxxxxxx` (get a key at https://resend.com/api-keys)
   - Required for the contact form and newsletter signup to send email to `will@lupfr.com`
4. Run dev: `bun run dev`

## Resend

Contact form submissions and newsletter signups are sent via [Resend](https://resend.com). Without `RESEND_API_KEY` in `.env.local`, those endpoints return an error asking you to add the key. Verify your `lupfr.com` domain in Resend and use a key with send permission.

## Build

- `bun run build` – production build
- `bun run start` – run production server

## Vercel (production deploys)

The site is deployed on Vercel. Pushes to `main` normally trigger an automatic deployment.

**If a push didn’t trigger a deploy:**

1. **Git integration** – [Vercel → Account → Authentication](https://vercel.com/account/authentication): ensure your GitHub (or Git) login is connected and has access to this repo.
2. **Repo permissions** – If you only granted access to certain repos, add `lupferentertainment-cmd/Lupfr` (or this repo) to the allowed list in GitHub’s Vercel app settings.
3. **Commit author** – The commit author email must match the email of the Git account linked to Vercel. Check with `git log -1` and fix with `git config user.email "your@email.com"` if needed.
4. **Private repo + team** – For a team project, the commit author must be a member of the Vercel team (or owner for Hobby).

**Redeploy now (without pushing again):**

- In [Vercel Dashboard](https://vercel.com/dashboard) open the project → **Deployments** → open the latest deployment → **⋯** → **Redeploy** (use “Use existing Build Cache” or not).
- Or create a **Deploy Hook**: Project **Settings** → **Git** → **Deploy Hooks** → add a hook, then call that URL (e.g. `curl -X POST "https://api.vercel.com/v1/integrations/deploy/…"`) to trigger a new deployment.
