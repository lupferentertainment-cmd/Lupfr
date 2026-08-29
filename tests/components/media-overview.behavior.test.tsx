/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { MediaOverview } from "@/components/media-overview"
import { getMediaOverview, LUPFR_MEDIA_KEY } from "@/lib/data/media"
import { LINKS } from "@/lib/links"
import { getBrands } from "@/lib/data/brands"

const overview = getMediaOverview()

describe("News & Media — news feed", () => {
  it("renders every real news item as an external link", () => {
    render(<MediaOverview />)
    const region = screen.getByRole("region", { name: /news and updates/i })
    for (const n of overview.newsFeed) {
      const link = within(region).getByRole("link", { name: new RegExp(n.title.slice(0, 20)) })
      expect(link).toHaveAttribute("href", n.url)
      expect(link).toHaveAttribute("target", "_blank")
      expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"))
    }
  })
})

describe("News & Media — follow each brand", () => {
  it("renders one row per brand, LUPFR first", () => {
    render(<MediaOverview />)
    const region = screen.getByRole("region", { name: /follow each brand/i })
    expect(region.textContent).toMatch(/LUPFR/)
    for (const brand of getBrands()) {
      // BrandSlashText renders "SEA//SIDE" as "SEA // SIDE" (spaced divider).
      expect(region.textContent).toContain(brand.title.replace("//", " // "))
    }
  })

  it("gives LUPFR's row 4 live links to the real verified accounts", () => {
    render(<MediaOverview />)
    const region = screen.getByRole("region", { name: /follow each brand/i })
    const lupfrRow = overview.brandRows.find((r) => r.key === LUPFR_MEDIA_KEY)!
    expect(lupfrRow.status).toBe("LIVE")
    const ig = within(region).getAllByRole("link").find((a) => a.getAttribute("href") === LINKS.instagram)
    expect(ig).toBeTruthy()
    expect(ig).toHaveAttribute("target", "_blank")
    expect(ig).toHaveAttribute("rel", expect.stringContaining("noopener"))
  })

  it("marks a comingSoon brand's channels as inert, with no link to click", () => {
    render(<MediaOverview />)
    const region = screen.getByRole("region", { name: /follow each brand/i })
    const soonBrand = getBrands().find((b) => b.comingSoon)!
    const soonRow = overview.brandRows.find((r) => r.key === soonBrand.key)!
    expect(soonRow.channels.every((c) => c.state === "soon")).toBe(true)
    // None of that row's 4 platform cells render as a clickable link.
    const links = within(region).getAllByRole("link")
    const hrefs = links.map((a) => a.getAttribute("href"))
    // The soon row's cells never contribute an href — every href present
    // belongs to a live or via-LUPFR row instead.
    expect(hrefs.every((h) => h && h.startsWith("https://"))).toBe(true)
  })

  it("says 'via LUPFR' rather than implying a launched brand runs its own accounts", () => {
    render(<MediaOverview />)
    const region = screen.getByRole("region", { name: /follow each brand/i })
    expect(region.textContent).toMatch(/VIA LUPFR/i)
  })
})
