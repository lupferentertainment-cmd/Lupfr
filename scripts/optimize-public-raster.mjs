#!/usr/bin/env bun
/**
 * Standardize photos in public/ to WebP: same aspect ratio, optional downscale (cap width).
 * Excludes: public/favicon (fixed PNG/ICO for browsers), public/logos (Satori/OG + brand marks as PNG),
 *   and non-raster (svg, ico, mp4, m4a, webmanifest, txt).
 *
 * Usage:
 *   bun scripts/optimize-public-raster.mjs          # convert in place (writes .webp, removes source)
 *   bun scripts/optimize-public-raster.mjs check    # exit 1 if unconverted rasters remain
 *
 * After converting, run: bun run generate-data; update any hardcoded paths in app/components (see script output).
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const publicDir = path.join(root, "public")

/** Paths under public/ that must stay as authored (favicons, touch icons, logo PNG for OG). */
const EXCLUDE_DIR_PREFIXES = ["favicon", "logos"]

const RASTER_IN = new Set([".png", ".jpg", ".jpeg"])
const RASTER_OK = new Set([".webp"])

const MAX_WIDTH = 2560
const WEBP_QUALITY = 86
const WEBP_EFFORT = 4

function isExcluded(relPosix) {
  const first = relPosix.split("/")[0]
  return EXCLUDE_DIR_PREFIXES.includes(first)
}

/**
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walkFiles(dir) {
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const ent of entries) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      yield* walkFiles(p)
    } else {
      yield p
    }
  }
}

/**
 * @param {string} abs
 */
function toRelPosix(abs) {
  return path.relative(publicDir, abs).split(path.sep).join("/")
}

/**
 * @param {string} filePath
 */
function extOf(filePath) {
  return path.extname(filePath).toLowerCase()
}

/**
 * @returns {Promise<string[]>}
 */
async function listConvertibleRasters() {
  /** @type {string[]} */
  const out = []
  for await (const abs of walkFiles(publicDir)) {
    const rel = toRelPosix(abs)
    if (isExcluded(rel)) continue
    const ext = extOf(abs)
    if (RASTER_IN.has(ext)) {
      out.push(abs)
    }
  }
  return out.sort()
}

/**
 * @param {string} inPath
 */
async function convertOne(inPath) {
  const dir = path.dirname(inPath)
  const base = path.basename(inPath, path.extname(inPath))
  const outPath = path.join(dir, `${base}.webp`)
  const relIn = toRelPosix(inPath)
  const relOut = toRelPosix(outPath)

  let existingOut = false
  try {
    await fs.access(outPath)
    existingOut = true
  } catch {
    existingOut = false
  }
  if (existingOut) {
    const inStat = await fs.stat(inPath)
    const outStat = await fs.stat(outPath)
    if (inStat.mtimeMs <= outStat.mtimeMs) {
      await fs.unlink(inPath)
      console.log(`optimize-public: removed stale source ${relIn} (kept ${relOut})`)
      return
    }
  }

  await sharp(inPath)
    .rotate()
    .resize({
      width: MAX_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
    .toFile(outPath)

  await fs.unlink(inPath)
  console.log(`optimize-public: ${relIn} -> ${relOut}`)
}

async function check() {
  const files = await listConvertibleRasters()
  if (files.length === 0) {
    console.log("public-raster: OK (no PNG/JPEG to convert under public/, excluding favicon/ logos/)")
    return
  }
  console.error("public-raster: convert these to WebP (or add to exclusions in scripts/optimize-public-raster.mjs):")
  for (const f of files) {
    console.error(`  - /${toRelPosix(f)}`)
  }
  console.error('Run: bun run public:images:optimize  then bun run generate-data and commit path updates in YAML/app.')
  process.exit(1)
}

async function main() {
  const mode = process.argv[2] === "check" ? "check" : "convert"
  if (mode === "check") {
    await check()
    return
  }
  const files = await listConvertibleRasters()
  if (files.length === 0) {
    console.log("optimize-public: nothing to convert.")
    return
  }
  for (const f of files) {
    await convertOne(f)
  }
  console.log("optimize-public: done. Next: update data/*.yml + any hardcoded paths, then bun run generate-data")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
