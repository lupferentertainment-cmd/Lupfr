/**
 * News & Media data (owner July 24 folder, shipped 2026-08-06; rebuilt
 * 2026-08-29 to match the design file's row-list layout — see
 * lib/data/media.ts's own doc comment).
 *
 * The design file's own channel matrix invents specific per-brand handles
 * and marks brands "LIVE" that `data/brands.yml` itself flags
 * `comingSoon: true`. This surface is for a real business, so it may only
 * ever surface links the repo has actually verified — real socials, real
 * websites, real press — with an honest "via LUPFR" or "coming soon" state
 * standing in for anything unverified, never a fabricated handle.
 */
import { describe, expect, it } from "vitest"
import { getMediaOverview, LUPFR_MEDIA_KEY } from "@/lib/data/media"
import { LINKS } from "@/lib/links"
import { getBrands } from "@/lib/data/brands"
import { getPress } from "@/lib/data/press"
import { getNews } from "@/lib/data/news"

const overview = getMediaOverview()

describe("media overview brand rows", () => {
  it("leads with LUPFR, then one row per brand", () => {
    expect(overview.brandRows[0].key).toBe(LUPFR_MEDIA_KEY)
    expect(overview.brandRows).toHaveLength(getBrands().length + 1)
    expect(overview.brandRows.slice(1).map((r) => r.key)).toEqual(getBrands().map((b) => b.key))
  })

  it("gives every row a label, status, and accent", () => {
    for (const row of overview.brandRows) {
      expect(row.label.length, row.key).toBeGreaterThan(0)
      expect(row.status.length, row.key).toBeGreaterThan(0)
      expect(row.accent).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it("carries each brand's accent through for the row treatment", () => {
    for (const brand of getBrands()) {
      const row = overview.brandRows.find((r) => r.key === brand.key)
      expect(row?.accent).toBe(brand.accent)
    }
  })

  it("marks LUPFR live and every launched brand with no confirmed account 'via LUPFR' — no handle is fabricated", () => {
    const lupfr = overview.brandRows.find((r) => r.key === LUPFR_MEDIA_KEY)!
    expect(lupfr.status).toBe("LIVE")
    expect(lupfr.channels.every((c) => c.state === "live")).toBe(true)

    for (const brand of getBrands().filter((b) => !b.comingSoon && !b.social)) {
      const row = overview.brandRows.find((r) => r.key === brand.key)!
      expect(row.status, brand.key).toBe("VIA LUPFR")
      expect(row.channels.every((c) => c.state === "via"), brand.key).toBe(true)
    }
  })

  it("gives SEA//SIDE its own confirmed IG + TikTok, routing LinkedIn/YouTube via LUPFR (owner-confirmed, 2026-08-29)", () => {
    const seaside = getBrands().find((b) => b.key === "seaside")!
    expect(seaside.social).toEqual({
      instagram: "https://www.instagram.com/seaside.la/",
      tiktok: "https://www.tiktok.com/@seaside.la",
    })

    const row = overview.brandRows.find((r) => r.key === "seaside")!
    expect(row.status).toBe("LIVE")
    const byPlatform = Object.fromEntries(row.channels.map((c) => [c.platform, c]))
    expect(byPlatform.Instagram).toEqual({ platform: "Instagram", state: "live", href: seaside.social!.instagram })
    expect(byPlatform.TikTok).toEqual({ platform: "TikTok", state: "live", href: seaside.social!.tiktok })
    expect(byPlatform.LinkedIn).toEqual({ platform: "LinkedIn", state: "via", href: LINKS.linkedin })
    expect(byPlatform.YouTube).toEqual({ platform: "YouTube", state: "via", href: LINKS.youtube })
  })

  it("marks a comingSoon brand's row as coming soon with no links at all", () => {
    const soonBrands = getBrands().filter((b) => b.comingSoon)
    expect(soonBrands.length).toBeGreaterThan(0)
    for (const brand of soonBrands) {
      const row = overview.brandRows.find((r) => r.key === brand.key)!
      expect(row.status, brand.key).toBe("COMING SOON")
      for (const cell of row.channels) {
        expect(cell.state, `${brand.key} ${cell.platform}`).toBe("soon")
        expect(cell.href, `${brand.key} ${cell.platform}`).toBeUndefined()
      }
    }
  })

  it("every row covers exactly the 4 platforms, in order", () => {
    for (const row of overview.brandRows) {
      expect(row.channels.map((c) => c.platform)).toEqual(["Instagram", "TikTok", "LinkedIn", "YouTube"])
    }
  })
})

describe("media overview links are real, never invented", () => {
  it("uses the verified handles from lib/links.ts, not fabricated per-brand accounts", () => {
    const urls = overview.brandRows.flatMap((r) => r.channels.map((c) => c.href).filter(Boolean))
    expect(urls).toContain(LINKS.instagram)
    expect(urls).toContain(LINKS.linkedin)
    expect(urls).toContain(LINKS.tiktok)
    expect(urls).toContain(LINKS.youtube)
    // The design file's own invented per-brand handles must never ship.
    // (SEA//SIDE's Instagram/TikTok are excluded here — the owner confirmed
    // those two as real on 2026-08-29, so they now ship deliberately; see
    // the dedicated SEA//SIDE test above.)
    for (const fake of [
      "instagram.com/high.rise.la",
      "linkedin.com/company/seaside-la",
      "linkedin.com/company/highrise-co",
    ]) {
      expect(urls.some((u) => u!.includes(fake)), fake).toBe(false)
    }
  })

  it("fixes the TikTok handle per the owner's standing note (2026-08-29)", () => {
    expect(LINKS.tiktok).toBe("https://www.tiktok.com/@lupfr_")
  })

  it("every live/via channel is an absolute https url; every soon channel has none", () => {
    for (const row of overview.brandRows) {
      for (const cell of row.channels) {
        if (cell.state === "soon") {
          expect(cell.href, `${row.key} ${cell.platform}`).toBeUndefined()
        } else {
          expect(cell.href?.startsWith("https://"), `${row.key} ${cell.platform}`).toBe(true)
        }
      }
    }
  })
})

describe("media overview news comes from real press", () => {
  it("surfaces press and company news together, de-duplicated", () => {
    const urls = new Set([...getPress().map((p) => p.url), ...getNews().map((n) => n.url)])
    // Union of both sources, each URL once — the San Francisco Post feature is
    // legitimately in press.yml AND news.yml and must not list twice.
    expect(overview.newsFeed).toHaveLength(urls.size)
    expect(new Set(overview.newsFeed.map((n) => n.url)).size).toBe(overview.newsFeed.length)

    for (const n of overview.newsFeed) {
      expect(n.url.startsWith("https://")).toBe(true)
      expect(n.source.length).toBeGreaterThan(0)
      expect(n.title.length).toBeGreaterThan(0)
    }
  })

  it("orders the feed newest first across both sources", () => {
    const dates = overview.newsFeed.map((n) => n.dateISO)
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)))
  })

  it("invents no coverage — the design file's fake headlines never appear", () => {
    const titles = overview.newsFeed.map((n) => n.title)
    expect(titles.some((t) => /Biggest SEA\/\/SIDE season yet/i.test(t))).toBe(false)
    expect(titles.some((t) => /six sold-out/i.test(t))).toBe(false)
    expect(titles.some((t) => /opens its first full HQ/i.test(t))).toBe(false)
  })
})

describe("media overview stats", () => {
  it("counts LUPFR plus every brand row", () => {
    expect(overview.stats.brandCount).toBe(getBrands().length + 1)
  })

  it("counts every real, verified live channel sitewide — LUPFR's 4 plus each brand's own confirmed accounts, never an estimate", () => {
    // LUPFR's own 4 platforms, plus SEA//SIDE's 2 confirmed accounts
    // (Instagram + TikTok, 2026-08-29) — recomputed from the rows
    // themselves rather than re-hardcoding a total that would silently go
    // stale the next time a brand confirms a new account.
    const expected = overview.brandRows.flatMap((r) => r.channels).filter((c) => c.state === "live").length
    expect(expected).toBe(6)
    expect(overview.stats.liveChannelCount).toBe(expected)
  })

  it("derives 'updated' from the newest real news item, not a hardcoded date", () => {
    expect(overview.stats.updatedLabel).toBe(overview.newsFeed[0]?.date ?? "")
  })
})
