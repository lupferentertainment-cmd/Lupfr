#!/usr/bin/env bun
import { readdir, readFile } from "node:fs/promises"
import { join, relative } from "node:path"

const rootDir = process.cwd()
const distDir = process.env.NEXT_DIST_DIR ?? ".next"
const chunkDir = join(rootDir, distDir, "static", "chunks")
const checks = [
  {
    label: "bare shinePosition client reference",
    pattern: /(^|[,{(])\s*shinePosition\s*([,})])/,
  },
  {
    label: "retired shinePositionDelayed client reference",
    pattern: /shinePositionDelayed/,
  },
]

async function getJsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map((entry) => getEntryFiles(dir, entry)))
  return nested.flat()
}

async function getEntryFiles(dir, entry) {
  const entryPath = join(dir, entry.name)
  if (entry.isDirectory()) return getJsFiles(entryPath)
  if (entry.isFile() && entryPath.endsWith(".js")) return [entryPath]
  return []
}

async function getFileFailures(filePath) {
  const source = await readFile(filePath, "utf8")
  return checks.filter((check) => check.pattern.test(source)).map((check) => ({ check, filePath }))
}

function fmtFailure({ check, filePath }) {
  return `client-bundle: ${check.label} in ${relative(rootDir, filePath)}`
}

async function runClientBundleCheck() {
  const files = await getJsFiles(chunkDir)
  const failures = (await Promise.all(files.map(getFileFailures))).flat()
  if (failures.length === 0) return console.log(`client-bundle: OK (${files.length} JS chunks scanned)`)
  console.error(failures.map(fmtFailure).join("\n"))
  process.exit(1)
}

runClientBundleCheck().catch((error) => {
  console.error(`client-bundle: failed to scan ${distDir} client chunks: ${error.message}`)
  process.exit(1)
})
