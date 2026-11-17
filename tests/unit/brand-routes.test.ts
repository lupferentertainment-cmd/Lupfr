import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { brandPath, brandPlainTitle, getBrandBySlug, getBrands } from "@/lib/data/brands"

describe("brand routes", () => {
  it("creates a dedicated page path for every brand", () => {
    const brands = getBrands()
    const paths = brands.map(brandPath)

    expect(paths).toContain("/brands/seaside")
    expect(paths).toContain("/brands/highrise")
    expect(new Set(paths).size).toBe(brands.length)
  })

  it("resolves every brand by its slug (key) and rejects unknown slugs", () => {
    for (const brand of getBrands()) {
      expect(getBrandBySlug(brand.key)).toBe(brand)
    }
    expect(getBrandBySlug("not-a-brand")).toBeUndefined()
  })

  it("collapses the '//' divider into a plain space for title/aria text", () => {
    expect(brandPlainTitle({ title: "SEA//SIDE" })).toBe("SEA SIDE")
    expect(brandPlainTitle({ title: "HIGH//RISE" })).toBe("HIGH RISE")
    for (const brand of getBrands()) {
      expect(brandPlainTitle(brand)).not.toContain("//")
    }
  })

  it("marks highrise, soundcheck and skiside as coming soon; other brands are not", () => {
    const comingSoon = getBrands().filter((b) => b.comingSoon)
    expect(comingSoon.map((b) => b.key).sort()).toEqual(["highrise", "skiside", "soundcheck"])

    const notComingSoon = getBrands().filter((b) => !b.comingSoon)
    expect(notComingSoon.map((b) => b.key).sort()).toEqual(["inside", "outside", "seaside"])
  })

  it("gives every brand a landing gallery (v16) with site-root paths: full for seaside/inside/outside, sparse for the rest", () => {
    const counts = Object.fromEntries(getBrands().map((b) => [b.key, b.gallery?.length ?? 0]))
    expect(counts).toEqual({ seaside: 6, inside: 6, outside: 6, highrise: 3, soundcheck: 3, skiside: 1 })
    for (const brand of getBrands()) {
      for (const path of brand.gallery ?? []) expect(path.startsWith("/")).toBe(true)
    }
  })

  it("gives every brand landing copy: tagline, statement, CTA, empty-calendar line and three pillars", () => {
    for (const brand of getBrands()) {
      const l = brand.landing
      expect(l, brand.key).toBeDefined()
      for (const field of [l!.tagline, l!.statement, l!.cta, l!.empty]) expect(field.length, brand.key).toBeGreaterThan(0)
      expect(l!.pillars, brand.key).toHaveLength(3)
    }
  })

  // public/ is partial in some checkouts; only assert on a full tree.
  const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "public")
  it.runIf(fs.existsSync(path.join(publicDir, "brands", "seaside.webp")))("every brand landing gallery photo exists under public/", () => {
    const missing = getBrands().flatMap((b) => (b.gallery ?? []).filter((g) => !fs.existsSync(path.join(publicDir, g))))
    expect(missing).toEqual([])
  })
})
