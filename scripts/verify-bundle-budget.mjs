#!/usr/bin/env bun
import { access, readFile, stat } from "node:fs/promises"
import { join } from "node:path"

const rootDir = process.cwd()
const distDir = process.env.NEXT_DIST_DIR ?? ".next"
const distRoot = join(rootDir, distDir)
const budgetsPath = join(rootDir, "tests/performance/mobile-budgets.json")
const HOME_PAGE_KEYS = new Set(["/page", "/"])

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function fail(message) {
  console.error(message)
  process.exit(1)
}

function normalizeChunkPath(raw) {
  const trimmed = String(raw).trim()
  if (!trimmed) return null
  const withoutOrigin = trimmed.replace(/^https?:\/\/[^/]+/i, "")
  const withoutNext = withoutOrigin.replace(/^\/_next\//, "").replace(/^_next\//, "")
  const relative = withoutNext.replace(/^\//, "")
  if (!relative.endsWith(".js")) return null
  if (!relative.startsWith("static/")) return null
  return relative
}

function collectStringChunks(value, into) {
  if (typeof value === "string") {
    const chunk = normalizeChunkPath(value)
    if (chunk) into.add(chunk)
    return
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectStringChunks(entry, into)
    return
  }
  if (value && typeof value === "object") {
    for (const entry of Object.values(value)) collectStringChunks(entry, into)
  }
}

function homePageFilesFromAppBuildManifest(manifest) {
  const pages = manifest?.pages
  if (!pages || typeof pages !== "object") return null
  const keys = Object.keys(pages).filter((key) => HOME_PAGE_KEYS.has(key))
  if (keys.length === 0) return null
  const files = new Set()
  for (const key of keys) collectStringChunks(pages[key], files)
  // Shared runtime often lives beside pages; include when present.
  collectStringChunks(manifest.polyfillFiles, files)
  collectStringChunks(manifest.rootMainFiles, files)
  collectStringChunks(manifest.lowPriorityFiles, files)
  return files
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"))
}

async function chunksFromAppBuildManifest() {
  const manifestPath = join(distRoot, "app-build-manifest.json")
  if (!(await pathExists(manifestPath))) return null
  const manifest = await readJson(manifestPath)
  const files = homePageFilesFromAppBuildManifest(manifest)
  if (!files || files.size === 0) {
    fail(
      `bundle-budget: ${distDir}/app-build-manifest.json has no home route entry ("/page" or "/")`,
    )
  }
  return { files, source: `${distDir}/app-build-manifest.json` }
}

async function chunksFromTurbopackHomeManifests() {
  const pageBuildManifestPath = join(distRoot, "server/app/page/build-manifest.json")
  const clientRefPath = join(distRoot, "server/app/page_client-reference-manifest.js")
  const files = new Set()

  if (await pathExists(pageBuildManifestPath)) {
    const manifest = await readJson(pageBuildManifestPath)
    collectStringChunks(manifest.polyfillFiles, files)
    collectStringChunks(manifest.rootMainFiles, files)
    collectStringChunks(manifest.lowPriorityFiles, files)
    collectStringChunks(manifest.pages?.["/page"] ?? manifest.pages?.["/"], files)
  }

  if (await pathExists(clientRefPath)) {
    const source = await readFile(clientRefPath, "utf8")
    for (const match of source.matchAll(/\/_next\/(static\/chunks\/[^"'\\\s]+\.js)/g)) {
      files.add(match[1])
    }
    for (const match of source.matchAll(/["'](static\/chunks\/[^"'\\\s]+\.js)["']/g)) {
      files.add(match[1])
    }
  }

  if (files.size === 0) return null
  return {
    files,
    source: `${distDir}/server/app/page/build-manifest.json + page_client-reference-manifest.js`,
  }
}

async function resolveHomeChunks() {
  const fromApp = await chunksFromAppBuildManifest()
  if (fromApp) return fromApp
  const fromTurbo = await chunksFromTurbopackHomeManifests()
  if (fromTurbo) return fromTurbo
  fail(
    `bundle-budget: missing home First Load JS manifests under ${distDir} (expected app-build-manifest.json or server/app/page build + client-reference manifests after a production build)`,
  )
}

async function sumChunkBytes(files) {
  let total = 0
  const missing = []
  for (const relative of [...files].sort()) {
    const absolute = join(distRoot, relative)
    try {
      total += (await stat(absolute)).size
    } catch {
      missing.push(relative)
    }
  }
  if (missing.length > 0) {
    fail(`bundle-budget: missing chunk file(s) under ${distDir}: ${missing.join(", ")}`)
  }
  return total
}

async function runBundleBudgetCheck() {
  if (!(await pathExists(distRoot))) {
    fail(`bundle-budget: dist dir missing (${distDir}); run a production build first`)
  }

  const budgets = await readJson(budgetsPath)
  const budget = budgets.firstLoadJsBytes
  if (!Number.isFinite(budget) || budget <= 0) {
    fail(`bundle-budget: invalid firstLoadJsBytes in ${budgetsPath}`)
  }

  const { files, source } = await resolveHomeChunks()
  const bytes = await sumChunkBytes(files)
  const line = `bundle-budget: First Load JS for / = ${bytes} bytes (budget ${budget})`
  console.log(line)
  console.log(`bundle-budget: ${files.size} chunks from ${source}`)

  if (bytes > budget) {
    fail(`bundle-budget: FAIL (${bytes} > ${budget})`)
  }
  console.log("bundle-budget: OK")
}

runBundleBudgetCheck().catch((error) => {
  console.error(`bundle-budget: failed: ${error.message}`)
  process.exit(1)
})
