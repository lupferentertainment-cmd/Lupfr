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

  it("marks highrise and soundcheck as coming soon; other brands are not", () => {
    const comingSoon = getBrands().filter((b) => b.comingSoon)
    expect(comingSoon.map((b) => b.key).sort()).toEqual(["highrise", "soundcheck"])

    const notComingSoon = getBrands().filter((b) => !b.comingSoon)
    expect(notComingSoon.map((b) => b.key).sort()).toEqual(["inside", "outside", "seaside"])
  })

  it("only seaside carries a gallery, with site-root leading-slash paths", () => {
    const seaside = getBrandBySlug("seaside")
    expect(seaside?.gallery?.length).toBe(6)
    for (const path of seaside?.gallery ?? []) {
      expect(path.startsWith("/")).toBe(true)
    }

    for (const brand of getBrands().filter((b) => b.key !== "seaside")) {
      expect(brand.gallery).toBeUndefined()
    }
  })
})
