/**
 * Converts JPEG sources in public/gallery/ to optimized WebP files named by slug.
 * Expects lib/data/generated/gallery.json from the internal data generator.
 * Run: bun run _generate-data && bun scripts/build-gallery-webp.mjs
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const galleryDir = path.join(root, "public", "gallery")
const manifestPath = path.join(root, "lib", "data", "generated", "gallery.json")

async function main() {
  const raw = await fs.readFile(manifestPath, "utf8")
  /** @type {{ slug: string; source: string }[]} */
  const items = JSON.parse(raw)
  for (const item of items) {
    const srcPath = path.join(galleryDir, item.source)
    const outPath = path.join(galleryDir, `${item.slug}.webp`)
    try {
      await fs.access(srcPath)
    } catch {
      console.warn(`[build-gallery-webp] skip (missing source): ${item.source}`)
      continue
    }
    await sharp(srcPath)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toFile(outPath)
    console.log(`[build-gallery-webp] ${item.source} -> ${item.slug}.webp`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
