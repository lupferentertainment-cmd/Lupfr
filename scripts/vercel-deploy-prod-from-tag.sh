#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v vercel >/dev/null 2>&1; then
  echo "vercel-prod: Vercel CLI not found. Install it and run again."
  exit 1
fi

if ! command -v git >/dev/null 2>&1; then
  echo "vercel-prod: git is required."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "vercel-prod: working tree is dirty. Commit or stash changes before production deploy."
  exit 1
fi

tag_name="$(git describe --tags --exact-match 2>/dev/null || true)"
if [[ -z "$tag_name" ]]; then
  echo "vercel-prod: HEAD is not exactly on a git tag."
  echo "  checkout the tagged commit first, then rerun."
  exit 1
fi

echo "vercel-prod: deploying tagged release '${tag_name}'"

bash scripts/vercel-env-check.sh
bun run ci
vercel deploy --prod

echo "vercel-prod: complete for tag '${tag_name}'"
