#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RUN_ID="${LUPFR_CI_RUN_ID:-$(date +%Y%m%d%H%M%S)-$$-${RANDOM}}"
CI_TMP_ROOT="${TMPDIR:-/tmp}/lupfr-ci/${RUN_ID}"
TSCONFIG_SNAPSHOT="${CI_TMP_ROOT}/tsconfig.json"
NEXT_ENV_SNAPSHOT="${CI_TMP_ROOT}/next-env.d.ts"

export NEXT_DIST_DIR=".next-ci/${RUN_ID}"
export VITEST_COVERAGE_DIR="${CI_TMP_ROOT}/coverage"
export VERIFY_ROUTES_PORT="${VERIFY_ROUTES_PORT:-$((4310 + RANDOM % 20000))}"

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

bun run lint
bun run coverage
bun run build
restore_next_snapshots
bun run verify:routes
restore_next_snapshots
