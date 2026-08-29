/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Brands } from "@/components/brands"

/**
 * Brands section contract: five sub-brand cards with brand-slash titles
 * (rendered via BrandSlashText, not raw "//" text) under the #brands anchor.
 */
describe("Brands", () => {
  it("renders the #brands section with the corporate eyebrow and heading", () => {
    const { container } = render(<Brands />)
    const section = container.querySelector("section#brands")
    expect(section).not.toBeNull()
    expect(screen.getByText("The Portfolio · Five Series")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Our Brands" })).toBeInTheDocument()
  })

  it("renders all five sub-brand cards with their tags", () => {
    const { container } = render(<Brands />)
    for (const tag of ["YACHTS", "CORPORATE", "COMING FALL 2026", "INDOORS", "OUTDOORS"]) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
    expect(container.querySelectorAll("h3")).toHaveLength(5)
  })

  it("splits brand-slash titles into styled spans instead of raw '//' text", () => {
    const { container } = render(<Brands />)
    const slashes = container.querySelectorAll(".lupfr-brand-slash")
    expect(slashes.length).toBe(5)
    expect(container.querySelector("h3")?.textContent).toBe("SEA // SIDE")
  })

  it("colors each title's '//' with that brand's accent, matching its tag pill", () => {
    const { container } = render(<Brands />)
    const slashes = Array.from(container.querySelectorAll(".lupfr-brand-slash")) as HTMLElement[]
    const accents = slashes.map((s) => s.style.color)
    // Comp: SEA//SIDE #6fb8c9, HIGH//RISE #e08a4a, SOUND//CHECK #c9a869,
    // IN//SIDE #e8e4da, OUT//SIDE #8aa878 — same hex as each card's tag/dot.
    expect(accents).toEqual(["#6fb8c9", "#e08a4a", "#c9a869", "#e8e4da", "#8aa878"])
  })

  // The home poster tile itself no longer carries a raw external link (owner
  // restructure, 2026-08-28) — that "Visit seaside.la →" CTA lives on the
  // brand's own /brands/seaside detail page instead (app/brands/[slug]/page.tsx).

  it("links each card to its dedicated brand page with an accessible name", () => {
    render(<Brands />)
    expect(screen.getByRole("link", { name: "View SEA SIDE brand" })).toHaveAttribute("href", "/brands/seaside")
    expect(screen.getByRole("link", { name: "View HIGH RISE brand" })).toHaveAttribute("href", "/brands/highrise")
  })

  it("renders an 'Explore' CTA on every poster tile pointing at its brand page", () => {
    const { container } = render(<Brands />)
    const exploreLinks = Array.from(container.querySelectorAll('a[href^="/brands/"]'))
    const hrefs = exploreLinks.map((a) => a.getAttribute("href")).sort()
    expect(hrefs).toEqual(
      ["/brands/highrise", "/brands/inside", "/brands/outside", "/brands/seaside", "/brands/soundcheck"].sort()
    )
    expect(container.textContent).toContain("Explore")
  })

  // The Partiful band used to also render here, duplicating the one under
  // Events (owner note, 2026-08-29: "Remove the every ticket lives on
  // partiful box below the brands as its already below events"). It now
  // renders once, in components/events.tsx only.
  it("does not render a duplicate Partiful band (that lives under Events only)", () => {
    const { container } = render(<Brands />)
    const link = container.querySelector('a[href="https://partiful.com/u/0SHzuWD8fZTwWwVJixNo"]')
    expect(link).toBeNull()
  })
})
