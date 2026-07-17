import { describe, expect, it } from "vitest"
import { PARTNERS, getPartners } from "@/lib/data/partners"

describe("PARTNERS", () => {
  it("is a non-empty array", () => {
    expect(PARTNERS.length).toBeGreaterThan(0)
  })

  it("every image path starts with /", () => {
    for (const p of PARTNERS) {
      expect(p.image.startsWith("/"), `${p.name} image missing leading /`).toBe(true)
    }
  })

  it("imageDark normalized to start with / when present", () => {
    for (const p of PARTNERS) {
      if (p.imageDark !== undefined) {
        expect(p.imageDark.startsWith("/"), `${p.name} imageDark missing leading /`).toBe(true)
      }
    }
  })

  it("ariaLabel defaults to name when not set in YAML", () => {
    for (const p of PARTNERS) {
      expect(typeof p.ariaLabel).toBe("string")
      expect(p.ariaLabel!.length).toBeGreaterThan(0)
    }
  })

  it("imageClassName includes treatment class for outline treatment", () => {
    const partner = PARTNERS.find((p) => p.logoTreatment === "outline")
    expect(partner).toBeDefined()
    expect(partner!.imageClassName).toContain("partner-logo--outline")
  })

  it("imageClassName includes treatment class for natural treatment", () => {
    const partner = PARTNERS.find((p) => p.logoTreatment === "natural")
    expect(partner).toBeDefined()
    expect(partner!.imageClassName).toContain("partner-logo--natural")
  })

  it("imageClassName falls back to partner-logo when no treatment set", () => {
    const partner = PARTNERS.find((p) => !p.logoTreatment)
    if (!partner) return
    expect(partner.imageClassName).toContain("partner-logo")
    expect(partner.imageClassName).not.toContain("partner-logo--")
  })

  it("imageClassName always includes layout utilities", () => {
    for (const p of PARTNERS) {
      expect(p.imageClassName).toContain("object-contain")
    }
  })

  it("every partner has a name", () => {
    for (const p of PARTNERS) {
      expect(typeof p.name).toBe("string")
      expect(p.name.length).toBeGreaterThan(0)
    }
  })

  it("every partner logo links to an HTTPS destination", () => {
    for (const p of PARTNERS) {
      expect(p.url, `${p.name} is missing a destination`).toMatch(/^https:\/\//)
    }
  })
})

describe("getPartners", () => {
  it("returns the same array as PARTNERS", () => {
    expect(getPartners()).toBe(PARTNERS)
  })
})
