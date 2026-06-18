#!/usr/bin/env bash
# After the production build, start the built server briefly and crawl internal links for route smoke checks.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${VERIFY_ROUTES_PORT:-4310}"
MISSING_PATH="/__verify_missing_${RANDOM}_"
SERVER_TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/lupfr-verify-routes.XXXXXX")"
SERVER_LOG="${SERVER_TMP_DIR}/server.log"

echo "verify-routes: starting built Next server on port ${PORT}"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_LOG"
  rm -rf "$SERVER_TMP_DIR"
}
trap cleanup EXIT

bun run _serve -- -p "$PORT" >"$SERVER_LOG" 2>&1 &
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
  code="$(curl_status "$path" /dev/null)"
  if [[ "$code" != "200" ]]; then
    echo "verify-routes: FAIL ${path} -> HTTP ${code}"
    print_server_log
    exit 1
  fi
  echo "verify-routes: OK  ${path}"
}

fetch_html_200() {
  local path="$1"
  local output_file="$2"
  local code
  code="$(curl_status "$path" "$output_file")"
  if [[ "$code" != "200" ]]; then
    echo "verify-routes: FAIL ${path} -> HTTP ${code}"
    print_server_log
    exit 1
  fi
  echo "verify-routes: OK  ${path}"
}

check_404() {
  local path="$1"
  local code
  code="$(curl_status "$path" /dev/null)"
  if [[ "$code" != "404" ]]; then
    echo "verify-routes: FAIL ${path} expected 404 got HTTP ${code}"
    print_server_log
    exit 1
  fi
  echo "verify-routes: OK  ${path} (404)"
}

curl_status() {
  local path="$1"
  local output_file="$2"
  curl -sS -o "$output_file" -w '%{http_code}' "${BASE}${path}" || echo "curl-failed"
}

print_server_log() {
  if [[ -f "$SERVER_LOG" ]]; then
    echo "verify-routes: server log:"
    cat "$SERVER_LOG" || true
  fi
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

extract_external_links() {
  local html_path="$1"
  bun "$ROOT/scripts/extract-external-links.mjs" "$html_path"
}

# Realistic browser UA so social hosts do not reflexively bot-block the check.
EXTERNAL_UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
EXTERNAL_LINKS_FILE="${SERVER_TMP_DIR}/external-links.txt"
: > "$EXTERNAL_LINKS_FILE"

record_external_links() {
  local html_path="$1"
  local ext_url
  while IFS= read -r ext_url; do
    [[ -z "$ext_url" ]] && continue
    if ! grep -Fqx "$ext_url" "$EXTERNAL_LINKS_FILE"; then
      echo "$ext_url" >> "$EXTERNAL_LINKS_FILE"
    fi
  done < <(extract_external_links "$html_path")
}

curl_external_status() {
  local url="$1"
  local code rc
  code="$(curl -sS -L --max-time 20 -A "$EXTERNAL_UA" -o /dev/null -w '%{http_code}' "$url" 2>/dev/null)" || rc=$?
  rc="${rc:-0}"
  if [[ "$rc" -eq 28 ]]; then
    echo "timeout"
    return 0
  fi
  if [[ "$rc" -ne 0 || -z "$code" ]]; then
    echo "000"
    return 0
  fi
  echo "$code"
}

# Policy: a host that answers (even 401/403/405/429 bot-block) is "alive".
# Only DNS/connection failure, 404/410, or 5xx mean the link is genuinely dead.
check_external_link() {
  local url="$1"
  local code
  code="$(curl_external_status "$url")"
  case "$code" in
    000)
      echo "verify-routes: FAIL external ${url} -> no response (DNS/connection failure)"
      return 1
      ;;
    404 | 410)
      echo "verify-routes: FAIL external ${url} -> HTTP ${code} (dead link)"
      return 1
      ;;
    5*)
      echo "verify-routes: FAIL external ${url} -> HTTP ${code} (server error)"
      return 1
      ;;
    timeout)
      echo "verify-routes: WARN external ${url} -> timeout (treated as reachable)"
      return 0
      ;;
    *)
      echo "verify-routes: OK  external ${url} -> HTTP ${code}"
      return 0
      ;;
  esac
}

verify_external_links() {
  local total=0 failed=0 url
  while IFS= read -r url; do
    [[ -z "$url" ]] && continue
    total=$((total + 1))
    if ! check_external_link "$url"; then
      failed=$((failed + 1))
    fi
  done < "$EXTERNAL_LINKS_FILE"
  echo "verify-routes: checked ${total} external link(s), ${failed} failing."
  if [[ "$failed" -gt 0 ]]; then
    print_server_log
    exit 1
  fi
}

queue=("/")
seen_file="${SERVER_TMP_DIR}/seen-routes.txt"
echo "/" > "$seen_file"

while ((${#queue[@]})); do
  current_path="${queue[0]}"
  queue=("${queue[@]:1}")

  html_file="$(mktemp "${SERVER_TMP_DIR}/route.XXXXXX.html")"
  fetch_html_200 "$current_path" "$html_file"
  record_external_links "$html_file"

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

if [[ "${VERIFY_ROUTES_SKIP_EXTERNAL:-0}" == "1" ]]; then
  echo "verify-routes: skipping external link checks (VERIFY_ROUTES_SKIP_EXTERNAL=1)."
else
  echo "verify-routes: checking $(wc -l < "$EXTERNAL_LINKS_FILE" | tr -d ' ') external link(s) discovered during crawl."
  verify_external_links
fi
rm -f "$EXTERNAL_LINKS_FILE"

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
check_200 "/favicon/favicon.ico"
check_200 "/favicon-16x16.png"
check_200 "/favicon-32x32.png"
check_200 "/apple-touch-icon.png"
check_200 "/layout.css"
check_content_type "/layout.css" "text/css"

check_200 "/llms.txt"
check_content_type "/llms.txt" "text/plain"

check_404 "${MISSING_PATH}"
check_404 "/blog"
check_404 "/blog/disabled-route-check"
check_404 "/docs"
check_404 "/docs/overview"
check_404 "/README.md"
check_404 "/api.md"

echo "verify-routes: all checks passed."
