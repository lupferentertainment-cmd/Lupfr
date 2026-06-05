#!/usr/bin/env node
// Bun-only install guard.
//
// Why this exists: a foreign package manager (pnpm/npm/yarn) rebuilds
// node_modules in a layout whose duplicated React copies do not share the
// same internals object. Under Next.js dev that surfaces as the crash
// "Cannot read properties of undefined (reading 'recentlyCreatedOwnerStacks')".
// This repo declares bun (packageManager + bun.lock + vercel installCommand),
// so block every non-bun install at the door.

const FORBIDDEN = ["pnpm", "npm", "yarn"]

function _get_pm() {
  const ua = process.env.npm_config_user_agent || ""
  return FORBIDDEN.find((name) => ua.startsWith(`${name}/`)) || ""
}

function _fmt_fail(pm) {
  return [
    "",
    `\u2716 This project is bun-only. Detected "${pm}".`,
    "  Use: bun install",
    "  (Foreign lockfiles corrupt the React/Next module tree.)",
    "",
  ].join("\n")
}

const offender = _get_pm()
if (offender) {
  console.error(_fmt_fail(offender))
  process.exit(1)
}
