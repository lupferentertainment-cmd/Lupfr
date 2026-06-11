# Changelog

All notable project changes are recorded here.

## [Unreleased]

### Added

- Gated **production promotion on the canonical full test suite**: `bun run promote:prod` now refuses to run unless local HEAD is the exact `origin/dev` commit being promoted, then re-runs `bun run test` against it before the typed confirmation and fast-forward push. Both deploy environments (staging Preview via `ship:dev`, production via `promote:prod`) now run the identical gate — including dynamic route/link QA, the asset crawl, and the browser console crawl — before any push. Contract-tested in `tests/unit/test-suite-gate.test.ts`; documented in `docs/DEPLOYMENT.md` and `docs/TESTING.md`.

- Added the **dynamic asset-crawl integration suite** (`tests/integration/asset-crawl.test.ts`, `bun run _verify:assets`): boots the built production server, asserts every known route (static + blog slugs + event slugs) returns 200, and crawls each page's `<img>`/`<source>`/`<link>`/`<a>` asset references for 404s. Wired into `ci.sh` (`run_asset_checks`) so it runs inside `bun run test`. Also added the **look-and-feel CSS contract suite** (`tests/unit/look-and-feel.test.ts`) guarding typography, the gold visual system, and hero/partner/navigation/footer/animation contracts. Documented in `docs/TESTING.md`.

- Added scroll-triggered **per-word text reveal** animations (`components/text-reveal.tsx`, `TextReveal`): section lead paragraphs in Services, Featured Artists, Contact, and the About story now rise + fade in word by word as they scroll into view (Framer Motion `whileInView`, once, opacity/transform only). Screen readers get the full sentence via `aria-label`; `prefers-reduced-motion` renders static text. Documented in `docs/DESIGN.md` (Scroll-driven motion).

### Changed

- **Toned down light-mode gold** by owner request: `:root` `--gold` family stepped from `oklch(0.64 0.17 82)` to `oklch(0.58 0.15 80)` (with matching `--gold-dark` / `--gold-bright` / `--gold-specular` and `--btn-gold*` reductions) so headings, metrics, and gold CTAs read as deeper polished metal on white instead of bright glare. Dark-mode white gold untouched. Lock test `tests/unit/globals-gold-theme.test.ts` and `docs/DESIGN.md` baseline updated in the same commit.
- **On-photo gallery text is now white in both themes**: home carousel slides, album-grid slides, and `/gallery` grid hover captions switched from theme tokens (`from-background`/`from-card` scrims, `text-foreground`) to a dark black-based scrim with white title/date/caption text, and `GalleryEventBreadcrumb` gained an `onMedia` tone — so light mode no longer washes photos white or renders dark text over them (e.g. “Boiler Boat” titles). On-surface breadcrumbs (lightbox, photo page) keep theme tokens.

### Fixed

- Fixed three blog post `coverImage` paths in `data/blog.yml` (and regenerated `lib/data/generated/blog.json`) that pointed at non-existent files — now `boiler_party_marina.webp`, `boiler_boat.webp`, and `third_thursdays_operator_sf.webp`, all verified present under `public/events/`. New `tests/unit/data-integrity.test.ts` cases assert every blog cover image and partner dark-mode logo exists on disk, and new unit suites cover the blog list (`tests/unit/blog-list.test.ts`), partner normalization (`tests/unit/partners-list.test.ts`), and the blog-host proxy rewrite (`tests/unit/proxy-blog-host.test.ts`). Documented in `docs/TESTING.md`.

- Removed three dead external links that were failing `verify:routes`: the Where's West past event's `ticketLink`/`ticketLabel` (organizer deleted the eriaevents.co product page, HTTP 404) and the `url` on the Venn Social and Brixton Bar SF partner chips (both domains no longer resolve). The event detail page simply omits the gold ticket CTA. The two partner chips were then **re-linked to the brands' live domains** (verified HTTP 200): Venn Social → `https://vennsocial.co`, Brixton Bar SF → `https://thebrixtonsf.com`.

- Fixed the desktop nav bar's light/dark **theme switch overlapping the section links** (e.g. sitting on "Contact") at laptop widths: the header grid's right track floor changed from a fixed `19rem` to `max-content` (`components/navigation.tsx`), so the toggle + Schedule a call + Book an Event cluster always gets its real width and can no longer spill left over the link row (which grew when the Blog link was added). Documented in `docs/DESIGN.md` (Navigation).

### Added

- Added a complete **Blog** feature: `data/blog.yml` + generated JSON pipeline support, `lib/data/blog.ts`, `/blog` index and `/blog/[slug]` article pages with metadata, three authored starter posts from the last 2-3 months in Will's voice, nav/footer blog links, and sitemap inclusion for each article route.
- Added host-based blog routing in `proxy.ts`: `blog.localhost` and `blog.lupfr.com` now rewrite to `/blog` routes so `http://blog.localhost:3001/` serves the blog directly while preserving `_next`, API, and SEO asset paths.

- Added a **site-wide animated gold gradient background** (Framer-style motion): smooth layered gradients now flow behind the entire site with motion-safe desktop emphasis, while mobile and `prefers-reduced-motion` fall back to a softer/static baseline.
- Added **Drive-as-CMS gallery albums**: `/gallery` now renders live "Event albums" (photos **and videos**) from the public Google Drive folder `LUPFR GALLERY/website/<event_folder>/` via `lib/drive-gallery.ts` + `components/drive-gallery-albums.tsx`. Listings use Drive's anonymous `embeddedfolderview` (no API key); photos serve from Google's CDN (`lh3.googleusercontent.com`, new `next/image` remotePattern), videos embed Drive's `/preview` player. ISR-cached (1 h, `app/gallery/page.tsx` `revalidate`), so a non-technical operator can add/replace/remove media in Drive and the site inherits the change with **no commit or deploy** — and heavy media stays out of the repo (faster builds, CDN-hosted assets). Drive folders map to event titles via `DRIVE_FOLDER_TO_ALBUM_FOLDER` (added `boiler_party_marina: 2026-06-05` to `GALLERY_ALBUM_FOLDER_DEFAULT_DATES`); unmapped folders auto-render with humanized titles. Fetch/parse failure logs and hides the section (page degrades to the committed grid). Operator workflow in `docs/RUNBOOK.md` § "Gallery media via Google Drive"; parser/mapping covered by `tests/unit/drive-gallery.test.ts`.
- Added a cross-agent **docs-first / plan-first gate** so every AI agent (Claude Code, Codex, Cursor, Copilot) reads the owning `docs/*.md` spec and writes `tmp/plan.md` before any non-trivial edit: new repo-root `AGENTS.md` (canonical agent contract with code-to-docs map), `CLAUDE.md` (imports `AGENTS.md`), and `.cursor/rules/123-plan-before-acting.mdc` (always-on plan gate alongside the existing Lupfr Cursor rules, which are unchanged).
- Added a standalone **Careers** page at `/careers` (`app/careers/page.tsx`, `components/careers.tsx`), separate from the home page: data-driven open-role cards from `data/careers.yml` → `lib/data/careers.ts` (added `careers` to `scripts/generate-data.js`), each linking out to its LinkedIn job posting ("Apply on LinkedIn"), plus a "Life at LUPFR on LinkedIn" link and an empty-state message when no roles are open. Initial roles: Talent & Events Intern and Marketing & Strategy Intern (Los Angeles). Added `linkedin` + `linkedinLife` to `lib/links.ts`, a LinkedIn footer social link, a footer Company → Careers link, and data-integrity tests validating careers card content and LinkedIn job URLs. Sitemap picks up `/careers` automatically.

- Fixed the section-title second line (`.lupfr-heading-subline` via `--lupfr-heading-subline-fg`) being dark grey in **both** themes: the token now resolves to near-black ink in light mode (improved contrast, `oklch(0.21 0.018 263)`) and theme `foreground` white under `.dark` — applies globally to "Artists", "Partners", "Event pics", "Something", etc. Updated `docs/DESIGN.md` token description to match.
- Added a **News (Press / Editorials)** home-page section (`components/press.tsx`, section id `news`, nav link "News", gold-shine "News" heading) between Artists and Gallery: a carousel of clickable article cards (image, outlet badge, date, title, excerpt, "Read the article" link opening the source in a new tab), one card per slide on mobile, two per slide on desktop, matching the Artists section's gold-heading/tilt-card theme. Content is data-driven via `data/press.yml` → `lib/data/press.ts` (added `press` to `scripts/generate-data.js`). First entry: the San Francisco Post feature on LUPFR (image at `public/press/sf-post-lupfr-feature.webp`). Data-integrity tests verify press images exist under `public/` and article URLs are https.
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

- Removed the blank/deferred scroll gap between the home Events and Services sections by mounting `Services` eagerly after `Events`, and added a home-performance guardrail so future changes cannot reintroduce that placeholder delay.
- Reduced event-navigation latency: home `#events` now mounts eagerly instead of waiting on deferred-section observer mounting, and event-detail Partiful metadata fetches now use a short timeout plus request-scoped memoization so remote slowness cannot stall detail-page navigation.

- Cleaned up the light-mode visual hierarchy in the home Reviews metrics area: simplified the light page wash, switched the strip to near-white instead of muted-beige, refined stat card surfaces to cleaner glass-white layers, and softened indicator/hover contrast for a more cohesive modern baseline while keeping dark mode unchanged.
- Kept the home `#gallery` carousel (`components/gallery.tsx`) auto-advancing reliably after manual interaction by removing the fragile pointer-drag pause gate that could leave autoplay parked.
- Fixed a React hydration mismatch on the hero poster (`<img>` src/srcSet diffing `hero-poster-light.webp` vs `hero-poster-dark.webp`): `components/hero-mobile-static.tsx` and `components/hero-desktop.tsx` read next-themes `resolvedTheme` during the initial render, so a light-theme visitor's client picked the light poster while SSR had rendered dark. Both now use the shared `useHeroTheme()` in `components/hero-shared.tsx`, which resolves **dark** on the server and first client render (`useSyncExternalStore` hydration gate) and swaps to the stored theme after hydration — desktop hero video src uses the same gate so poster/video stay paired.
- Fixed inconsistent page margins on wide viewports (~1440–1600px): Tailwind v4's bare `container` caps at the raw breakpoint (1536px), so sections without an explicit width cap (About — Will's portrait hugged the left edge — Services, Artists, News, Reviews stats, Contact, Footer, and the nav bar's inner row) rendered nearly edge-to-edge while Events/Gallery/Careers stayed contained. All `container` wrappers now share the `max-w-7xl` (1280px) cap, so every section sits inside the same centered margins (`docs/DESIGN.md` § UI/UX records the rule).
- Reordered the Boiler Boat 003 gallery album so it leads with the full-deck crowd shot (`boiler_boat_003_09.webp`) instead of the posed group photo (`_01`, moved near the end with an accurate caption/alt); affects the home `#gallery` carousel lead slide and `/gallery` album order (`data/gallery.yml`).
- Made the home gallery carousel preload window directional (`components/gallery.tsx`): the carousel now decodes the **next 2** slides ahead of the deterministic forward autoplay (plus 1 behind for back-swipes) instead of a symmetric ±1 ring, so every rotation swap shows an already-decoded image with no shimmer while still never mounting all full-size photos at once.
- Kept the first slide of every album decoded with an eager fetch (`eagerDecode` on the album jump-bar targets) so clicking a jump-bar chip lands on an already-loaded photo instead of a skeleton shimmer.
- Removed lazy client-only loading for the home Featured Artists section and switched to a direct import so artists render deterministically on dev/laptop without waiting on a deferred chunk placeholder.
- Mounted the Featured Artists section eagerly on the home page (instead of deferring it) so laptop/desktop navigation cannot land on a blank placeholder before artist cards render.
- Simplified Featured Artists rendering for low-compute devices by forcing the lightweight mobile-style card view when compute/network constraints are detected, preventing heavy desktop effects from blocking artist visibility.
- Documented the local-development terminal rule in `docs/RUNBOOK.md`: run `bun run dev` in a foreground terminal only (no detached/background process), and clear any existing port-3000 listener before restart.
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
