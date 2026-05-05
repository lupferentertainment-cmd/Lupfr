#!/usr/bin/env bash
# After `bun run build` (`bunx --bun next build`), start production server briefly and crawl internal links for route smoke checks.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${VERIFY_ROUTES_PORT:-4310}"
MISSING_PATH="/__verify_missing_${RANDOM}_"
SERVER_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/lupfr-verify-routes.XXXXXX")"
SERVER_LOG="${SERVER_TMP_DIR}/server.log"

echo "verify-routes: starting bun run start (next start via Bun) on port ${PORT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_LOG"
  rm -rf "$SERVER_TMP_DIR"
}
trap cleanup EXIT

bun run start -- -p "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

BASE="http://127.0.0.1:${PORT}"
for i in $(seq 1 60); do
  if curl -sf "${BASE}/" -o /dev/null; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "verify-routes: server exited early. Log:"
    cat "$SERVER_LOG" || true
    exit 1
  fi
  sleep 1
  if [[ "$i" -eq 60 ]]; then
    echo "verify-routes: timeout waiting for server. Log:"
    cat "$SERVER_LOG" || true
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

check_content_type() {
  local path="$1"
  local expected_substring="$2"
  local content_type
  content_type="$(curl -sS -I "${BASE}${path}" | awk -F': ' 'tolower($1)=="content-type" {print tolower($2); exit}' | tr -d '\r')"
  if [[ -z "$content_type" || "$content_type" != *"${expected_substring}"* ]]; then
    echo "verify-routes: FAIL ${path} expected content-type containing '${expected_substring}' got '${content_type:-<empty>}'"
    exit 1
  fi
  echo "verify-routes: OK  ${path} content-type ${content_type}"
}

extract_internal_routes() {
  local current_path="$1"
  local html_path="$2"
  bun "$ROOT/scripts/extract-internal-routes.mjs" "$current_path" "$html_path"
}

queue=("/")
seen_file="${SERVER_TMP_DIR}/seen-routes.txt"
echo "/" > "$seen_file"

while ((${#queue[@]})); do
  current_path="${queue[0]}"
  queue=("${queue[@]:1}")

  html_file="$(mktemp "${SERVER_TMP_DIR}/route.XXXXXX.html")"
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

check_200 "/robots.txt"
check_content_type "/robots.txt" "text/plain"

check_200 "/sitemap.xml"
check_content_type "/sitemap.xml" "xml"

check_200 "/site.webmanifest"
check_content_type "/site.webmanifest" "json"

check_200 "/opengraph-image"
check_content_type "/opengraph-image" "image/png"

check_200 "/twitter-image"
check_content_type "/twitter-image" "image/png"

check_200 "/favicon.ico"
check_200 "/favicon-16x16.png"
check_200 "/favicon-32x32.png"
check_200 "/apple-touch-icon.png"

check_200 "/llms.txt"
check_content_type "/llms.txt" "text/plain"

check_404 "${MISSING_PATH}"
check_404 "/docs"
check_404 "/docs/overview"
check_404 "/README.md"
check_404 "/api.md"

echo "verify-routes: all checks passed."
