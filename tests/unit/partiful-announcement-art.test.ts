/**
 * Team “Backed by Partiful” left art must stay partnership-branded —
 * not a recycled event flyer (owner 2026-07-23: drop fromclay poster).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const artPath = path.join(rootDir, "public", "images", "partiful-announcement.webp")
const teamSource = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")

describe("Partiful announcement art", () => {
  it("is referenced from the Team band", () => {
    expect(teamSource).toContain('src="/images/partiful-announcement.webp"')
    expect(teamSource).toContain("Backed by Partiful")
  })

  it("exists as a dark partnership still (not a bright yellow event flyer)", async () => {
    expect(fs.existsSync(artPath)).toBe(true)
    const { data, info } = await sharp(artPath)
      .resize(64, 64, { fit: "fill" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(info.width).toBe(64)
    let r = 0
    let g = 0
    let b = 0
    const pixels = info.width * info.height
    for (let i = 0; i < data.length; i += 3) {
      r += data[i]
      g += data[i + 1]
      b += data[i + 2]
    }
    r /= pixels
    g /= pixels
    b /= pixels
    // fromclay flyer averaged very yellow; partnership stage stays dark.
    expect(r).toBeLessThan(120)
    expect(g).toBeLessThan(120)
    expect(b).toBeLessThan(120)
    expect(r > 180 && g > 160 && b < 100).toBe(false)
  })
})
