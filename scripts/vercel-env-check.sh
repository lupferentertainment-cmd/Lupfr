#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel-env-check: Vercel CLI not found. Install it and run again."
  exit 1
fi

required_vars=(
  "GOOGLE_SHEETS_WEBHOOK_URL"
  "RESEND_API_KEY"
  "ADMIN_PASSWORD"
  "ADMIN_SESSION_SECRET"
)

environments=("preview" "production")
missing_total=0

for env_name in "${environments[@]}"; do
  echo "vercel-env-check: checking ${env_name}"
  env_list="$(vercel env ls "$env_name" 2>/dev/null || true)"

  if [[ -z "$env_list" ]]; then
    echo "vercel-env-check: unable to read '${env_name}' environment from Vercel."
    missing_total=$((missing_total + 1))
    continue
  fi

  for var_name in "${required_vars[@]}"; do
    if ! grep -q "^[[:space:]]*${var_name}[[:space:]]" <<< "$env_list"; then
      echo "vercel-env-check: missing ${var_name} in ${env_name}."
      echo "  add it with: vercel env add ${var_name} ${env_name}"
      missing_total=$((missing_total + 1))
    fi
  done

done

if (( missing_total > 0 )); then
  echo "vercel-env-check: failed. Add missing variables and rerun."
  exit 1
fi

echo "vercel-env-check: all required variables are present in preview and production."
