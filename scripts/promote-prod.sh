#!/usr/bin/env bash
set -euo pipefail

# promote:prod — fast-forward `main` to the validated `dev` commit so Vercel
# deploys production (lupfr.com). Refuses to run if main and dev have diverged,
# requires local HEAD to be the exact origin/dev commit, re-runs the canonical
# full gate (`bun run test`) against that commit, prints the exact commits
# being promoted, requires a typed "yes", and never force-pushes — production
# history is append-only.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v git >/dev/null 2>&1; then
  echo "promote-prod: git is required."
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "promote-prod: working tree is dirty. Commit or stash changes before promoting."
  exit 1
fi

echo "promote-prod: fetching origin"
git fetch origin

# Guard: main must be a strict ancestor of dev (clean fast-forward). If not,
# the branches have diverged and a human must reconcile them.
if ! git merge-base --is-ancestor origin/main origin/dev; then
  echo "promote-prod: refused — origin/main and origin/dev have diverged."
  echo "  reconcile dev onto main first (e.g. git rebase origin/main on dev), then rerun."
  exit 1
fi

commit_range="origin/main..origin/dev"
if [[ -z "$(git rev-list "$commit_range")" ]]; then
  echo "promote-prod: nothing to promote — origin/main already matches origin/dev."
  exit 0
fi

# Guard: the gate below runs against the local worktree, so local HEAD must be
# the exact origin/dev commit being promoted — otherwise tests would validate
# different code than what ships.
if [[ "$(git rev-parse HEAD)" != "$(git rev-parse origin/dev)" ]]; then
  echo "promote-prod: refused — local HEAD is not the origin/dev commit being promoted."
  echo "  check out the staged commit first:  git checkout dev && git reset --hard origin/dev"
  exit 1
fi

echo "promote-prod: running canonical full gate against origin/dev ($(git rev-parse --short origin/dev)) before production"
bun run test

echo "promote-prod: the following commits will be promoted from dev to production (main):"
echo "------------------------------------------------------------------------------------"
git --no-pager log --oneline "$commit_range"
echo "------------------------------------------------------------------------------------"

read -r -p "promote-prod: deploy these to PRODUCTION (lupfr.com)? type 'yes' to confirm: " reply
if [[ "$reply" != "yes" ]]; then
  echo "promote-prod: aborted. No changes pushed."
  exit 1
fi

# Fast-forward push only: push the dev commit onto main. The server rejects a
# non-fast-forward, so this can never rewrite production history.
echo "promote-prod: fast-forwarding main → $(git rev-parse --short origin/dev)"
if ! git push origin "origin/dev:main"; then
  echo "promote-prod: push rejected by remote. main may have advanced — rerun after fetching."
  exit 1
fi

echo "promote-prod: pushed to main. Vercel is now deploying production (lupfr.com)."
echo "promote-prod: sync your local main with:  git checkout main && git pull --ff-only origin main"
