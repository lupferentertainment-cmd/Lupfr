# Testing

**Stack (authoritative).** **Next.js** (App Router) with **Bun** as the package manager and script runner. **Vitest** is the test runner used with this repo (it is not NestJS; NestJS is not part of the stack). **Vitest** is a separate project from the Vite dev server; tests are `bun run test` / `bun run coverage`, not “Vite UI tests.” For **React component** checks, use **React Testing Library** (queries and user events from the visitor’s perspective). **Branch coverage** is enforced globally alongside statements/lines/functions.

**Current state.** The repo has **Vitest** (unit + integration + RTL behavior tests) with coverage enforcement, plus lint/build/route-smoke checks.

**Vitest, React 19, and `NODE_ENV`.** In React 19, the CJS production `react` build omits `exports.act`; `react-dom` test utils still call `React.act`, so @testing-library/react fails with *React.act is not a function* if tests run under **`NODE_ENV=production`** (e.g. Vercel’s `ci:vercel` step). The first **setup** file, `tests/setup/node-env-react.ts`, sets `NODE_ENV` to `test` when it was `production`, before any React import. Order is fixed in `vitest.config.ts` (`setupFiles`).

**Coverage policy.** Coverage thresholds are enforced in `vitest.config.ts`:

- Statements: `>= 80%`
- Functions: `>= 80%`
- Lines: `>= 80%`
- Branches: `>= 80%`

**How to write tests.** Prefer **observable behavior**: components — roles, labels, and user events (RTL); HTTP handlers — status codes and JSON shape (integration), not internal call order. Pure helpers (e.g. gallery URL math) may stay as small unit tests when they encode a documented contract.

**Behavioral gaps (gallery).** Core UX that used to be easy to miss in tests: (1) every home **carousel** slide must navigate to **`/gallery/p/[id]?from=home`** (shareable photo page, not `/gallery` alone); (2) **back** from that page (link, Escape, or browser Back after the carousel’s history rewrite) must land on **`/#gallery`**, not **`/gallery`**. **`tests/behavior/gallery-home-journey.test.ts`** asserts the URL contract for every **`GALLERY_CAROUSEL_PHOTOS`** row plus **`homeHistoryReplaceForGalleryBack`**. Helpers stay covered in **`tests/unit/gallery-nav.test.ts`** and **`tests/unit/escape-back.test.ts`**. The carousel applies **`homeHistoryReplaceForGalleryBack`** on primary-click so the history stack’s prior entry is **`/#gallery`** when the user started from **`/`** without that hash.

**Test suites.**

- `tests/unit/globals-gold-theme.test.ts` – **`app/globals.css`**: locked OKLCH values for **light** vs **.dark** “white gold” (`--gold*` / buttons / entertainment line tokens) and presence of **hero** metallic shine (`--gradient-hero-gold`, `hero-shine-pass`, `hero-gold-shine-periodic`); prevents accidental reintroduction of removed dark **bronze/copper** main `--gold` or loss of the shine pipeline.
- `tests/unit/contact-input.test.ts` – sanitization and phone/email validation rules.
- `tests/unit/rate-limit.test.ts` – per-key request limiting behavior, `x-forwarded-for` / `x-real-ip` / fallback IP extraction, and window reset.
- `tests/unit/cookie-consent.test.ts` – `cookie-consent` library: storage read/write and custom event; guardrails when `localStorage` throws.
- `tests/components/cookie-consent.behavior.test.tsx` – **RTL**: first visit shows the cookie region; **Accept** dismisses it and persists consent; privacy/terms links; already-accepted skips the banner.
- `tests/unit/gallery-album.test.ts` – `GALLERY_PHOTOS` `albumFolder` / `albumPathSegments` (URL path folders under `gallery/…`) / `albumBreadcrumb` / `dateISO` for canonical folders (e.g. `boiler_boat_003`, `where_is_west` under `public/gallery/`), `galleryPathFolderSegmentsFromSrc` for nested paths, `GALLERY_CAROUSEL_PHOTOS` including both home albums, plus `GALLERY_HOME_ALBUM_FOLDERS`, `getGalleryPhotosByAlbumFolder`, `albumBreadcrumbForFolder` fallbacks, and `getGalleryPhotoById` / `getGalleryIndexById`.
- `tests/unit/data-integrity.test.ts` – fast guardrails: gallery default folders map to **one** event per `dateISO` and breadcrumb matches `events.yml` `title`; every `GALLERY_PHOTOS` file and every event hero path exists under `public/`; home album folders are non-empty and have `public/gallery/<folder>/`; **every upcoming event** (from `getUpcomingEvents()`) **must have** YAML `ticketLink`—missing links log **`console.warn`** and fail the assertion.
- `tests/unit/gallery-date.test.ts` – `isValidGalleryDateISO`, `formatGalleryDateLabel`, `galleryPhotoDateLabel`, and `groupGalleryByDateISO` (archive ordering).
- `tests/unit/gallery-nav.test.ts` – `galleryPhotoHref`, `galleryPhotoListBackHref`, `homeHistoryReplaceForGalleryBack`, and `?from=` helpers; `galleryCircularPreloadIndices` / `galleryLinearPreloadIndices` for gallery sliding-window preloads.
- `tests/behavior/gallery-home-journey.test.ts` – **URL / UX contract** for the home gallery carousel: each **`GALLERY_CAROUSEL_PHOTOS`** item uses `?from=home`; “up” / Escape from that photo targets `/#gallery` (not `/gallery`); `from=gallery` keeps `/gallery`; history rewrite rules for browser Back.
- `tests/unit/escape-back.test.ts` – `getEscapeBackHref` targets by route + query (including `/contact` → `/`); `isDocumentBlockingEscapeBack` with minimal document doubles; `isEscapeBackFormFieldTarget` for form fields (happy-dom).
- `tests/unit/site.test.ts` – `CONTACT_PAGE_PATH` for `/contact` (Book an Event).
- `tests/unit/seo-discovery-assets.test.ts` – SEO discovery contracts: `public/robots.txt` includes sitemap + explicit AI crawler groups, root and `/favicon/` icon fallbacks exist, and `public/llms.txt` + `public/site.webmanifest` publish crawl/discovery targets.
- `tests/unit/events-list.test.ts` – `getUpcomingEvents` / `getPastEvents` sort order (`dateISO` ascending for upcoming with TBD last; newest-first for past); `getEventBySlug` / `eventDetailPath`; `todayDateISOInEventTZ`; `getEventTag` (TBD / past / today / upcoming); `eventShareTitle` / `eventHeroAbsoluteUrl` (including relative image paths) for event detail sharing and OG image URLs.
- `tests/components/event-detail-link.behavior.test.tsx` – **RTL**: event card links stay normal canonical `/events/[slug]` links, warm the route once on visitor intent, show immediate mobile tap feedback, avoid duplicate touch/pointer/click prefetches, and clear feedback when activation is cancelled.
- `tests/unit/links.test.ts` – `LINKS` contract: required keys and `https` URLs for external destinations.
- `tests/integration/phone-list-route.test.ts` – API validation (name required; **email and/or phone**); webhook JSON omits empty contact fields; optional `GOOGLE_SHEETS_SECRET` and `GOOGLE_SHEETS_SECRET_FIELD` in the forwarded JSON; invalid JSON / missing webhook URL / upstream fetch failure / non-OK webhook response (502); and 429 protection.
- `tests/unit/vercel-shell-scripts.test.ts` – `scripts/vercel-*.sh` exist and pass `bash -n` (syntax check).
- `tests/integration/contact-route.test.ts` – contact API validation, invalid JSON / missing fields, Resend misconfiguration and send failures (including non-`Error` throws), mail success path, and 429 protection.
- `tests/integration/newsletter-route.test.ts` – newsletter API validation, invalid JSON / empty email, dual-send success and per-send failures, non-`Error` send failures, and 429 protection.
- `tests/unit/email-templates.test.ts` – contact email HTML includes optional company/budget rows.

**Commands.**

- `bun run test` – run Vitest suite.
- `bun test` – also runs the full Vitest suite (via `bunfig.toml` + `scripts/bun-vitest-delegate.test.ts`; the repo is Vitest-based, not Bun’s default test runner on `tests/**` directly).
- `bun run test:precommit` – run `data-integrity.test.ts` only (also invoked at the start of `bun run precommit` and `scripts/pre-commit`).
- `bun run coverage` – run Vitest with coverage + thresholds.
- `bun run lint` – ESLint.
- `bun run build` – `generate-data` + `bunx --bun next build --webpack`.
- `bun run verify:routes` – production route smoke checks; asserts public crawl/discovery endpoints respond (`/robots.txt`, `/sitemap.xml`, `/site.webmanifest`, `/llms.txt`, `/opengraph-image`, `/twitter-image`, and favicon root fallbacks), and still enforces **404** for internal-doc URLs (`/docs`, `/docs/overview`, `/README.md`, `/api.md`) so they never become accidental public routes (see `proxy.ts`). Unknown paths must return **404** (not streamed 200): the app enables **`experimental.globalNotFound`** and `app/global-not-found.tsx` so crawlers and this script see a real status code.
- **Same clone as `next dev`:** Do not run **`bun run build`** / **`bun run ci`** while dev is writing **`.next/`**; stop dev first or you may see lock errors, missing manifests, or **`verify:routes`** / **`next start`** failing. If **`4310`** is taken, use e.g. **`VERIFY_ROUTES_PORT=43990 bun run verify:routes`**.
- `bun run verify` – lint + build + route smoke.
- `bun run ci` – lint + coverage + build + route smoke. This command is safe for multiple agents to run concurrently in the same clone: it isolates coverage under a per-run temp directory, builds into a per-run Next dist directory under `.next-ci/`, and assigns route smoke checks a per-run port unless `VERIFY_ROUTES_PORT` is explicitly set.
- `bun run ci:vercel` – public raster check + lint + coverage + build + `verify:routes` (same order as the Vercel `buildCommand`; mirrors `ci` plus the image gate, and includes post-build route smoke).
- `bun run public:images:check` – fails if `public/` still has non-favicon, non-logo JPEG/PNG that should be WebP (same as the pre-commit raster gate).
- `bun run public:images:optimize` – convert those rasters to WebP in place, then update `data/*.yml` paths and run `bun run generate-data`.

**Vercel enforcement.** `vercel.json` uses `buildCommand: "bun run ci:vercel"`, so Preview and Production builds fail if lint, Vitest/coverage, **`bunx --bun next build`**, or post-build `verify:routes` fails (same script as **GitHub Actions** `CI` job, so the two stay aligned).

**Docs.** Any change to test scope, thresholds, or CI commands must be reflected in this file.

**Navigation visual guardrail.** `tests/unit/navigation-veil.test.ts` asserts that `components/navigation.tsx` uses the `.lupfr-site-header` stateful gradient veil and that `app/globals.css` keeps the masked gradient/backdrop blur surface. This protects the fixed nav from regressing to a flat transparent-or-solid strip with a hard edge.

**Home performance guardrail.** `tests/unit/home-performance.test.ts` asserts that the home page keeps lower sections behind intersection-observed hash placeholders and that artist cards render local opt-in buttons before creating Spotify/SoundCloud iframes. This protects mobile initial transfer and hydration cost from regressing.

**Hero video performance guardrail.** `tests/unit/hero-video-performance.test.ts` asserts that the desktop hero loads one active theme video over the poster, falls back quickly when playback is slow, and keeps immutable cache headers on `/hero/*` media.

**Data layer performance guardrail.** `tests/performance/data-layer-budgets.test.ts` uses warmup plus best-of timing samples for ratio checks so CI timer jitter does not hide real regressions or create false failures.
