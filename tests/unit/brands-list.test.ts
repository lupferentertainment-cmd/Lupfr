import { describe, expect, it } from "vitest"
import { getBrands } from "@/lib/data/brands"

/**
 * Brands (sub-brand portfolio) data contract: five rows, brand-slash titles,
 * unique keys, and a real hex accent per row (used only on the card's tag
 * pill/dot, not sitewide).
 */
describe("brands list", () => {
  it("exposes exactly five sub-brand rows", () => {
    expect(getBrands()).toHaveLength(5)
  })

  it("every row has a unique key, a '//' brand-slash title, a tag, and a hex accent", () => {
    const brands = getBrands()
    const keys = brands.map((b) => b.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const brand of brands) {
      expect(brand.title).toContain("//")
      expect(brand.tag.length).toBeGreaterThan(0)
      expect(brand.accent).toMatch(/^#[0-9a-f]{6}$/i)
      expect(brand.description.length).toBeGreaterThan(0)
      expect(brand.format.length).toBeGreaterThan(0)
    }
  })

  it("SEA//SIDE links out to the live seaside.la microsite", () => {
    const seaside = getBrands().find((b) => b.key === "seaside")
    expect(seaside?.externalUrl).toBe("https://seaside.la")
  })
})
