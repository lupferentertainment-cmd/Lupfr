# Changelog

All notable project changes are recorded here.

## [Unreleased]

### Added

- Added a smoke-first Vitest subset (`bun run _test:smoke`) that runs at the start of both `bun run test` and `bun run smoke`, and made Vitest workers configurable via `VITEST_MAX_WORKERS` with a measured `50%` default to fail faster without over-scheduling local machines.
- Simplified the public Bun workflow to one command per operator job: `bun run dev`, `bun run start`, `bun run test`, `bun run smoke`, `bun run ship:dev`, and `bun run promote:prod`. Internal build/lint/route/browser/image plumbing moved behind underscored scripts, while GitHub Actions, Vercel, and pre-commit now call `bun run test` directly.
- Added `tests/unit/test-suite-gate.test.ts` to lock the single-gate contract so `bun run test` keeps running coverage, gallery journey coverage, dynamic route/external-link QA, and browser runtime crawl.
- Updated the installed pre-commit hook source so commits run the canonical full test gate directly.
- Documented the repo-local documentation discipline in `docs/RUNBOOK.md`: behavior, deployment, testing, content, and public-surface changes must update the relevant `docs/` spec and `docs/CHANGELOG.md` before commit.
- Added `scripts/verify-console.mjs`: a headless **Chromium** (Playwright) smoke check that starts the production server, crawls every internal route reachable from `/`, and **fails the run on any browser `console.error`, uncaught page/runtime error (including React hydration #418/#423), or same-origin HTTP `>= 400` response** — the class of Next.js client errors the route crawl cannot see. Wired into `bun run test`; opt out locally with `LUPFR_SKIP_BROWSER_CHECK=1`.
- Swapped the Where's West featured-artist photo for a higher-resolution asset (`public/artists/wheres_west.webp`, 300x300 -> 609x621) and updated the pinned image-hash guard in `tests/unit/artists-list.test.ts`.
- Added dynamic external-link QA to the route crawl: while crawling internal routes, the production server crawl now collects every external `<a href>` (Instagram, TikTok, YouTube, Partiful, Google Calendar CTA) via `scripts/extract-external-links.mjs` and health-checks each with a browser UA and a tolerant policy (bot-block `401/403/405/429` = alive; only DNS/connection failure, `404/410`, or `5xx` fail; timeout = `WARN`). Runs in `bun run test`, `bun run smoke`, and on Vercel; opt out of just the outbound checks with `VERIFY_ROUTES_SKIP_EXTERNAL=1`. Added `tests/unit/extract-external-links.test.ts` covering the extractor contract.

- Added `bun run ship:dev` and `bun run promote:prod` scripts (`scripts/ship-dev.sh`, `scripts/promote-prod.sh`) implementing the documented branch-based staging flow: `ship:dev` fast-forward pushes the current commit to `dev` for a Vercel staging Preview, and `promote:prod` fast-forwards `main` to the validated `dev` commit (refuses on divergence, prints the promoted commits, requires a typed `yes`, never force-pushes). Resolves the drift where `docs/DEPLOYMENT.md` referenced these scripts before they existed.
- Added Soundcheck to Corporate Partners with an optimized WebP sponsor logo asset and non-linked partner rendering support.

### Added (Content — 2026-06-05)

- Added **GAS MONEY** event (June 20th, 2026, ERIA MARINA) with poster `public/events/gas_money.webp` via Claude Code AI-assisted content update; entry lives in `data/events.yml` id 12.
- Updated **Rhythm n Friends** poster (`public/events/rhythm_n_friends.webp`) with the revised artwork from the 604 Website Update zip.

### Fixed

- Made Featured Artists use a static mobile grid with plain image cards and no mobile carousel/player embeds, fixed hash scrolling after the lazy mobile section mounts, and removed Operator SF from the featured artist lineup.
- Replaced the Rhythm n Friends event poster with the blue Rhythm N Friends artwork (`public/events/rhythm_n_friends.webp`).
- Restored the Where's West event poster (`public/events/wheres_west.webp`) to the original 1080x1350 event artwork while keeping the updated artist photo at `public/artists/wheres_west.webp`.
- Hardened the browser console crawl so intentionally blocked heavy media/font/image requests and aborted Next RSC prefetches do not fail the gate while same-origin HTTP errors and real request failures still do.
- Improved first-screen performance by removing Framer Motion from the fixed navigation and keeping the base schedule-call CTA free of motion-only imports; the navigation section spy now avoids redundant DOM scans during scroll.
- Documented the Vercel protected-preview SEO failure mode and made `bun run ship:dev` warn that Lighthouse indexing audits must use production, a Shareable Link, or the `x-vercel-protection-bypass` automation path.
- Delayed the first-visit cookie notice past the initial load window, disabled first-paint prefetches from visible nav/legal links, tightened mobile deferred-section mounting, and removed an unused Unsplash preconnect to improve Lighthouse mobile LCP and transfer.
- Kept the Playwright console crawl focused on runtime errors by fulfilling heavy image/media/font requests with empty `204` responses, skipping per-photo gallery routes, ignoring expected Next `_rsc` prefetch aborts, and treating target-close settle races as warnings, preventing large gallery crawls from exhausting or flaking the built Next server during `bun run test`.
- Enabled the self-contained global 404 document for synthetic missing-route checks so they do not hit Next.js client-reference-manifest instability for `/_not-found`.
- Hardened the Playwright browser crawl against long-lived media/analytics requests by waiting for DOM readiness plus a short settle window instead of blocking on `networkidle`.
- Moved Vercel Preview/Production builds back to the production build command (`bun run _build`) and made `bun run ship:dev` run the canonical full gate before pushing `dev`; GitHub Actions now installs Playwright Chromium before `bun run test` so the browser crawl works in CI.
- Bounded dynamic external-link QA by collapsing repeated gallery social-share endpoints to one live health check per share endpoint after route crawling, keeping `bun run test` comprehensive without hundreds of duplicate network checks.
- Tightened the desktop About section grid so the Will Lupfer portrait and value cards sit closer together.
- Kept the fallback pages-manifest Webpack plugin out of `next dev` so dev builds no longer crash with duplicate `pages-manifest.json` asset emissions.
- Isolated `bun run test` / `bun run smoke` build output under `.next-ci/`, made client-bundle verification follow `NEXT_DIST_DIR`, and added dev-cache preflight cleanup so `.next/dev/routes-manifest.json` ENOENT loops self-heal instead of recurring.
- Renamed the June 19 Rhythm event slug/title/description from the birthday-bash wording to `Rhythm n Friends` in source event data.
- Guarded homepage dynamic imports with a named-export resolver so missing deferred section exports fail with a clear error before React lazy can render `undefined`.
- Removed duplicate hero poster preloads, made the immediately visible Reviews section a normal import, and added route coverage for favicon folder fallbacks plus the legacy `/layout.css` stylesheet request to eliminate browser-console preload/404 noise.
- Removed build-time Google font fetching so production builds do not hang on remote font sockets.
- Hardened Next.js verification by making `build` run strict `typecheck` before `next build`, constraining build workers to avoid `.next` races, disabling the unstable experimental global-not-found build path, and cleaning up navigation/CSS diagnostics that surfaced as app-side warnings.
- Made `app/global-not-found.tsx` a self-contained static 404 document and kept global fallbacks off `next/link` so unmatched/error routes do not pull App Router client internals into document-level bundles.

## [1.0.8] - 2026-06-04

### Added

- Added Rhythm n Friends event details, ticket link, and optimized poster asset.
- Added Shamrock & House and Third Thursday's gallery albums with optimized WebP images.

### Changed

- Updated the fromclay + thatfranco event date format, ticket link, and poster asset.
- Hardened header tab links so same-page mobile hash navigation and subpage-to-home section links work reliably.
- Reduced mobile-only deferred section placeholder gaps so scrolling from Corporate Partners into Gallery feels continuous.

## [1.0.7] - 2026-06-01

### Changed

- Stabilized the hero `LUPFR` wordmark by replacing the animated clipped-text shine with a static metallic gradient and lighter shadowing to avoid video-overlay repaint flicker.

## [1.0.6] - 2026-06-01

### Changed

- Added the Yahsek Dropbox video folder to Boiler Boat 003 post-event content links.
- Updated the homepage hero tagline to `Redefining the Music Experience` and paused desktop hero video playback in favor of real event-photo poster media.
- Added June 19, 2026 FIFA World Cup Watch Party and July 25, 2026 Marina Music 002 events with optimized poster assets.
- Added fromclay and thatfranco to Featured Artists, keeping the requested six artists first and enabling carousel pagination for more than six artists.
- Reused the shared carousel primitive for Events and Featured Artists controls instead of section-specific dot navigation.
- Added Nazarian Law and Empress Yachts to Corporate Partners with optimized transparent logo assets.
- Updated the Schedule a call destination to the new Google Calendar booking link.
- Updated the FIFA World Cup Watch Party Partiful link and added reusable `ticketStatus: tbd` handling for disabled event CTAs.
- Renamed the July 25 Marina Music event display to `fromclay + thatfranco` and updated its time to 9 PM - 1 AM.
- Reduced homepage scroll flicker by removing fixed-background and backdrop-blur repaint triggers, making section reveals one-shot, and using static metallic shine by default.
- Enabled the desktop hero video with an optimized real ERIA Marina event loop and poster fallback.
- Added a post-build client-bundle verification gate to block the retired hero shine references that caused the production client crash.
- Hardened Vitest browser-storage setup so malformed local `localStorage` globals no longer break cookie/contact preference tests.
