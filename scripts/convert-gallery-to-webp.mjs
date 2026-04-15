#!/usr/bin/env node
/**
 * One-shot / repeatable: converts legacy DSC JPEGs in public/gallery to WebP,
 * renames to URL-safe slugs, removes originals. Run: bun run gallery:webp
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const galleryDir = path.join(root, "public", "gallery")

/** @type {{ from: string, to: string }[]} */
const CONVERSIONS = [
  { from: "_DSC0221 2.JPEG", to: "crowd-canvas.webp" },
  { from: "_DSC0386.JPEG", to: "room-frequency.webp" },
  { from: "_DSC0660.JPEG", to: "midnight-sweep.webp" },
  { from: "_DSC0684.JPEG", to: "stage-afterglow.webp" },
  { from: "_DSC0693.JPEG", to: "velvet-silhouettes.webp" },
  { from: "_DSC0781 2.JPEG", to: "pulse-line.webp" },
  { from: "_DSC0841.JPEG", to: "bodies-in-motion.webp" },
  { from: "_DSC0854 2.JPEG", to: "spark-cut.webp" },
  { from: "_DSC0887.JPEG", to: "wide-room.webp" },
  { from: "_DSC0920 2.JPEG", to: "closers-hands.webp" },
]

async function main() {
  for (const { from, to } of CONVERSIONS) {
    const inPath = path.join(galleryDir, from)
    const outPath = path.join(galleryDir, to)
    let hasIn = true
    try {
      await fs.access(inPath)
    } catch {
      hasIn = false
    }
    let hasOut = true
    try {
      await fs.access(outPath)
    } catch {
      hasOut = false
    }
    if (!hasIn && hasOut) {
      console.log(`convert-gallery: skip ${to} (already converted)`)
      continue
    }
    if (!hasIn && !hasOut) {
      console.error(`convert-gallery: missing ${from} and ${to}`)
      process.exit(1)
    }
    const MAX_WIDTH = 1920
    await sharp(inPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(outPath)
    console.log(`convert-gallery: wrote ${to}`)
    await fs.unlink(inPath)
    console.log(`convert-gallery: removed ${from}`)
  }
  console.log("convert-gallery: done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
