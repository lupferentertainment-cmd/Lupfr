/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { BrandLanding } from "@/components/brand-landing"
import { brandPlainTitle, getBrandBySlug, getBrands } from "@/lib/data/brands"

/**
 * LUPFR Website Design v16: every brand gets the full landing — hero with
 * tagline + CTA, THE FORMAT (statement + three pillars), calendar, gallery,
 * "bring it to you" plan box with the brand's accounts, and the other five
 * brands. Copy comes from data/brands.yml's `landing` block.
 */
describe("BrandLanding", () => {
  it.each(getBrands().map((b) => b.key))("%s renders hero, format, calendar, plan box and the other five brands", (key) => {
    const brand = getBrandBySlug(key)!
    render(<BrandLanding brand={brand} />)
    const landing = brand.landing!

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(brand.title.replace("//", "//"))
    expect(screen.getByText(landing.tagline)).toBeInTheDocument()
    expect(screen.getByText(brand.description)).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: landing.cta })).toHaveLength(2) // hero + plan box
    expect(screen.getByRole("heading", { level: 2, name: landing.statement })).toBeInTheDocument()
    expect(screen.getAllByTestId("brand-pillar")).toHaveLength(3)
    expect(screen.getByRole("heading", { level: 2, name: "On the calendar" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: `Your event. ${brand.title} production.` })).toBeInTheDocument()
    expect(screen.getByText(`BRING ${brand.title} TO YOU`)).toBeInTheDocument()
    expect(within(screen.getByTestId("brand-others")).getAllByRole("link")).toHaveLength(5)
    const otherNames = within(screen.getByTestId("brand-others")).getAllByRole("link").map((a) => a.getAttribute("aria-label"))
    expect(otherNames.some((n) => n?.startsWith(brandPlainTitle(brand) + " —"))).toBe(false)
  })

  it("shows the empty-calendar line + 'Get in touch' when there are no upcoming events, and the past placeholder", () => {
    render(<BrandLanding brand={getBrandBySlug("skiside")!} />)
    const upcoming = screen.getByTestId("brand-upcoming")
    expect(within(upcoming).getByText(/SKI\/\/SIDE launches in 2027/)).toBeInTheDocument()
    expect(within(upcoming).getByRole("link", { name: "Get in touch →" })).toHaveAttribute("href", "/contact")
    expect(within(screen.getByTestId("brand-past")).getByText("The first chapter is still being written.")).toBeInTheDocument()
  })

  it("draws SKI//SIDE's slash artwork in the hero and every brand's gallery from its own photos", () => {
    const { container } = render(<BrandLanding brand={getBrandBySlug("skiside")!} />)
    expect(container.querySelector("h1 [data-brand-slash-image]")).not.toBeNull()
    expect(screen.getByTestId("brand-gallery").children).toHaveLength(1)
  })

  it("renders 6 gallery tiles for SEA//SIDE with the first spanning 2×2 and the fourth 2 wide", () => {
    render(<BrandLanding brand={getBrandBySlug("seaside")!} />)
    const tiles = Array.from(screen.getByTestId("brand-gallery").children)
    expect(tiles).toHaveLength(6)
    expect(tiles[0].className).toContain("col-span-2 row-span-2")
    expect(tiles[3].className).toContain("col-span-2")
    expect(tiles[1].className).not.toContain("col-span-2")
  })

  it("links SEA//SIDE's own verified accounts and its external site", () => {
    render(<BrandLanding brand={getBrandBySlug("seaside")!} />)
    expect(screen.getByRole("link", { name: /@seaside\.la\s*INSTAGRAM/i })).toHaveAttribute("href", "https://www.instagram.com/seaside.la/")
    expect(screen.getByRole("link", { name: /Visit seaside\.la/ })).toHaveAttribute("href", "https://seaside.la")
  })

  it("routes brands without their own accounts to LUPFR's real channels, labelled 'via LUPFR'", () => {
    render(<BrandLanding brand={getBrandBySlug("highrise")!} />)
    const follow = screen.getByRole("link", { name: /@lupfr_\s*INSTAGRAM · via LUPFR/i })
    expect(follow).toHaveAttribute("href", "https://www.instagram.com/lupfr_/")
  })

  it("keeps the pitch deck on HIGH//RISE only", () => {
    const { unmount } = render(<BrandLanding brand={getBrandBySlug("highrise")!} />)
    expect(screen.getAllByRole("button", { name: /deck/i }).length).toBeGreaterThan(0)
    unmount()
    render(<BrandLanding brand={getBrandBySlug("inside")!} />)
    expect(screen.queryByRole("button", { name: /deck/i })).toBeNull()
  })

  it("falls back gracefully for a brand without landing copy, image or gallery", () => {
    const bare = { key: "x", title: "AA//BB", tag: "T", accent: "#ffffff", description: "Bare.", format: "F" }
    render(<BrandLanding brand={bare} />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("AA")
    expect(screen.getAllByRole("link", { name: "Plan a AA//BB event" })).toHaveLength(2)
    expect(screen.queryByTestId("brand-gallery")).toBeNull()
    expect(screen.queryByTestId("brand-pillar")).toBeNull()
    expect(screen.getByText("New dates are announced soon.")).toBeInTheDocument()
  })
})
