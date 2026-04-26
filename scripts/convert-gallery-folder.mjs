#!/usr/bin/env bun
/**
 * Convert all .jpg/.jpeg in a subfolder of public/gallery/ to .webp and remove sources.
 * Usage: bun scripts/convert-gallery-folder.mjs where_is_west_004
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERY_ROOT = path.join(__dirname, "..", "public", "gallery")

const MAX_WIDTH = 2560
const WEBP_QUALITY = 86
const WEBP_EFFORT = 4

const folder = process.argv[2]
if (!folder || folder.includes("..") || path.isAbsolute(folder)) {
  console.error("Usage: bun scripts/convert-gallery-folder.mjs <folder-under-public/gallery/>")
  process.exit(1)
}

const targetDir = path.join(GALLERY_ROOT, folder)
let names
try {
  names = await fs.readdir(targetDir)
} catch (e) {
  console.error("convert-gallery-folder: cannot read", targetDir, e)
  process.exit(1)
}

const jpegs = names.filter((n) => /\.(jpe?g)$/i.test(n))
if (jpegs.length === 0) {
  console.log("convert-gallery-folder: no JPEG in", path.relative(path.join(__dirname, ".."), targetDir))
  process.exit(0)
}

for (const name of jpegs) {
  const inPath = path.join(targetDir, name)
  const base = path.basename(name, path.extname(name))
  const outPath = path.join(targetDir, `${base}.webp`)
  await sharp(inPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
    .toFile(outPath)
  await fs.unlink(inPath)
  console.log("convert-gallery-folder:", name, "->", path.basename(outPath))
}
console.log("convert-gallery-folder: done")
