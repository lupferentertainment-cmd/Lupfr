/**
 * Convert legacy DSC*.JPEG in public/gallery to .webp and remove each source after success.
 * Run from repo root: `bun scripts/convert-gallery-webp.mjs`
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const GALLERY_DIR = path.join(__dirname, "..", "public", "gallery")

/** Source filename (exact) → output slug (without extension) */
const MAP = [
  { from: "_DSC0693.JPEG", slug: "intimate-corner-glow" },
  { from: "_DSC0781 2.JPEG", slug: "afterglow-exit-light" },
  { from: "_DSC0841.JPEG", slug: "stage-spot-moment" },
  { from: "_DSC0854 2.JPEG", slug: "silhouette-hands-up" },
  { from: "_DSC0887.JPEG", slug: "wide-venue-panorama" },
  { from: "_DSC0920 2.JPEG", slug: "dj-focus-red" },
]

async function main() {
  for (const { from, slug } of MAP) {
    const src = path.join(GALLERY_DIR, from)
    const dest = path.join(GALLERY_DIR, `${slug}.webp`)
    if (!fs.existsSync(src)) {
      console.warn(`convert-gallery-webp: skip missing source ${from}`)
      continue
    }
    await sharp(src)
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toFile(dest)
    try {
      if (fs.existsSync(src)) fs.unlinkSync(src)
    } catch (e) {
      console.warn(`convert-gallery-webp: could not remove ${from}:`, e)
    }
    console.log(`convert-gallery-webp: ${from} -> ${slug}.webp`)
  }
  console.log("convert-gallery-webp: done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
