import { describe, expect, it } from "vitest"
import { LINKS } from "@/lib/links"

describe("LINKS", () => {
  it("exposes the expected public keys", () => {
    expect(Object.keys(LINKS).sort()).toEqual(
      ["instagram", "instagramReels", "linkedin", "linkedinLife", "partiful", "scheduleCall", "tiktok", "watchReel", "youtube"].sort()
    )
  })

  it("uses https URLs for every link", () => {
    for (const [key, url] of Object.entries(LINKS)) {
      expect(url, key).toMatch(/^https:\/\//)
    }
  })
})
