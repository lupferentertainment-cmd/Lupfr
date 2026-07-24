# LUPFR – Overview

**Purpose.** This repo is the source for the LUPFR Entertainment marketing site: San Francisco music event production (boat parties, rooftop/warehouse events, talent curation). The site is not a product app; it is a content-driven marketing and contact site.

**Stack.** Next.js 16 (App Router), React 19, Bun (install/scripts/lint), Tailwind CSS 4, Vercel for hosting. Email via Resend (contact form, newsletter).

**Content model.** Site content is data-driven: YAML in `data/` (events, gallery, artists, services, partners) is compiled at build time by `scripts/generate-data.js` into JSON under `lib/data/generated/`. Raster images in `public/` (except `favicon/` and `logos/`) are **WebP**; `bun run test` enforces that before every ship. No CMS; content changes = edit YAML + run the single verification gate. A password-gated **operator shell** at `admin.lupfr.com` / `/admin` offers read-only ops (Vercel Analytics deep-link, content counts) — it does not edit YAML or media.

**Docs in this repo.** The files in `docs/` are **maintainer- and agent-facing** (private GitHub; spec alignment, CI, and Cursor context). They are the **authoritative** implementation spec, not public marketing copy. Keep them **only** in repo-root `docs/` — do **not** add `app/docs/**` or `public/docs/**` (that would create servable URLs or static files under `/docs`).

**Public exposure guardrails.** **`proxy.ts`** (Next.js 16 request proxy; formerly `middleware`) returns `404` (not a redirect) + `X-Robots-Tag: noindex, nofollow, noarchive` for `/docs`, `/_docs`, their subpaths, and several bare `/*.md` names at the site root (for example `/README.md`, `/API.md`, `/TESTING.md`) so spec text is not browseable on the public hostname. `public/robots.txt` disallows the same patterns and **`Disallow: /admin`**. Admin routes also set `noindex` metadata/`X-Robots-Tag` and are excluded from `app/sitemap.ts`. `bun run test` asserts **`/docs`**, **`/docs/overview`**, **`/README.md`**, and **`/api.md`** stay **404** among other checks; see `scripts/verify-routes.sh`.

**Canonical doc set.** Authoritative specs live in: OVERVIEW (this file), ARCHITECTURE, DESIGN, REQUIREMENTS, API, DEPLOYMENT, TESTING. New knowledge is merged into these; no feature-specific docs. **Cursor / LLM policy** for keeping code and `docs/` in lockstep: `.cursor/rules/lupfr-context-engineering.mdc` (always on) and `.cursor/rules/lupfr-code-to-docs-map.mdc` (code area → doc).
