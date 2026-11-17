import { describe, expect, it } from "vitest"
import { getBrandSocials, getOtherBrands, handleFromUrl, hexToRgba, splitBrandTitle } from "@/lib/data/brand-landing"

describe("brand landing helpers", () => {
  it("derives @handles from account URLs", () => {
    expect(handleFromUrl("Instagram", "https://www.instagram.com/seaside.la/")).toBe("@seaside.la")
    expect(handleFromUrl("TikTok", "https://www.tiktok.com/@seaside.la")).toBe("@seaside.la")
    expect(handleFromUrl("LinkedIn", "https://www.linkedin.com/company/lupfr/")).toBe("lupfr")
    expect(handleFromUrl("YouTube", "https://www.youtube.com/")).toBe("https://www.youtube.com/")
    expect(handleFromUrl("Instagram", "not a url")).toBe("not a url")
  })

  it("lists a brand's own verified accounts, else LUPFR's four channels flagged via LUPFR", () => {
    const seaside = getBrandSocials("seaside")
    expect(seaside.map((s) => [s.platform, s.handle, s.viaLupfr])).toEqual([
      ["Instagram", "@seaside.la", false],
      ["TikTok", "@seaside.la", false],
    ])
    const skiside = getBrandSocials("skiside")
    expect(skiside.map((s) => s.platform)).toEqual(["Instagram", "TikTok", "LinkedIn", "YouTube"])
    expect(skiside.every((s) => s.viaLupfr && s.href.startsWith("https://"))).toBe(true)
    expect(getBrandSocials("not-a-brand")).toHaveLength(4)
  })

  it("tints, splits and lists the other brands", () => {
    expect(hexToRgba("#5b8ee6", 0.07)).toBe("rgba(91, 142, 230, 0.07)")
    expect(hexToRgba("#fff", 0.5)).toBe("rgba(255, 255, 255, 0.5)")
    expect(splitBrandTitle("SEA//SIDE")).toEqual(["SEA", "SIDE"])
    expect(splitBrandTitle("LUPFR")).toEqual(["LUPFR", ""])
    expect(getOtherBrands("seaside").map((b) => b.key)).not.toContain("seaside")
    expect(getOtherBrands("seaside")).toHaveLength(5)
  })
})
