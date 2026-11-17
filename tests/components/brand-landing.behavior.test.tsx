/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { BrandLanding } from "@/components/brand-landing"
import { brandPlainTitle, getBrandBySlug, getBrands } from "@/lib/data/brands"

/**
 * LUPFR Website Design v16: every brand gets the full landing — hero with
 * tagline + CTA, THE FORMAT (statement, format photo + three icon pillars),
 * gallery, "bring it to you" plan box with the brand's accounts, and the other
 * five brands with a "See Past Events" button. v5 (2026-11-17) removed the
 * "On the calendar" section. Copy comes from data/brands.yml's `landing` block.
 */
describe("BrandLanding", () => {
  it.each(getBrands().map((b) => b.key))("%s renders hero, format, plan box and the other five brands, with no calendar", (key) => {
    const brand = getBrandBySlug(key)!
    render(<BrandLanding brand={brand} />)
    const landing = brand.landing!

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(brand.title.replace("//", "//"))
    expect(screen.getByText(landing.tagline)).toBeInTheDocument()
    expect(screen.getByText(brand.description)).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: landing.cta })).toHaveLength(2) // hero + plan box
    expect(screen.getByRole("heading", { level: 2, name: landing.statement })).toBeInTheDocument()
    expect(screen.getAllByTestId("brand-pillar")).toHaveLength(3)
    expect(screen.queryByRole("heading", { level: 2, name: "On the calendar" })).toBeNull()
    expect(screen.queryByTestId("brand-upcoming")).toBeNull()
    expect(screen.queryByTestId("brand-past")).toBeNull()
    // v5: every pillar carries one of the brand's icons, and the format photo carries the motif disc.
    expect(screen.getAllByTestId("brand-pillar-icon")).toHaveLength(3)
    expect(screen.getByTestId("brand-motif")).toBeInTheDocument()
    expect(screen.getByTestId("brand-format-photo")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: `Your event. ${brand.title} production.` })).toBeInTheDocument()
    expect(screen.getByText(`BRING ${brand.title} TO YOU`)).toBeInTheDocument()
    expect(within(screen.getByTestId("brand-others")).getAllByRole("link")).toHaveLength(5)
    const otherNames = within(screen.getByTestId("brand-others")).getAllByRole("link").map((a) => a.getAttribute("aria-label"))
    expect(otherNames.some((n) => n?.startsWith(brandPlainTitle(brand) + " —"))).toBe(false)
  })

  it("links an outlined 'See Past Events →' button to /events from the More-from header", () => {
    render(<BrandLanding brand={getBrandBySlug("seaside")!} />)
    const button = screen.getByTestId("see-past-events")
    expect(button).toHaveAttribute("href", "/events")
    expect(button).toHaveTextContent("See Past Events")
    expect(button).toHaveStyle({ color: getBrandBySlug("seaside")!.accent })
  })

  it("uses the format photo gallery[1] || gallery[0] || the brand image, and the 4th icon as the motif", () => {
    const { container, unmount } = render(<BrandLanding brand={getBrandBySlug("skiside")!} />)
    expect(screen.getByTestId("brand-format-photo").querySelector("img")!.getAttribute("src")).toContain("skiside-photo-install")
    expect(screen.getByTestId("brand-motif").querySelector("svg")!.getAttribute("data-icon")).toBe("snow")
    expect(Array.from(container.querySelectorAll("[data-testid=brand-pillar-icon] svg")).map((n) => n.getAttribute("data-icon"))).toEqual(["mountain", "mug", "gondola"])
    unmount()
    const only = { ...getBrandBySlug("inside")!, gallery: ["/brands/inside-1.webp"] }
    render(<BrandLanding brand={only} />)
    expect(screen.getByTestId("brand-format-photo").querySelector("img")!.getAttribute("src")).toContain("inside-1")
  })

  it("renders SKI//SIDE's v5 copy: 'Last run. First track.', the three pillars and its six photos", () => {
    render(<BrandLanding brand={getBrandBySlug("skiside")!} />)
    expect(screen.getByRole("heading", { level: 2, name: "Last run. First track." })).toBeInTheDocument()
    expect(screen.getByText("Après ski, amplified.")).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "Partner with SKI//SIDE" })).toHaveLength(2)
    expect(screen.getByText("World-class performers")).toBeInTheDocument()
    expect(screen.getByText("The scene")).toBeInTheDocument()
    expect(screen.getByText("The collection")).toBeInTheDocument()
    expect(screen.getByTestId("brand-gallery").children).toHaveLength(6)
  })

  it("draws SKI//SIDE's slash artwork in the hero and every brand's gallery from its own photos", () => {
    const { container } = render(<BrandLanding brand={getBrandBySlug("skiside")!} />)
    expect(container.querySelector("h1 [data-brand-slash-image]")).not.toBeNull()
    expect(screen.getByTestId("brand-gallery").children).toHaveLength(6)
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

  it("links HIGH//RISE's own Instagram (confirmed in the v5 design)", () => {
    render(<BrandLanding brand={getBrandBySlug("highrise")!} />)
    expect(screen.getByRole("link", { name: /@high\.rise\.la\s*INSTAGRAM/i })).toHaveAttribute("href", "https://www.instagram.com/high.rise.la/")
    expect(screen.queryByText(/via LUPFR/)).toBeNull()
  })

  it("routes brands without their own accounts to LUPFR's real channels, labelled 'via LUPFR'", () => {
    render(<BrandLanding brand={getBrandBySlug("inside")!} />)
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
    expect(screen.queryByTestId("brand-format-photo")).toBeNull()
  })
})
