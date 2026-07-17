import { describe, expect, it } from "vitest"
import { getReels, REELS } from "@/lib/data/reels"
import { LINKS } from "@/lib/links"

/**
 * Archived Reels contract: recap destinations remain valid while the home block
 * is retired, so restoring the feature does not require reconstructing its data.
 */
describe("reels list", () => {
  it("exposes at least one reel row", () => {
    expect(getReels().length).toBeGreaterThan(0)
    expect(getReels()).toEqual(REELS)
  })

  it("every reel has a non-empty label and an https Instagram URL", () => {
    for (const reel of getReels()) {
      expect(reel.label.trim().length).toBeGreaterThan(0)
      expect(reel.url).toMatch(/^https:\/\/(www\.)?instagram\.com\//)
    }
  })

  it("LINKS carries the Instagram reels tab for the view-all CTA", () => {
    expect(LINKS.instagramReels).toMatch(/^https:\/\/www\.instagram\.com\/.+\/reels\/?$/)
  })
})
