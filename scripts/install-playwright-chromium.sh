#!/usr/bin/env bash
# Install Playwright Chromium for the full gate (local optional; required on
# Vercel + GitHub Actions). Prefer --with-deps; fall back when the sandbox
# cannot install OS packages (common on some Vercel build images).
set -euo pipefail

if bunx playwright install --with-deps chromium; then
  exit 0
fi

echo "install-playwright-chromium: --with-deps failed; retrying chromium-only"
bunx playwright install chromium
