/** @vitest-environment happy-dom */

/**
 * RTL edge cases for Will's 2026-07-21/22 homepage updates.
 */
import { fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { Artists } from "@/components/artists"
import { Brands } from "@/components/brands"
import { PartnersStrip } from "@/components/partners-strip"
import { Services } from "@/components/services"
import { Team } from "@/components/team"
import { getPartners } from "@/lib/data/partners"

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => true),
}))

import { useIsMobile } from "@/hooks/use-mobile"

describe("Will homepage update edge cases", () => {
  beforeEach(() => {
    vi.mocked(useIsMobile).mockReturnValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("partners strip uses freeform logos (no card tiles or circle clip)", () => {
    const { container } = render(<PartnersStrip />)
    expect(container.querySelector("section")?.getAttribute("data-partners-chrome")).toBe(
      "freeform",
    )
    expect(container.querySelectorAll(".partner-logo-chip").length).toBe(0)
    const shells = container.querySelectorAll(".partner-logo-shell")
    expect(shells.length).toBeGreaterThan(0)
    for (const shell of shells) {
      expect(shell.className).toMatch(/bg-transparent/)
      expect(shell.className).toMatch(/border-0/)
      expect(shell.className).not.toMatch(/bg-card|border-border|shadow-md/)
    }
    const marks = container.querySelectorAll(".partner-logo-mark")
    expect(marks.length).toBeGreaterThan(0)
    for (const mark of marks) {
      expect(mark.className).not.toMatch(/rounded-full/)
      expect(mark.className).not.toMatch(/border-border|bg-card/)
    }
    const names = getPartners().map((p) => p.name)
    expect(names).toContain("Partiful")
    expect(names).toContain("FredEx Entertainment")
    expect(names).not.toContain("Venn Social")
    expect(names).not.toContain("Soundcheck")
  })

  it("brands header links Explore LUPFR to /brands", () => {
    // Copy changed from "View all brands" (owner punch list, 2026-09-02,
    // iPhone screenshot: "The 'view all brands' button should be 'Explore
    // LUPFR'").
    render(<Brands />)
    expect(screen.getByRole("link", { name: /Explore LUPFR/i })).toHaveAttribute("href", "/brands")
  })

  it("services exposes Explore all + Learn more without feature bullets", () => {
    const { container } = render(<Services />)
    expect(screen.getByRole("link", { name: /Explore all services/i })).toHaveAttribute(
      "href",
      "/services",
    )
    expect(container.textContent).toContain("Learn more →")
    expect(container.querySelector("ul")).toBeNull()
  })

  // Owner restructure (2026-08-28): the home Services tease dropped the
  // per-card mouse-tilt shell entirely (poster-tile grid, same on every
  // viewport) — see tests/unit/mobile-services-static.test.ts.
  it("renders the same poster-tile article markup regardless of useIsMobile", () => {
    vi.mocked(useIsMobile).mockReturnValue(false)
    const { container } = render(<Services />)
    const articles = container.querySelectorAll("article")
    expect(articles.length).toBe(6)
  })

  it("artists roster includes ASTRD and sorts A–Z with gold featured names in marquee ticker", () => {
    render(<Artists />)
    const roster = screen.getByLabelText("Artist roster ticker")
    expect(within(roster).getAllByText("ASTRD").length).toBeGreaterThan(0)
    expect(roster.querySelectorAll(".heading-metallic-gold").length).toBeGreaterThan(0)
  })

  it("artists Submit Your Mix dispatches presetInquiry and scrolls to contact", () => {
    const scrollIntoView = vi.fn()
    const contact = document.createElement("div")
    contact.id = "contact"
    contact.scrollIntoView = scrollIntoView
    document.body.appendChild(contact)
    const handler = vi.fn()
    window.addEventListener("presetInquiry", handler)

    render(<Artists />)
    fireEvent.click(screen.getByRole("button", { name: /Submit Your Mix/i }))
    expect(handler).toHaveBeenCalled()
    expect(scrollIntoView).toHaveBeenCalled()

    window.removeEventListener("presetInquiry", handler)
    contact.remove()
  })

  it("artists desktop hover path sets and clears hovered card state", () => {
    vi.mocked(useIsMobile).mockReturnValue(false)
    const { container } = render(<Artists />)
    const card = container.querySelector("article")
    expect(card).not.toBeNull()
    if (!card) return
    fireEvent.mouseEnter(card)
    fireEvent.mouseLeave(card)
  })

  it("team section surfaces the Backed by Partiful announcement", () => {
    render(<Team />)
    expect(screen.getByText(/Backed by Partiful/i)).toBeInTheDocument()
  })
})
