#!/usr/bin/env bash
set -euo pipefail

# ship:dev — push the current commit to the `dev` branch so Vercel builds the
# staging Preview deployment. Runs the full local gate first, then force-pushes
# to origin/dev (dev is staging-only; force-overwrite is intentional and safe).
# Never touches origin/main (production).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "ship-dev: git is required."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ship-dev: working tree is dirty. Commit or stash changes before shipping to dev."
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"
echo "ship-dev: shipping '${current_branch}' (HEAD $(git rev-parse --short HEAD)) to origin/dev"

echo "ship-dev: running canonical full gate before staging"
bun run test

echo "ship-dev: fetching origin"
git fetch origin

# Force-push to dev (staging branch). dev is intentionally overwritten with
# whatever is in HEAD; it is never the source of production history.
if ! git push origin "HEAD:dev" --force; then
  echo "ship-dev: push to origin/dev failed."
  exit 1
fi

echo "ship-dev: pushed. Vercel is now building the staging Preview for branch 'dev'."
echo "ship-dev: find the Preview URL in Vercel → project 'lupfr' → Deployments (the 'dev' entry)."
echo "ship-dev: SEO/Lighthouse audits on protected previews need a Vercel share link or automation bypass; run public indexing checks on https://lupfr.com after promotion."
