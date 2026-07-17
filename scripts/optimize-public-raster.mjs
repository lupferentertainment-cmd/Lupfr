#!/usr/bin/env bun
/**
 * Standardize photos in public/ to WebP: same aspect ratio, optional downscale (cap width).
 * Excludes: favicon PNG/ICO files, public/favicon (fixed PNG/ICO for browsers), public/logos (Satori/OG + brand marks as PNG),
 *   and non-raster (svg, ico, mp4, m4a, webmanifest, txt).
 *
 * Also guards event/artist card WebPs: max width CARD_MAX_WIDTH and max bytes CARD_MAX_BYTES
 * (oversized sources keep mobile shimmer alive via cold image-optimizer + decode).
 *
 * Usage:
 *   bun scripts/optimize-public-raster.mjs          # convert PNG/JPEG + re-encode oversized card WebPs
 *   bun scripts/optimize-public-raster.mjs check    # exit 1 if unconverted rasters or oversized card WebPs remain
 *
 * After converting, run: bun run test; update any hardcoded paths in app/components (see script output).
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
const EXCLUDE_FILE_NAMES = new Set(["apple-touch-icon.png", "favicon-16x16.png", "favicon-32x32.png"])

/** Card image folders shown at ~300–600 CSS px — keep sources lean for mobile decode. */
const CARD_DIRS = new Set(["events", "artists", "brands"])

const RASTER_IN = new Set([".png", ".jpg", ".jpeg"])
const RASTER_OK = new Set([".webp"])

const MAX_WIDTH = 2560
const WEBP_QUALITY = 86
const WEBP_EFFORT = 4

/** Event/artist card WebP caps (display size ≪ this; larger sources only hurt cold optimizer). */
const CARD_MAX_WIDTH = 1600
const CARD_MAX_BYTES = 450_000
const CARD_WEBP_QUALITY = 80

function isExcluded(relPosix) {
  const first = relPosix.split("/")[0]
  return EXCLUDE_DIR_PREFIXES.includes(first) || EXCLUDE_FILE_NAMES.has(relPosix)
}

/**
 * @param {string} relPosix
 */
function isCardWebp(relPosix) {
  const parts = relPosix.split("/")
  return parts.length === 2 && CARD_DIRS.has(parts[0]) && extOf(relPosix) === ".webp"
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
 * @returns {Promise<string[]>}
 */
async function listCardWebps() {
  /** @type {string[]} */
  const out = []
  for await (const abs of walkFiles(publicDir)) {
    const rel = toRelPosix(abs)
    if (isExcluded(rel)) continue
    if (isCardWebp(rel)) {
      out.push(abs)
    }
  }
  return out.sort()
}

/**
 * @param {string} abs
 * @returns {Promise<{ abs: string, rel: string, bytes: number, width: number, height: number, oversize: boolean }>}
 */
async function inspectCardWebp(abs) {
  const rel = toRelPosix(abs)
  const stat = await fs.stat(abs)
  const meta = await sharp(abs).metadata()
  const width = meta.width ?? 0
  const height = meta.height ?? 0
  const bytes = stat.size
  const oversize = width > CARD_MAX_WIDTH || bytes > CARD_MAX_BYTES
  return { abs, rel, bytes, width, height, oversize }
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

/**
 * Re-encode an oversized event/artist card WebP in place.
 * Steps quality down, then width, until under CARD_MAX_BYTES (cards display ~300–600 CSS px).
 * @param {string} abs
 */
async function reencodeCardWebp(abs) {
  const before = await inspectCardWebp(abs)
  const fmt = (n) => `${(n / 1024).toFixed(1)}KB`
  const input = await fs.readFile(abs)

  let quality = CARD_WEBP_QUALITY
  let maxWidth = CARD_MAX_WIDTH
  /** @type {Buffer} */
  let best = input
  let bestWidth = before.width
  let bestHeight = before.height

  for (;;) {
    const pipeline = sharp(input)
      .rotate()
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
      })
      .webp({ quality, effort: WEBP_EFFORT })

    const buf = await pipeline.toBuffer({ resolveWithObject: true })
    best = buf.data
    bestWidth = buf.info.width
    bestHeight = buf.info.height

    if (best.length <= CARD_MAX_BYTES) {
      break
    }
    if (quality > 55) {
      quality -= 5
      continue
    }
    if (maxWidth > 1200) {
      maxWidth -= 200
      quality = CARD_WEBP_QUALITY
      continue
    }
    break
  }

  await fs.writeFile(abs, best)
  console.log(
    `optimize-public: card ${before.rel} ${before.width}x${before.height} ${fmt(before.bytes)} -> ${bestWidth}x${bestHeight} ${fmt(best.length)} (q${quality}, maxW${maxWidth})`,
  )
  if (best.length > CARD_MAX_BYTES || bestWidth > CARD_MAX_WIDTH) {
    throw new Error(
      `optimize-public: ${before.rel} still over card budget after re-encode (${bestWidth}px, ${best.length} bytes)`,
    )
  }
}

async function check() {
  let failed = false

  const files = await listConvertibleRasters()
  if (files.length > 0) {
    failed = true
    console.error("public-raster: convert these to WebP (or add to exclusions in scripts/optimize-public-raster.mjs):")
    for (const f of files) {
      console.error(`  - /${toRelPosix(f)}`)
    }
    console.error("Run: bun run _images:optimize  then bun run test and commit path updates in YAML/app.")
  }

  /** @type {Awaited<ReturnType<typeof inspectCardWebp>>[]} */
  const oversized = []
  for (const abs of await listCardWebps()) {
    const info = await inspectCardWebp(abs)
    if (info.oversize) oversized.push(info)
  }
  if (oversized.length > 0) {
    failed = true
    console.error(
      `public-raster: oversized event/artist card WebPs (max ${CARD_MAX_WIDTH}px wide or ${CARD_MAX_BYTES} bytes):`,
    )
    for (const info of oversized) {
      console.error(`  - /${info.rel} (${info.width}x${info.height}, ${info.bytes} bytes)`)
    }
    console.error("Run: bun run _images:optimize  to re-encode card WebPs in place.")
  }

  if (failed) {
    process.exit(1)
  }
  console.log(
    `public-raster: OK (no PNG/JPEG to convert; event/artist card WebPs ≤${CARD_MAX_WIDTH}px and ≤${CARD_MAX_BYTES} bytes)`,
  )
}

async function main() {
  const mode = process.argv[2] === "check" ? "check" : "convert"
  if (mode === "check") {
    await check()
    return
  }

  const files = await listConvertibleRasters()
  if (files.length === 0) {
    console.log("optimize-public: nothing to convert from PNG/JPEG.")
  } else {
    for (const f of files) {
      await convertOne(f)
    }
  }

  let cardCount = 0
  for (const abs of await listCardWebps()) {
    const info = await inspectCardWebp(abs)
    if (!info.oversize) continue
    await reencodeCardWebp(abs)
    cardCount += 1
  }
  if (cardCount === 0) {
    console.log("optimize-public: no oversized event/artist card WebPs.")
  } else {
    console.log(`optimize-public: re-encoded ${cardCount} card WebP(s).`)
  }

  console.log("optimize-public: done. Next: update data/*.yml + any hardcoded paths, then bun run test")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
