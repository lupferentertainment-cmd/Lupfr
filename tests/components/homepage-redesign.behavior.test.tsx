/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeNavigation } from "@/components/claude-home-navigation"
import { ClaudeHomeHero } from "@/components/claude-home-hero"
import { ClaudeHomeServices } from "@/components/claude-home-services"
import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"
import { ClaudeHomeBrands } from "@/components/claude-home-brands"
import { MediaNewsFeature } from "@/components/media-news-feature"
import { ClaudeHomeArtists } from "@/components/claude-home-artists"
import { ClaudeHomePartifulBand } from "@/components/claude-home-partiful-band"
import { getServices } from "@/lib/data/services"
import { getBrandsByDivision } from "@/lib/data/brands"
import { getHomeNews } from "@/lib/data/news"

/**
 * Oct 1 2026 homepage redesign (owner table: "The changes I want are ...").
 * Navbar/Hero/News/Brands/Events/Services/Artists/Team become the new
 * claude-home-*.tsx sibling components; Partners/About/Follow the
 * Momentum/Contact/Footer are untouched. These are render-level contracts
 * for the new sections. The source-string "scope lock" on home-page.tsx
 * lives in tests/unit/homepage-redesign-scope-lock.test.ts instead of here:
 * this file runs under happy-dom (environmentMatchGlobs in vitest.config.ts
 * forces that on every *.test.tsx), and node:fs/path/url reads crash there
 * on Vercel's build machine ("No such built-in module: node:") even though
 * they're fine under plain Node — the same reason the two sibling guardrail
 * files (home-performance.test.ts, look-and-feel.test.ts) are .test.ts, not
 * .test.tsx.
 */

describe("new homepage sections render their real data", () => {
  it("ClaudeHomeNavigation renders the simplified primary nav + CTA", () => {
    render(<ClaudeHomeNavigation />)
    for (const name of ["Services", "Experiences", "Brands", "Media", "About", "Team"]) {
      expect(screen.getAllByText(name).length).toBeGreaterThan(0)
    }
    expect(screen.getAllByText("Plan Your Event").length).toBeGreaterThan(0)
  })

  it("ClaudeHomeHero renders the LUPFR lockup and both CTAs", () => {
    render(<ClaudeHomeHero />)
    expect(screen.getByRole("heading", { name: "LUPFR" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Plan Your Event" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toBeInTheDocument()
  })

  it("ClaudeHomeServices lists every real service as a card with its real title and description", () => {
    const services = getServices()
    render(<ClaudeHomeServices />)
    for (const service of services) {
      expect(screen.getByRole("heading", { level: 3, name: service.title })).toBeInTheDocument()
      expect(screen.getByText(service.description)).toBeInTheDocument()
    }
  })

  it("ClaudeHomeBrands renders real operating brands, not fabricated ones", () => {
    const { liveEvents, corporateMedia } = getBrandsByDivision()
    render(<ClaudeHomeBrands />)
    for (const brand of [...liveEvents, ...corporateMedia]) {
      // v5 Reveal tiles: each real brand is a link to its landing page showing its real description.
      expect(screen.getByRole("link", { name: new RegExp(brand.description.slice(0, 20)) })).toHaveAttribute("href", `/brands/${brand.key}`)
    }
  })

  it("ClaudeHomePartifulBand keeps the Backed by Partiful announcement (moved out of the removed Founders section)", () => {
    render(<ClaudeHomePartifulBand />)
    expect(screen.getByRole("heading", { name: "Backed by Partiful" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Follow LUPFR on Partiful →" })).toBeInTheDocument()
  })

  it("ClaudeHomeExperiences renders the 3 curated case studies (plus the SKI//SIDE teaser) with real event links", () => {
    render(<ClaudeHomeExperiences />)
    expect(screen.getByRole("heading", { name: /SEA.*SIDE Series/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "BAL MASQUE" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Zusebi 002: Golden Gate Live" })).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "View experience →" }).length).toBe(2)
    // v5 CTA row: "Create One Like This →" always, "Watch Film" only for the
    // 2 case studies with a real verified recap link (SEA//SIDE, Bal Masque)
    // — not Golden Gate Live.
    expect(screen.getAllByRole("link", { name: /Create One Like This/ }).length).toBe(3)
    const watchFullFilm = screen.getAllByRole("link", { name: "Watch Film" })
    expect(watchFullFilm.length).toBe(2)
    expect(watchFullFilm.map((a) => a.getAttribute("href")).sort()).toEqual(
      ["https://www.instagram.com/p/DdrQLrbpPqr/", "https://www.youtube.com/watch?v=Xt6zGwZ7jKg"].sort()
    )
  })

  it("MediaNewsFeature (on /media) renders the 'LUPFR in the News' block with real, newest-first press links and a square lead photo", () => {
    const news = getHomeNews()
    render(<MediaNewsFeature />)
    expect(screen.getByRole("region", { name: "LUPFR in the News" })).toBeInTheDocument()
    const leadLink = screen.getByText(news[0].title).closest("a")
    expect(leadLink).toHaveAttribute("href", news[0].url)
    expect(leadLink).toHaveTextContent("Latest")
    expect(leadLink?.className).toContain("aspect-square")
    expect(leadLink?.querySelector("img")?.getAttribute("style")).toContain("50% 10%")
    for (const item of news.slice(1, 4)) {
      expect(screen.getByText(new RegExp(item.title.slice(0, 30)))).toBeInTheDocument()
    }
  })

  it("ClaudeHomeArtists renders without crashing on real artist data", () => {
    expect(() => render(<ClaudeHomeArtists />)).not.toThrow()
  })

  it("ClaudeHomeNavigation's hamburger opens and closes the mobile menu", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeNavigation />)
    const toggle = screen.getByLabelText("Toggle menu")
    expect(screen.queryAllByText("Experiences")).toHaveLength(1)
    await user.click(toggle)
    expect(screen.queryAllByText("Experiences").length).toBeGreaterThan(1)
    // Clicking a mobile link closes the drawer again.
    await user.click(screen.getAllByText("Experiences")[1])
    expect(screen.queryAllByText("Experiences")).toHaveLength(1)
  })

  it("ClaudeHomeNavigation no longer renders a light/dark switch (owner 2026-11-17: it was not working)", () => {
    render(<ClaudeHomeNavigation />)
    expect(screen.queryByRole("switch")).toBeNull()
  })

  it("ClaudeHomeBrands switches to the platform tab and back", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeBrands />)
    await user.click(screen.getByRole("button", { name: "platform" }))
    expect(screen.getByTestId("brands-grid-platform")).toBeInTheDocument()
    expect(screen.queryByTestId("brands-grid-operating")).toBeNull()
    await user.click(screen.getByRole("button", { name: "operating" }))
    expect(screen.getByTestId("brands-grid-operating")).toBeInTheDocument()
    expect(screen.queryByTestId("brands-grid-platform")).toBeNull()
  })
})
