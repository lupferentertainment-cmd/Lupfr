# Testing

**Current state.** There is no Jest/Vitest unit suite yet. **CI** (GitHub Actions) runs ESLint, a full Next production build, and **route smoke** (`scripts/verify-routes.sh` via `bun run verify:routes`). **Local/pre-commit:** `scripts/pre-commit` runs `bun run lint` and `bun run build` before each commit (installed via `prepare`).

**Definition of done (when tests exist).** A feature is not done until: (1) the feature is explicitly tested and passing; (2) core integration paths (e.g. load home, submit contact form) are covered to avoid regressions; (3) any code that writes files (e.g. generate-data) is tested with real writes and schema/format checks where appropriate.

**Strategy.** Prefer small, focused tests; verify integration before hand-off. Tests must import from `src/` or the actual app entrypoints (e.g. `app/`, `lib/`) and must not mock logic that should be integrated unless explicitly approved.

**Commands.**

- `bun run lint` – ESLint.
- `bun run build` – `generate-data` + `next build` (compile + static pages).
- `bun run verify:routes` – requires a prior successful build; HTTP-checks `/`, all event detail URLs, and confirms a bogus path returns 404.
- `bun run verify` – lint, build, then `verify:routes` (full local CI parity).

**Suggested scope (future).**

- **Data pipeline:** `scripts/generate-data.js` – given `data/*.yml`, output JSON in `lib/data/generated/` with expected shape.
- **API routes:** POST `/api/contact` and POST `/api/newsletter` – required fields, validation, and behavior when Resend is missing or fails (expect 500/502 and explicit error body).
- **Smoke:** Home page and event detail page render without error; key sections present.

**Docs.** Any addition or change to test patterns or coverage expectations must be reflected in this file.
