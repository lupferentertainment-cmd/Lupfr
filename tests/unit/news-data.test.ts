/**
 * Company-news data contract (owner request 2026-08-08, "Added a few company
 * news items below the Hero - the links to articles/posts are included in the
 * Claude file").
 *
 * This strip makes factual claims about a real business, so the guard here is
 * anti-fabrication first: every item must carry a real permalink to a specific
 * post or article, never a generic profile/landing page. The AUG 8 design file
 * also carried unverifiable entries (a Pasadena HQ opening, "six sold-out Bay
 * sailings", a Downtown LA HIGH//RISE launch) whose "links" were company
 * profile URLs; those are deliberately not shipped, matching the call already
 * made for the Media Hub in tests/unit/media-hub-data.test.ts.
 */
import { describe, expect, it } from "vitest"

import { getNews, newsDateLabel, type NewsItem } from "@/lib/data/news"

const news = getNews()

/** Bare profile/landing pages — valid links, but not evidence of a story. */
const GENERIC_LANDING = [
  /^https:\/\/www\.linkedin\.com\/company\/[^/]+\/?$/,
  /^https:\/\/www\.instagram\.com\/[^/]+\/?$/,
  /^https:\/\/www\.tiktok\.com\/@[^/]+\/?$/,
  /^https:\/\/www\.youtube\.com\/@[^/]+\/?$/,
]

describe("company news data", () => {
  it("ships the three owner-delivered items", () => {
    expect(news).toHaveLength(3)
  })

  it("orders newest first", () => {
    const dates = news.map((n) => n.dateISO)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })

  it("gives every item a source, an ISO date, and a title", () => {
    for (const item of news) {
      expect(item.source, `item ${item.id} source`).toBeTruthy()
      expect(item.title, `item ${item.id} title`).toBeTruthy()
      expect(item.dateISO, `item ${item.id} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it("links every item to a specific post or article, never a generic profile", () => {
    for (const item of news) {
      expect(item.url, `item ${item.id} url`).toMatch(/^https:\/\//)
      for (const pattern of GENERIC_LANDING) {
        expect(
          pattern.test(item.url),
          `item ${item.id} ("${item.source}") links to a generic profile page ` +
            `(${item.url}) rather than a specific post — that is the fabrication ` +
            `pattern this guard exists to block.`
        ).toBe(false)
      }
    }
  })

  it("uses the SF Post slug that actually resolves", () => {
    // The design file's copy pointed at `-redefining-live-events/`, which 404s.
    // The live article (verified 200 on 2026-08-08) is the `-in-san-francisco/`
    // slug already recorded in data/press.yml.
    const sfPost = news.find((n) => /san francisco post/i.test(n.source))
    expect(sfPost).toBeDefined()
    expect(sfPost?.url).toContain("redefining-the-music-experience-in-san-francisco")
    expect(sfPost?.url).not.toContain("redefining-live-events")
  })

  it("does not ship the design file's unverifiable headlines", () => {
    const blob = news.map((n) => n.title).join(" ").toLowerCase()
    for (const claim of ["old town pasadena", "sold-out", "sold out", "hq"]) {
      expect(blob, `unverified claim "${claim}" reached the news strip`).not.toContain(claim)
    }
  })
})

describe("newsDateLabel", () => {
  it("renders the design file's mono date treatment", () => {
    const item = { id: 0, source: "X", dateISO: "2026-08-07", title: "t", url: "https://e.com" } as NewsItem
    expect(newsDateLabel(item)).toBe("AUG 7, 2026")
  })

  it("does not drift a day across timezones", () => {
    // Parsed as UTC, so a negative-offset server still renders the 7th.
    const item = { id: 0, source: "X", dateISO: "2026-01-01", title: "t", url: "https://e.com" } as NewsItem
    expect(newsDateLabel(item)).toBe("JAN 1, 2026")
  })
})
