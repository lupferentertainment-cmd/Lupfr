/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    // Owner design-file punch list, 2026-09-02: the operating tab now groups
    // cards by division (Live/Events, then Corporate/Media — see
    // getBrandsByDivision), so DOM order is seaside, inside, outside,
    // highrise, soundcheck rather than the raw YAML order.
    // SEA//SIDE #6fb8c9, IN//SIDE #e8e4da, OUT//SIDE #8aa878, HIGH//RISE
    // #e08a4a, SOUND//CHECK #c9a869 — same hex as each card's tag/dot.
    expect(accents).toEqual(["#6fb8c9", "#e8e4da", "#8aa878", "#e08a4a", "#c9a869"])
  })

  it("renders all five operating cards in a single row, no division row-break (owner correction, 2026-09-02)", () => {
    const { container } = render(<Brands />)
    // No division-label headings inside the grid — a row-breaking label was
    // the bug ("these should not be rows. It should be on one row"); the
    // Live/Events vs Corporate/Media grouping still exists but lives only on
    // the corporate structure tree (components/brand-tree.tsx) now.
    expect(screen.queryByText("Live · Events")).toBeNull()
    expect(screen.queryByText("Corporate · Media")).toBeNull()
    const grid = container.querySelector("#brands .grid")
    // Every grid child is a card (article), in division order: seaside,
    // inside, outside, highrise, soundcheck.
    const children = Array.from(grid?.children ?? [])
    expect(children).toHaveLength(5)
    expect(children.every((el) => el.tagName === "ARTICLE")).toBe(true)
  })

  it("shows a Live//Events + Corporate//Media rule bar above the single-row grid (owner correction, 2026-09-02)", () => {
    const { getByTestId } = render(<Brands />)
    const liveEvents = getByTestId("division-label-live-events")
    const corporateMedia = getByTestId("division-label-corporate-media")
    expect(liveEvents.textContent?.replace(/\s+/g, " ").trim()).toBe("Live // Events")
    expect(corporateMedia.textContent?.replace(/\s+/g, " ").trim()).toBe("Corporate // Media")
    // Each label is colored, not left at the default foreground.
    expect(liveEvents.style.color).not.toBe("")
    expect(corporateMedia.style.color).not.toBe("")
  })

  it("switches to the PLATFORM tab and shows the five program cards", async () => {
    const user = userEvent.setup()
    render(<Brands />)
    await user.click(screen.getByRole("button", { name: "Platform" }))
    for (const name of ["LUPFR VIP", "LP Program", "LUPFR Media", "LUPFR Hospitality", "LUPFR Ventures"]) {
      expect(screen.getByText(name)).toBeInTheDocument()
    }
    // The operating cards are gone while the platform tab is active.
    expect(screen.queryByText("YACHTS")).toBeNull()
  })

  it("gives every platform program card a real background photo (owner correction, 2026-09-02)", async () => {
    const user = userEvent.setup()
    const { container } = render(<Brands />)
    await user.click(screen.getByRole("button", { name: "Platform" }))
    const images = Array.from(container.querySelectorAll('img[src*="%2Fplatforms%2F"]'))
    expect(images).toHaveLength(5)
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
