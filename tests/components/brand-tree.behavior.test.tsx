/** @vitest-environment happy-dom */

/**
 * Corporate-structure tree — LUPFR at top, three columns below (owner
 * correction, 2026-09-02, with a new reference screenshot: "we need to have
 * the platform categories included now... split up into Live Events, Media,
 * Corporate"): Live Events (SEA//SIDE, IN//SIDE, OUT//SIDE + LP Program),
 * Media (SOUND//CHECK + LUPFR Media, LUPFR VIP), Corporate (HIGH//RISE +
 * LUPFR Hospitality, LUPFR Ventures). Only operating brands are tappable —
 * they jump to their own `#brand-<key>` row further down app/brands/page.tsx;
 * platform programs are informational tiles with no detail row to jump to.
 */
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { BrandTree } from "@/components/brand-tree"
import { getBrands } from "@/lib/data/brands"

const brands = getBrands()

describe("BrandTree", () => {
  it("renders the LUPFR node and exactly one tappable button per operating brand", () => {
    render(<BrandTree brands={brands} />)
    expect(screen.getByText("LUPFR")).toBeInTheDocument()
    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(brands.length)
  })

  it("groups SEA//SIDE, IN//SIDE, OUT//SIDE and LP Program under Live Events", () => {
    render(<BrandTree brands={brands} />)
    const liveGroup = screen.getByRole("group", { name: "Live Events" })
    expect(liveGroup.textContent).toContain("SEA")
    expect(liveGroup.textContent).toContain("IN")
    expect(liveGroup.textContent).toContain("OUT")
    expect(liveGroup.textContent).toContain("LP Program")
    expect(liveGroup.textContent).toContain("Promoter Network")
  })

  it("groups SOUND//CHECK, LUPFR Media, and LUPFR VIP under Media", () => {
    render(<BrandTree brands={brands} />)
    const mediaGroup = screen.getByRole("group", { name: "Media" })
    expect(mediaGroup.textContent).toContain("SOUND")
    expect(mediaGroup.textContent).toContain("LUPFR Media")
    expect(mediaGroup.textContent).toContain("Content Studio")
    expect(mediaGroup.textContent).toContain("LUPFR VIP")
    expect(mediaGroup.textContent).toContain("Creator Network")
  })

  it("groups HIGH//RISE, LUPFR Hospitality, and LUPFR Ventures under Corporate, HIGH//RISE and SOUND//CHECK both marked Soon", () => {
    render(<BrandTree brands={brands} />)
    const corpGroup = screen.getByRole("group", { name: "Corporate" })
    expect(corpGroup.textContent).toContain("HIGH")
    expect(corpGroup.textContent).toContain("LUPFR Hospitality")
    expect(corpGroup.textContent).toContain("Venue Partnerships")
    expect(corpGroup.textContent).toContain("LUPFR Ventures")
    expect(corpGroup.textContent).toContain("Capital · Concepts")
    expect(screen.getAllByText("Soon")).toHaveLength(2)
  })

  // Owner report, 2026-08-29: "center all text on the corp tree texts."
  it("centers the column labels and every brand node's text", () => {
    render(<BrandTree brands={brands} />)
    for (const label of ["Live Events", "Media", "Corporate"]) {
      const labelEl = screen.getByText(label).closest("p")
      expect(labelEl?.className).toContain("text-center")
    }
    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toContain("items-center")
      expect(button.className).toContain("text-center")
    }
  })

  it("clicking a node scrolls its #brand-<key> section into view", () => {
    const scrollIntoView = vi.fn()
    const target = document.createElement("div")
    target.id = "brand-seaside"
    target.scrollIntoView = scrollIntoView
    document.body.appendChild(target)

    render(<BrandTree brands={brands} />)
    const node = screen.getByRole("button", { name: /Jump to SEA SIDE/i })
    node.click()
    expect(scrollIntoView).toHaveBeenCalled()

    document.body.removeChild(target)
  })

  it("clicking a node safely no-ops if its #brand-<key> section isn't on the page", () => {
    render(<BrandTree brands={brands} />)
    const node = screen.getByRole("button", { name: /Jump to SEA SIDE/i })
    expect(() => node.click()).not.toThrow()
  })
})
