# Testing

**Current state.** The repo now has lightweight **Vitest** unit + integration tests with coverage enforcement, plus existing lint/build/route-smoke checks.

**Coverage policy.** Coverage thresholds are enforced in `vitest.config.ts`:

- Statements: `>= 60%`
- Functions: `>= 60%`
- Lines: `>= 60%`
- Branches: `>= 50%`

This keeps coverage in the requested `60-80%` quality band while staying lightweight.

**Test suites.**

- `tests/unit/contact-input.test.ts` – sanitization and phone/email validation rules.
- `tests/unit/rate-limit.test.ts` – per-key request limiting behavior and window reset.
- `tests/unit/cookie-consent.test.ts` – consent storage and custom event on accept.
- `tests/unit/gallery-album.test.ts` – `GALLERY_PHOTOS` `albumFolder` / `albumBreadcrumb` / `dateISO` for canonical folders (e.g. `boiler_boat_003`, `where_is_west` under `public/gallery/`), plus `GALLERY_HOME_ALBUM_FOLDERS` and `getGalleryPhotosByAlbumFolder`.
- `tests/unit/data-integrity.test.ts` – fast guardrails: gallery default folders map to **one** event per `dateISO` and breadcrumb matches `events.yml` `title`; every `GALLERY_PHOTOS` file and every event hero path exists under `public/`; home album folders are non-empty and have `public/gallery/<folder>/`.
- `tests/unit/gallery-date.test.ts` – `isValidGalleryDateISO`, `formatGalleryDateLabel`, and `groupGalleryByDateISO` (archive ordering).
- `tests/unit/gallery-nav.test.ts` – `galleryPhotoHref` and `?from=` helpers for `/gallery` vs `#gallery` entry context.
- `tests/unit/events-list.test.ts` – `getUpcomingEvents` / `getPastEvents` sort order (`dateISO` ascending for upcoming with TBD last; newest-first for past).
- `tests/integration/phone-list-route.test.ts` – API validation (name required; **email and/or phone**); webhook JSON omits empty contact fields; optional `GOOGLE_SHEETS_SECRET` and `GOOGLE_SHEETS_SECRET_FIELD` in the forwarded JSON; invalid JSON / missing webhook URL / upstream fetch failure; and 429 protection.
- `tests/unit/vercel-shell-scripts.test.ts` – `scripts/vercel-*.sh` exist and pass `bash -n` (syntax check).
- `tests/integration/contact-route.test.ts` – contact API validation, mail send path, and 429 protection.
- `tests/integration/newsletter-route.test.ts` – newsletter API validation, dual-send behavior, and 429 protection.

**Commands.**

- `bun run test` – run Vitest suite.
- `bun run test:precommit` – run `data-integrity.test.ts` only (also invoked at the start of `bun run precommit` and `scripts/pre-commit`).
- `bun run coverage` – run Vitest with coverage + thresholds.
- `bun run lint` – ESLint.
- `bun run build` – `generate-data` + `next build`.
- `bun run verify:routes` – production route smoke checks.
- `bun run verify` – lint + build + route smoke.
- `bun run ci` – lint + coverage + build + route smoke.
- `bun run ci:vercel` – coverage + build (used by Vercel build command).
- `bun run public:images:check` – fails if `public/` still has non-favicon, non-logo JPEG/PNG that should be WebP (same as the pre-commit raster gate).
- `bun run public:images:optimize` – convert those rasters to WebP in place, then update `data/*.yml` paths and run `bun run generate-data`.

**Vercel enforcement.** `vercel.json` uses `buildCommand: "bun run ci:vercel"`, so Preview and Production deployments fail if tests/coverage fail.

**Docs.** Any change to test scope, thresholds, or CI commands must be reflected in this file.
