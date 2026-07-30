import { describe, expect, it } from "vitest"
import { PARTNERS, getPartners } from "@/lib/data/partners"

describe("PARTNERS", () => {
  it("is a non-empty array", () => {
    expect(PARTNERS.length).toBeGreaterThan(0)
  })

  it("includes Partiful and FredEx; drops Venn Social and Soundcheck (owner 2026-07-21)", () => {
    const names = PARTNERS.map((p) => p.name)
    expect(names).toContain("Partiful")
    expect(names).toContain("FredEx Entertainment")
    expect(names).not.toContain("Venn Social")
    expect(names).not.toContain("Soundcheck")
  })

  it("keeps Partiful larger with dark-mode mark for freeform strip (owner 2026-07-23)", () => {
    const partiful = PARTNERS.find((p) => p.name === "Partiful")
    expect(partiful?.image).toBe("/corporate_partners/partiful.webp")
    expect(partiful?.imageDark).toBe("/corporate_partners/partiful_light.webp")
    expect(partiful?.logoTreatment).toBe("natural")
    expect(partiful?.imageClassName).toMatch(/scale-\[/)
  })

  it("every image path starts with / when present", () => {
    for (const p of PARTNERS) {
      if (p.image !== undefined) {
        expect(p.image.startsWith("/"), `${p.name} image missing leading /`).toBe(true)
      }
    }
  })

  it("Maison Noir renders as a label-only chip until its logo asset lands", () => {
    const maison = PARTNERS.find((p) => /maison noir/i.test(p.name))
    expect(maison).toBeDefined()
    expect(maison!.image).toBeUndefined()
    expect(maison!.imageClassName).toBeUndefined()
    expect(maison!.ariaLabel).toBe(maison!.name)
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

  it("imageClassName always includes layout utilities for logo partners", () => {
    for (const p of PARTNERS) {
      if (p.image !== undefined) {
        expect(p.imageClassName).toContain("object-contain")
      }
    }
  })

  it("every partner has a name", () => {
    for (const p of PARTNERS) {
      expect(typeof p.name).toBe("string")
      expect(p.name.length).toBeGreaterThan(0)
    }
  })

  it("every partner destination is HTTPS when present", () => {
    for (const p of PARTNERS) {
      if (p.url !== undefined) {
        expect(p.url, `${p.name} destination must be https`).toMatch(/^https:\/\//)
      }
    }
  })

  it("unlinked partners carry no URL (label-only pending or unlinked image partners)", () => {
    const unlinked = PARTNERS.filter((p) => p.url === undefined)
    expect(unlinked.map((p) => p.name)).toEqual(
      expect.arrayContaining(["Brixton Bar SF", "Maison Noir"])
    )
  })
})

describe("getPartners", () => {
  it("returns the same array as PARTNERS", () => {
    expect(getPartners()).toBe(PARTNERS)
  })
})
