#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "vercel-preview: validating required Vercel environment variables"
bash scripts/vercel-env-check.sh

echo "vercel-preview: running local CI"
bun run ci

echo "vercel-preview: deploying preview"
vercel deploy

echo "vercel-preview: complete"
