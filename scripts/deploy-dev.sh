#!/usr/bin/env bash
# Push the current branch to the shared `dev` (staging) branch.
# Vercel builds a Preview deployment for `dev`; production (lupfr.com) is
# the `main` branch and is NOT touched by this script.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

current_branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$current_branch" == "main" ]]; then
  echo "deploy-dev: you are on 'main' (production)."
  echo "  Switch to a working branch first, e.g.: git checkout dev"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "deploy-dev: working tree is dirty. Commit your changes first."
  exit 1
fi

echo "deploy-dev: pushing '${current_branch}' -> origin/dev (staging preview)"
git push origin "HEAD:dev"

echo "deploy-dev: done. Open the Vercel project Deployments tab for the dev Preview URL."
