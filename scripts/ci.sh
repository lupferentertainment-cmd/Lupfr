#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${1:-ci}"
RUN_ID="${LUPFR_CI_RUN_ID:-$(date +%Y%m%d%H%M%S)-$$-${RANDOM}}"
CI_TMP_ROOT="${TMPDIR:-/tmp}/lupfr-ci/${RUN_ID}"
TSCONFIG_SNAPSHOT="${CI_TMP_ROOT}/tsconfig.json"
NEXT_ENV_SNAPSHOT="${CI_TMP_ROOT}/next-env.d.ts"

export NEXT_DIST_DIR=".next-ci/${RUN_ID}"
export VITEST_COVERAGE_DIR="${CI_TMP_ROOT}/coverage"

# Next.js rejects several IANA-reserved ports (e.g. 6669/ircu). Pick until safe.
_lupfr_pick_port() {
  local base="$1" span="$2" candidate=""
  for _ in $(seq 1 40); do
    candidate=$((base + RANDOM % span))
    case "$candidate" in
      6000|6665|6666|6667|6668|6669|6697) continue ;;
    esac
    echo "$candidate"
    return 0
  done
  echo $((base + 111))
}

export VERIFY_ROUTES_PORT="${VERIFY_ROUTES_PORT:-$(_lupfr_pick_port 4310 20000)}"
export VERIFY_ASSETS_PORT="${VERIFY_ASSETS_PORT:-$(_lupfr_pick_port 14310 5000)}"
export VERIFY_CONSOLE_PORT="${VERIFY_CONSOLE_PORT:-$(_lupfr_pick_port 24310 20000)}"
export VERIFY_NAV_SCROLL_PORT="${VERIFY_NAV_SCROLL_PORT:-$(_lupfr_pick_port 5310 8000)}"
export VERIFY_WILL_HOME_PORT="${VERIFY_WILL_HOME_PORT:-$(_lupfr_pick_port 4395 8000)}"
export VERIFY_ADMIN_PORT="${VERIFY_ADMIN_PORT:-$(_lupfr_pick_port 4396 8000)}"
export VERIFY_PARTNERS_MARQUEE_PORT="${VERIFY_PARTNERS_MARQUEE_PORT:-$(_lupfr_pick_port 4398 8000)}"
export VERIFY_MOBILE_PERF_PORT="${VERIFY_MOBILE_PERF_PORT:-$(_lupfr_pick_port 6310 8000)}"
export VITEST_MAX_WORKERS="${VITEST_MAX_WORKERS:-50%}"
export LUPFR_BLOCK_NEXT_DEV=1

restore_next_snapshots() {
  if [[ -f "$TSCONFIG_SNAPSHOT" ]]; then
    cp "$TSCONFIG_SNAPSHOT" "$ROOT/tsconfig.json"
  fi
  if [[ -f "$NEXT_ENV_SNAPSHOT" ]]; then
    cp "$NEXT_ENV_SNAPSHOT" "$ROOT/next-env.d.ts"
  fi
}

cleanup() {
  restore_next_snapshots
  rm -rf "$ROOT/.next-ci/${RUN_ID}" "$CI_TMP_ROOT"
}
trap cleanup EXIT

mkdir -p "$CI_TMP_ROOT"
cp tsconfig.json "$TSCONFIG_SNAPSHOT"
cp next-env.d.ts "$NEXT_ENV_SNAPSHOT"

run_static_quality() {
  bun run _lint
  if [[ "$MODE" == "ci" ]]; then
    bun run _coverage
  fi
}

run_build_checks() {
  bun run _build
  restore_next_snapshots
  bun run _verify:client-bundle
  restore_next_snapshots
  bun run _verify:bundle-budget
  restore_next_snapshots
}

run_route_checks() {
  # Route smoke boots `next start` and crawls it over HTTP. Skippable for build
  # sandboxes (e.g. Vercel's build step) that cannot host a server; GitHub Actions
  # runs it in full on every push.
  [[ "${LUPFR_SKIP_ROUTE_CHECK:-0}" != "1" ]] || return 0
  bun run _verify:routes
  restore_next_snapshots
}

run_asset_checks() {
  # Asset crawl also boots `next start`; same sandbox caveat as run_route_checks.
  [[ "$MODE" == "ci" && "${LUPFR_SKIP_ASSET_CRAWL:-0}" != "1" ]] || return 0
  bunx vitest run tests/integration/asset-crawl.test.ts
  restore_next_snapshots
}

run_browser_checks() {
  [[ "$MODE" == "ci" && "${LUPFR_SKIP_BROWSER_CHECK:-0}" != "1" ]] || return 0
  bun run _verify:console
  restore_next_snapshots
  bun run _verify:nav-scroll
  restore_next_snapshots
  bun run _verify:partners-marquee
  restore_next_snapshots
  bun run _verify:will-home
  restore_next_snapshots
  bun run _verify:admin
  restore_next_snapshots
  bun run _verify:mobile-perf
  restore_next_snapshots
}

bun scripts/optimize-public-raster.mjs check
bun scripts/clean-next-dist.mjs
bun run _test:smoke
run_static_quality
run_build_checks
run_route_checks
run_asset_checks
run_browser_checks
