# Deployment

**Repository `docs/` vs production site.** The Markdown specs under `docs/` are versioned in **Git** for maintainers; they are **not** exposed as public pages. Vercel only ships the Next.js app: there is no `app/docs` or `public/docs` route. Any request to `/docs` or other blocked doc-like paths is answered with **404** by `proxy.ts` (and blocked in `public/robots.txt`). Keep the GitHub repo private if spec content must not be public outside the team.

## Two environments (staging `dev` → production `main`)

Lean, two-environment model so updates are validated on a staging URL before they reach **lupfr.com**. No third environment, no extra services.

| Branch | Vercel environment | URL | When it deploys |
| --- | --- | --- | --- |
| `dev` | **Preview (staging)** | https://lupfr-git-dev-lupferentertainment-5199s-projects.vercel.app | every push to `dev` |
| `main` | **Production** | lupfr.com | only when `dev` is promoted to `main` |

How it works: `main` is the Vercel **Production Branch** (unchanged). Vercel automatically builds a **Preview deployment** for every other branch, so the `dev` branch is your staging environment for free — there is nothing to crash on production while testing.

**Daily flow:**

1. Do your work on any local branch (including local `main`). Commit normally — the pre-commit hook runs `bun run test`.
2. `bun run ship:dev` — runs the full gate, then **force-pushes HEAD to `origin/dev`**; Vercel builds the staging Preview. `dev` is staging-only and is always overwritten with whatever is ready; divergence from `origin/dev` is not an error. Find the Preview URL in the Vercel project **Deployments** tab (the `dev` branch entry).
3. Open that Preview URL and review the change.
4. When it looks right: `bun run promote:prod` — fast-forwards `origin/main` to the validated `origin/dev` commit; Vercel deploys production. The script prints the exact commits and asks you to type `yes`. It never force-pushes `main`, so production history is safe.

**Rule:** nothing goes to `origin/main` (production) without first passing through `origin/dev` (staging Preview) and a human review step. `ship:dev` may be run as many times as needed; `promote:prod` is the gate.

**Preview environment variables.** Make sure the required secrets exist for the **Preview** scope as well as Production (see Environment below), otherwise the `dev` preview's API routes return 500. Internal maintainers can run `bun run _vercel:env:check` when auditing Vercel secrets.

**Preview SEO / Lighthouse.** The branch Preview URL can be protected by Vercel Authentication. A protected Preview returns `401` with `X-Robots-Tag: noindex` before the Next.js app runs, so Lighthouse reports **“Page is blocked from indexing”** even though the app metadata is `index, follow`. For public SEO scoring, audit **`https://lupfr.com`** after `bun run promote:prod`. For a staging audit, create a Vercel **Shareable Link** or enable **Protection Bypass for Automation** and pass `x-vercel-protection-bypass` as a header/query parameter; do not hardcode the bypass secret in repo files.

**Platform.** Vercel. Pushes to `main` trigger automatic deployment. Build command uses Bun: install and `package.json` scripts run under Bun. Vercel runs **`bun run _build`** for the production Next.js build; the public full gate is **`bun run test`** and is enforced before staging by `bun run ship:dev`, by pre-commit, and by GitHub Actions. Internal `_build` plumbing runs data generation, strict TypeScript validation, cleanup, and `bunx --bun next build --webpack` so the **Next.js CLI** runs on **Bun**. Webpack production build avoids Turbopack-only client-reference manifest gaps on dynamic App Router routes in current Next.js.

**Local dev:** If `next dev` returns **500** with `ENOENT` on `.next/dev/routes-manifest.json` (or other missing files under `.next/dev`), restart `bun run dev`. Startup runs `scripts/prepare-dev-cache.mjs`, which removes only the incomplete `.next/dev` cache so Next can rebuild it. `bun run test` and `bun run smoke` use isolated `.next-ci/<run>` output and refuse to start the production build while dev is active, so they no longer delete or race the dev server cache.

**Vercel project (dashboard).** [lupfr — Vercel](https://vercel.com/lupferentertainment-5199s-projects/lupfr) (`lupferentertainment-5199s-projects` / `lupfr`).

**Link local folder ↔ Vercel project (CLI).** After [`vercel login`](https://vercel.com/docs/cli#login), from the repo root (non-interactive): `vercel link --project lupfr --yes --non-interactive --scope lupferentertainment-5199s-projects`. This creates a local `.vercel/project.json` (gitignored) so `vercel env pull`, deploy commands, and previews target this project. It does not replace **Git** connection in the dashboard.

**Connect Git for automatic deploys.** In the [project on Vercel](https://vercel.com/lupferentertainment-5199s-projects/lupfr), open **Settings → Git**. Connect **this** repository and default production branch (e.g. `main`) so each push runs a new deployment. If the overview shows “Connect Git Repository,” complete that flow (authorize the Git provider, pick the repo, confirm). Until Git is connected, you can still deploy with `vercel` / **Deployments → Deploy** from the CLI or dashboard, but there is no push-to-deploy.

**Environment.**

- **Required:** `RESEND_API_KEY` – Resend API key with send permission. Without it, contact and newsletter API routes return 500.
- **Required:** `GOOGLE_SHEETS_WEBHOOK_URL` – full Google Apps **Web app** deployment URL (the string in **Deploy → Manage deployments →** copy **Web app** URL: `https://script.google.com/macros/s/…/exec` or the current Google URL for your deployment). Set this name in Vercel (not `GOOGLE_SCRIPT_URL`); the Next.js app reads `GOOGLE_SHEETS_WEBHOOK_URL` only. Without it, `/api/phone-list` returns 500.
- **Optional:** `GOOGLE_SHEETS_SECRET` – If your Apps Script checks a shared key, set this; the app adds the secret to the webhook JSON (default key `secret`). Override the JSON property name with **`GOOGLE_SHEETS_SECRET_FIELD`** if your `doPost` reads a different key (e.g. `webhookToken`). If the script enforces a secret and the env is missing in the environment that `next dev` loads (see **`.env.local`**, not only `.env.production.local`), the script may return 401 and `/api/phone-list` will return 502 with `upstreamStatus: 401`.
- **Optional:** `RESEND_TO_EMAIL` – Override recipient for **newsletter internal notifications** only (default: `will@lupfr.com`). Contact form submissions always go to `will@lupfr.com` via `CONTACT_FORM_TO_EMAIL`.

Set in Vercel: Project → Settings → Environment Variables. No other runtime secrets.

Verify required vars in Vercel with:

1. `bun run _vercel:env:check`

If missing, add each variable interactively:

1. `vercel env add GOOGLE_SHEETS_WEBHOOK_URL preview`
2. `vercel env add GOOGLE_SHEETS_WEBHOOK_URL production`
3. `vercel env add RESEND_API_KEY preview`
4. `vercel env add RESEND_API_KEY production`

**Preview-first flow (Git).**

1. Commit normally; the pre-commit hook runs `bun run test`.
2. `bun run ship:dev` runs `bun run test`, then **force-pushes HEAD to `origin/dev`**; Vercel builds the staging Preview. `dev` is always overwritten — no reconciliation needed.
3. Validate the change on the Preview URL.
4. `bun run promote:prod` fast-forwards `origin/main` to the validated commit after typed confirmation; Vercel deploys production. Never force-pushes `main`.

If preview or production returns `Google Sheets webhook rejected the request.`, validate the Google Apps Script deployment access is set to allow unauthenticated web app POST calls ("Anyone") and confirm the current deployment URL is authorized by your script policy. In **development** (`next dev`), a non-OK webhook response can include a `debug` object on the JSON: if `upstreamPreview` shows HTML (for example a Google “Page Not Found” page) while `upstreamStatus` is `401` or `404`, the **`GOOGLE_SHEETS_WEBHOOK_URL` is likely stale or mistyped** — open the script, **Deploy → Manage deployments**, create a new web app version if needed, and paste the new **Web app** URL (must end in `/exec` for the current deployment) into Vercel and `.env.local`.

**Google Apps Script (Sheets) — contract for `/api/phone-list`.** The site does **not** call Google from the browser; the Next.js route `app/api/phone-list/route.ts` `POST`s JSON to `GOOGLE_SHEETS_WEBHOOK_URL` with **`Content-Type: text/plain;charset=utf-8`** (body is still a JSON string). That avoids Google’s `/exec` front-end often returning **405** for `application/json` on server-side clients. Your script should expose **Execute as: Me** and **Who has access: Anyone** (or the minimum your org allows for anonymous POST). Implement `doPost(e)` (or the container’s POST handler), parse `e.postData.contents` as JSON (do not require `postData.type === "application/json"`), and append a row to the target sheet. **Payload sent by the app** (all string values; `email` and `phone` are omitted when empty after sanitization): `name`, optional `email`, optional `phone` (at least one of email or phone is required by the API), `source` (e.g. `lupfr.com`), `page` (from `Origin` or `unknown`), `userAgent`, `submittedAt` (ISO 8601). If `GOOGLE_SHEETS_SECRET` is set in the deployment env, the app also sends `secret` in the same JSON. Your `doPost` should compare it to a value stored in Script Properties (or equivalent), not hardcoded in the script source.

**Build.** `generate-data` reads `data/*.yml` and writes `lib/data/generated/*.json`; then Next.js build runs. Ensure all required YAML files exist in `data/` (events, artists, services, partners) so generated JSON is present.

**CI (GitHub Actions).** On every push and pull request, `.github/workflows/ci.yml` installs Chromium with Playwright and runs `bun run test`. The suite runs public raster check, lint, Vitest with coverage thresholds, **`bunx --bun next build`**, client-bundle scan, internal route smoke and external-link QA, and a Playwright Chromium crawl for console/runtime errors. Vercel deployments run the production build after `ship:dev` has already passed the full gate locally and GitHub Actions repeats it in CI.

**Troubleshooting (from README).** If deploy does not trigger: check Git integration and repo access in Vercel; ensure commit author email matches linked Git account; for teams, author must be in Vercel team. Redeploy from dashboard (Deployments → Redeploy) or use a Deploy Hook.

**Internal documentation (`docs/`).** The canonical specs under `docs/*.md` are **versioned in Git** (e.g. private GitHub) for maintainers, Cursor context, and CI alignment — not end-user help pages. The production site does **not** expose them: there is no `app/docs` route, nothing under `public/docs/`, and **`proxy.ts`** returns **404** for `/docs`, `/_docs`, and several bare `/*.md` paths, with `X-Robots-Tag: noindex, nofollow, noarchive`. `bun run test` asserts **`/docs`**, **`/docs/overview`**, **`/README.md`**, **`/api.md`**, and related checks stay **404** after build (see `scripts/verify-routes.sh`). The build still includes the repo tree in the project, but those paths are not browseable on the public hostname.
