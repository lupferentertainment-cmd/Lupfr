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

  // Owner punch list, 2026-08-29: "Add all the brand info on the sub page I
  // have in the claude file" — the design file's deckConfig concept cards,
  // ported verbatim for the three "info" brands (highrise/soundcheck use the
  // slide-deck format instead).
  it("SEA//SIDE, IN//SIDE, and OUT//SIDE each carry exactly 3 non-empty concept cards", () => {
    const brands = getBrands()
    for (const key of ["seaside", "inside", "outside"]) {
      const brand = brands.find((b) => b.key === key)
      expect(brand?.concepts).toHaveLength(3)
      for (const concept of brand!.concepts!) {
        expect(concept.heading.length).toBeGreaterThan(0)
        expect(concept.body.length).toBeGreaterThan(0)
      }
    }
  })

  it("HIGH//RISE and SOUND//CHECK have no concept cards (they use the deck-slide format)", () => {
    const brands = getBrands()
    for (const key of ["highrise", "soundcheck"]) {
      const brand = brands.find((b) => b.key === key)
      expect(brand?.concepts).toBeUndefined()
    }
  })

  it("HIGH//RISE has a full 7-slide deck ready to render as a per-brand View deck button", () => {
    const highrise = getBrands().find((b) => b.key === "highrise")
    expect(highrise?.deck).toHaveLength(7)
    for (const slide of highrise!.deck!) {
      expect(slide).toMatch(/^\/brands\/highrise-deck-\d\.webp$/)
    }
  })
})
