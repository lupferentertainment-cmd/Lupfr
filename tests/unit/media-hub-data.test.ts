/**
 * Media Hub data (owner July 24 folder, shipped 2026-08-06).
 *
 * The mockup shipped placeholder handles and invented news items. This surface
 * is for a real business, so it may only ever surface links the repo has
 * actually verified — real socials, real websites, real press.
 */
import { describe, expect, it } from "vitest"
import { getMediaChannels, LUPFR_MEDIA_KEY } from "@/lib/data/media"
import { LINKS } from "@/lib/links"
import { getBrands } from "@/lib/data/brands"
import { getPress } from "@/lib/data/press"
import { getNews } from "@/lib/data/news"

const channels = getMediaChannels()

describe("media hub tabs", () => {
  it("leads with LUPFR, then one tab per brand", () => {
    expect(channels[0].key).toBe(LUPFR_MEDIA_KEY)
    expect(channels).toHaveLength(getBrands().length + 1)
    expect(channels.slice(1).map((c) => c.key)).toEqual(getBrands().map((b) => b.key))
  })

  it("gives every tab a label, tagline, and blurb to render", () => {
    for (const c of channels) {
      expect(c.label.length, c.key).toBeGreaterThan(0)
      expect(c.tagline.length, c.key).toBeGreaterThan(0)
      expect(c.blurb.length, c.key).toBeGreaterThan(20)
    }
  })

  it("carries each brand's accent through for the tab treatment", () => {
    for (const brand of getBrands()) {
      const tab = channels.find((c) => c.key === brand.key)
      expect(tab?.accent).toBe(brand.accent)
    }
  })
})

describe("media hub links are real, never invented", () => {
  it("only surfaces a website when the brand actually has one", () => {
    const withSite = channels.filter((c) => c.website)
    // seaside.la is currently the only brand site in data/brands.yml.
    expect(withSite.map((c) => c.key)).toEqual(["seaside"])
    expect(withSite[0].website).toBe("https://seaside.la")
  })

  it("uses the verified handles from lib/links.ts, not the mockup placeholders", () => {
    const urls = channels.flatMap((c) => c.socials.map((s) => s.url))
    expect(urls).toContain(LINKS.instagram)
    expect(urls).toContain(LINKS.linkedin)
    expect(urls).toContain(LINKS.tiktok)
    // The July 24 mockup's placeholder accounts must never ship.
    for (const fake of [
      "instagram.com/lupfr.entertainment",
      "linkedin.com/company/lupfr-entertainment",
      "tiktok.com/@lupfr",
      "instagram.com/seaside.la",
      "instagram.com/highrise.lupfr",
    ]) {
      expect(urls.some((u) => u.includes(fake)), fake).toBe(false)
    }
  })

  it("every social entry has a name, handle, and absolute https url", () => {
    for (const c of channels) {
      for (const s of c.socials) {
        expect(s.name.length, c.key).toBeGreaterThan(0)
        expect(s.handle.length, c.key).toBeGreaterThan(0)
        expect(s.url.startsWith("https://"), `${c.key} ${s.name}`).toBe(true)
      }
    }
  })

  it("labels brand-tab channels as the company's, since no per-brand handles exist", () => {
    const seaside = channels.find((c) => c.key === "seaside")!
    expect(seaside.socialsAreCompanyWide).toBe(true)
    expect(channels[0].socialsAreCompanyWide).toBe(false)
  })
})

describe("media hub news comes from real press", () => {
  it("surfaces press and company news together on the LUPFR tab, de-duplicated", () => {
    const news = channels[0].news
    const urls = new Set([
      ...getPress().map((p) => p.url),
      ...getNews().map((n) => n.url),
    ])
    // Union of both sources, each URL once — the San Francisco Post feature is
    // legitimately in press.yml AND news.yml and must not list twice.
    expect(news).toHaveLength(urls.size)
    expect(new Set(news.map((n) => n.url)).size).toBe(news.length)

    for (const n of news) {
      expect(n.url.startsWith("https://")).toBe(true)
      expect(n.source.length).toBeGreaterThan(0)
      expect(n.title.length).toBeGreaterThan(0)
    }
  })

  it("orders the LUPFR tab newest first across both sources", () => {
    const dates = channels[0].news.map((n) => n.dateISO)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })

  it("invents no coverage — the mockup's fake headlines never appear", () => {
    const titles = channels.flatMap((c) => c.news.map((n) => n.title))
    expect(titles.some((t) => /Biggest SEA\/\/SIDE season yet/i.test(t))).toBe(false)
    expect(titles.some((t) => /six sold-out/i.test(t))).toBe(false)
  })
})
