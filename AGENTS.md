# Lupfr — AI Agent Instructions (Codex, Claude, Cursor, Copilot, all agents)

Mandatory order for every task: **read docs → write plan → implement → verify.**
Never start with edits.

## 1. Docs first (authoritative spec)

Repo-root `docs/*.md` is the single authoritative spec. Code follows spec.
Before touching anything, read the doc(s) owning the area you change:

| Area | Read / update |
|------|----------------|
| Pages, layout, metadata, visual UX, privacy/terms, cookie bar | `docs/DESIGN.md`, `docs/ARCHITECTURE.md` |
| `app/api/*` routes, validation, rate limits | `docs/API.md`, `docs/REQUIREMENTS.md` |
| `data/`, generated JSON, gallery/events | `docs/ARCHITECTURE.md`, `docs/TESTING.md` |
| Env, Vercel, deploy scripts | `docs/DEPLOYMENT.md` |
| `proxy.ts`, security headers, blocked paths | `docs/ARCHITECTURE.md`, `docs/DEPLOYMENT.md`, `docs/OVERVIEW.md`, `docs/TESTING.md` |
| Product intent, stack summary | `docs/OVERVIEW.md` |

Canonical top-level set: OVERVIEW, ARCHITECTURE, DESIGN, REQUIREMENTS, API,
DEPLOYMENT, TESTING (plus CHANGELOG, RUNBOOK). Do not add new top-level spec
files; append sections inside the owning file.

## 2. Plan before doing anything

- For any non-trivial change, write **`tmp/plan.md`** BEFORE the first edit.
  One screen max, with sections: `## Will NOT Change`, `## Drift Risks`,
  `## Verification Plan`.
- Trivial one-line fixes: state the plan in chat as <=3 bullets instead —
  still only after consulting the owning doc.
- Do not expand scope beyond the written plan; update the plan first.

## 3. Same-change spec updates

If behavior, public contracts, env vars, or user-visible flows change, update
the owning `docs/*.md` (and `docs/CHANGELOG.md` under `[Unreleased]`) in the
same commit as the code. Code-only drift is a failure mode.

## 4. Hard guardrails

- `docs/` is **never** served over HTTP. Do not add `app/docs/**`,
  `public/docs/**`, or rewrites exposing spec files. `proxy.ts` must keep
  returning 404 for `/docs` and related patterns (`bun run verify:routes`).
- Package manager is **Bun** (`bun install`, `bun run <script>`, `bunx`).
  Do not introduce `package-lock.json`.
- Branch model: push to `dev` (staging/Preview) only; `main` is promoted via
  `bun run promote:prod` after review. Never force-push `main`.

## 5. Verify before claiming done

Run `bun run ci` from the repo root and fix failures. Work is not done until
it exits 0.

Cursor users: `.cursor/rules/lupfr-context-engineering.mdc` (always-on) and
its sibling rules define the same workflow in Cursor-native form.
