#!/usr/bin/env bash
# After `bun run build` (`bunx --bun next build`), start production server briefly and crawl internal links for route smoke checks.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${VERIFY_ROUTES_PORT:-4310}"
MISSING_PATH="/__verify_missing_${RANDOM}_"

echo "verify-routes: starting bun run start (next start via Bun) on port ${PORT}"

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

fetch_html_200() {
  local path="$1"
  local output_file="$2"
  local code
  code="$(curl -sS -o "$output_file" -w '%{http_code}' "${BASE}${path}")"
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

extract_internal_routes() {
  local current_path="$1"
  local html_path="$2"
  bun "$ROOT/scripts/extract-internal-routes.mjs" "$current_path" "$html_path"
}

queue=("/")
seen_file="$(mktemp)"
echo "/" > "$seen_file"

while ((${#queue[@]})); do
  current_path="${queue[0]}"
  queue=("${queue[@]:1}")

  html_file="$(mktemp)"
  fetch_html_200 "$current_path" "$html_file"

  while IFS= read -r discovered_path; do
    [[ -z "$discovered_path" ]] && continue
    if ! grep -Fqx "$discovered_path" "$seen_file"; then
      echo "$discovered_path" >> "$seen_file"
      queue+=("$discovered_path")
    fi
  done < <(extract_internal_routes "$current_path" "$html_file")

  rm -f "$html_file"
done

echo "verify-routes: crawled $(wc -l < "$seen_file" | tr -d ' ') internal route(s)."
rm -f "$seen_file"

check_404 "${MISSING_PATH}"
check_404 "/docs"
check_404 "/docs/overview"
check_404 "/README.md"
check_404 "/api.md"

echo "verify-routes: all checks passed."
