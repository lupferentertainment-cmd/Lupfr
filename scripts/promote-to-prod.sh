#!/usr/bin/env bash
# Promote the tested `dev` branch to `main` (production -> lupfr.com).
# This is a NON-FORCE fast-forward of main to dev's tip: it can only move
# main forward over commits that already exist on dev. It can never lose
# production history, and it refuses to run if main and dev have diverged.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "promote-to-prod: fetching latest refs"
git fetch --quiet origin main dev

main_sha="$(git rev-parse origin/main)"
dev_sha="$(git rev-parse origin/dev)"

if [[ "$main_sha" == "$dev_sha" ]]; then
  echo "promote-to-prod: origin/main already matches origin/dev. Nothing to promote."
  exit 0
fi

if ! git merge-base --is-ancestor "$main_sha" "$dev_sha"; then
  echo "promote-to-prod: REFUSING — origin/main has commits not on origin/dev (diverged)."
  echo "  Merge main into dev first:  git checkout dev && git merge origin/main"
  echo "  Re-test the dev Preview, then run this again."
  exit 1
fi

echo "promote-to-prod: commits to ship to production:"
git --no-pager log --oneline "${main_sha}..${dev_sha}"

read -r -p "Promote these to PRODUCTION (lupfr.com)? type 'yes' to continue: " answer
if [[ "$answer" != "yes" ]]; then
  echo "promote-to-prod: aborted. Nothing changed."
  exit 1
fi

echo "promote-to-prod: fast-forwarding origin/main -> ${dev_sha}"
git push origin "origin/dev:refs/heads/main"

echo "promote-to-prod: done. Vercel will build the production deployment for main."
