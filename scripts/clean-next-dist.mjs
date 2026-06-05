#!/usr/bin/env bun
import { execFileSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { relative, resolve, sep } from "node:path"

const rootDir = process.cwd()
const distDir = process.env.NEXT_DIST_DIR ?? ".next"
const targetDir = resolve(rootDir, distDir)
const defaultDistDir = resolve(rootDir, ".next")

function isInsideRoot(pathname) {
  const rel = relative(rootDir, pathname)
  return rel !== "" && !rel.startsWith("..") && !rel.includes(`..${sep}`)
}

function getActiveDevLines() {
  try {
    return execFileSync("ps", ["-axo", "command"], { encoding: "utf8" })
      .split("\n")
      .filter(isNextDevCommand)
  } catch (error) {
    console.warn(`clean-next-dist: could not inspect dev processes: ${error.message}`)
    return []
  }
}

function isNextDevCommand(line) {
  if (!line.includes(rootDir)) return false
  if (!line.includes("next dev")) return false
  return line.includes("/node_modules/.bin/next") || line.includes("/node_modules/next/") || line.includes("/next/dist/bin/next")
}

function assertSafeTarget() {
  if (isInsideRoot(targetDir)) return
  console.error(`clean-next-dist: refusing to clean outside repo: ${targetDir}`)
  process.exit(1)
}

function assertNoActiveDev() {
  const lines = getActiveDevLines()
  const blocksAnyDist = process.env.LUPFR_BLOCK_NEXT_DEV === "1"
  if ((!blocksAnyDist && targetDir !== defaultDistDir) || lines.length === 0) return
  console.error("clean-next-dist: stop next dev before running production build or full verification")
  process.exit(1)
}

function rmDistDir() {
  if (!existsSync(targetDir)) return
  rmSync(targetDir, { recursive: true, force: true })
  console.log(`clean-next-dist: removed ${relative(rootDir, targetDir)}`)
}

assertSafeTarget()
assertNoActiveDev()
rmDistDir()
