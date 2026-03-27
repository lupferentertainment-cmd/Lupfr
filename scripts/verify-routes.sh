#!/usr/bin/env bash
# After `next build`, start production server briefly and HTTP-check key routes (CI + local parity with Vercel output).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${VERIFY_ROUTES_PORT:-4310}"
MISSING_PATH="/__verify_missing_${RANDOM}_"

echo "verify-routes: starting next start on port ${PORT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

bun run start -- -p "$PORT" >/tmp/lupfr-verify-routes-server.log 2>&1 &
SERVER_PID=$!

BASE="http://127.0.0.1:${PORT}"
for i in $(seq 1 60); do
  if curl -sf "${BASE}/" -o /dev/null; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "verify-routes: server exited early. Log:"
    cat /tmp/lupfr-verify-routes-server.log || true
    exit 1
  fi
  sleep 1
  if [[ "$i" -eq 60 ]]; then
    echo "verify-routes: timeout waiting for server. Log:"
    cat /tmp/lupfr-verify-routes-server.log || true
    exit 1
  fi
done

check_200() {
  local path="$1"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}${path}")"
  if [[ "$code" != "200" ]]; then
    echo "verify-routes: FAIL ${path} -> HTTP ${code}"
    exit 1
  fi
  echo "verify-routes: OK  ${path}"
}

check_404() {
  local path="$1"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "${BASE}${path}")"
  if [[ "$code" != "404" ]]; then
    echo "verify-routes: FAIL ${path} expected 404 got HTTP ${code}"
    exit 1
  fi
  echo "verify-routes: OK  ${path} (404)"
}

check_200 "/"

while IFS= read -r slug; do
  [[ -z "$slug" ]] && continue
  check_200 "/events/${slug}"
done < <(node -e "
const fs = require('fs');
const p = 'lib/data/generated/events.json';
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.forEach((e) => console.log(e.slug));
")

check_404 "${MISSING_PATH}"

echo "verify-routes: all checks passed."
