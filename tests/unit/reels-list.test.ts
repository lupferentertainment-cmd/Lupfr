import { describe, expect, it } from "vitest"
import { getReels, REELS } from "@/lib/data/reels"
import { LINKS } from "@/lib/links"

/**
 * Reels contract: event recap videos live on Instagram; the home Events section
 * renders one card per data/reels.yml row plus a "view all" CTA. Every row must
 * be a real https Instagram destination so the external-link QA can verify it.
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
