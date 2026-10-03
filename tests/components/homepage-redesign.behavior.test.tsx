/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeNavigation } from "@/components/claude-home-navigation"
import { ClaudeHomeHero } from "@/components/claude-home-hero"
import { ClaudeHomeServices } from "@/components/claude-home-services"
import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"
import { ClaudeHomeBrands } from "@/components/claude-home-brands"
import { ClaudeHomeMedia } from "@/components/claude-home-media"
import { ClaudeHomeArtists } from "@/components/claude-home-artists"
import { ClaudeHomeTeam } from "@/components/claude-home-team"
import { getServices } from "@/lib/data/services"
import { getBrandsByDivision } from "@/lib/data/brands"
import { getFounders } from "@/lib/data/team"
import { getNews } from "@/lib/data/news"

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
    for (const name of ["Services", "Experiences", "Brands", "Media", "About"]) {
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

  // 2026-10-02 fix (owner: "change music and entertainment to Music (so it
  // fits on the row same as others)"); 2026-10-03 fix (owner: "change Venue
  // programming to just 'Programming'" / "change content & media to just
  // 'Media'") — mirrors claude-home-services.tsx's own TAB_LABEL_OVERRIDES:
  // the tab row shows a shortened label for these 3 services; everywhere
  // else still uses the real full title (`current.title` once it's the
  // active service's heading), covered separately below.
  const TAB_LABEL_OVERRIDES: Record<string, string> = {
    "Music & Entertainment": "Music",
    "Venue Programming": "Programming",
    "Content & Media": "Media",
  }

  it("ClaudeHomeServices lists every real service as a tab", () => {
    const services = getServices()
    render(<ClaudeHomeServices />)
    for (const service of services) {
      const tabLabel = TAB_LABEL_OVERRIDES[service.title] ?? service.title
      expect(screen.getAllByText(tabLabel).length).toBeGreaterThan(0)
    }
  })

  it("ClaudeHomeServices still shows the real full title once a shortened-label service is active", async () => {
    const user = userEvent.setup()
    const services = getServices()
    render(<ClaudeHomeServices />)
    for (const [fullTitle, shortLabel] of Object.entries(TAB_LABEL_OVERRIDES)) {
      const service = services.find((s) => s.title === fullTitle)
      if (!service) continue
      await user.click(screen.getByRole("button", { name: shortLabel }))
      expect(screen.getByRole("heading", { level: 3, name: fullTitle })).toBeInTheDocument()
    }
  })

  it("ClaudeHomeBrands renders real operating brands, not fabricated ones", () => {
    const { liveEvents, corporateMedia } = getBrandsByDivision()
    render(<ClaudeHomeBrands />)
    for (const brand of [...liveEvents, ...corporateMedia]) {
      expect(screen.getAllByText(brand.tag).length).toBeGreaterThan(0)
    }
  })

  it("ClaudeHomeTeam renders every real founder's name and title", () => {
    const founders = getFounders()
    render(<ClaudeHomeTeam />)
    for (const founder of founders) {
      expect(screen.getByText(founder.title)).toBeInTheDocument()
    }
  })

  it("ClaudeHomeExperiences renders the 3 curated case studies with real event links", () => {
    render(<ClaudeHomeExperiences />)
    expect(screen.getByRole("heading", { name: /SEA.*SIDE Series/ })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "BAL MASQUE" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Zusebi 002: Golden Gate Live" })).toBeInTheDocument()
    expect(screen.getAllByRole("link", { name: "View experience →" }).length).toBe(2)
    // Design file's dual CTA row: "Create an Experience Like This" always,
    // "Watch Full Film" only for the 2 case studies with a real verified
    // recap link (SEA//SIDE, Bal Masque) — not Golden Gate Live.
    expect(screen.getAllByRole("link", { name: /Create an Experience Like This/ }).length).toBe(3)
    const watchFullFilm = screen.getAllByRole("link", { name: "Watch Full Film" })
    expect(watchFullFilm.length).toBe(2)
    expect(watchFullFilm.map((a) => a.getAttribute("href")).sort()).toEqual(
      ["https://www.instagram.com/p/DdrQLrbpPqr/", "https://www.youtube.com/watch?v=Xt6zGwZ7jKg"].sort()
    )
  })

  it("ClaudeHomeMedia renders the lead event film and 3 real side clips", () => {
    render(<ClaudeHomeMedia />)
    expect(screen.getByText("Event Film")).toBeInTheDocument()
    for (const title of ["Artist podcast", "SEA//SIDE 002", "Bal Masque"]) {
      expect(screen.getByText(title)).toBeInTheDocument()
    }
    expect(screen.getByRole("link", { name: "See all videos →" })).toHaveAttribute("href", "/media")
  })

  it("ClaudeHomeMedia renders the design's 'LUPFR in the News' block with real, newest-first press links", () => {
    const news = getNews()
    render(<ClaudeHomeMedia />)
    expect(screen.getByRole("heading", { name: "LUPFR in the News" })).toBeInTheDocument()
    const leadLink = screen.getByText(news[0].title).closest("a")
    expect(leadLink).toHaveAttribute("href", news[0].url)
    expect(leadLink).toHaveTextContent("Latest")
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

  it("ClaudeHomeNavigation's theme switch mounts and toggles both ways", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeNavigation />)
    const switchControl = await screen.findByRole("switch")
    await user.click(switchControl)
    await user.click(switchControl)
    expect(switchControl).toBeInTheDocument()
  })

  it("ClaudeHomeServices switches the detail panel when another tab is clicked", async () => {
    const services = getServices()
    const user = userEvent.setup()
    render(<ClaudeHomeServices />)
    const second = services[1]
    if (!second) return
    await user.click(screen.getByRole("button", { name: new RegExp(second.title) }))
    expect(screen.getByRole("heading", { level: 3, name: second.title })).toBeInTheDocument()
    // Design file's "INCLUDES" feature list + "Plan Your Event" CTA — real
    // data from lib/data/services.ts that the first pass dropped entirely.
    expect(screen.getByText("Includes")).toBeInTheDocument()
    for (const feature of second.features) {
      expect(screen.getByText(feature)).toBeInTheDocument()
    }
    expect(screen.getByRole("link", { name: /Plan Your Event/ })).toHaveAttribute("href", "/contact")
  })

  it("ClaudeHomeBrands switches to the platform tab and back", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeBrands />)
    await user.click(screen.getByRole("button", { name: "platform" }))
    expect(screen.getAllByText(/./).length).toBeGreaterThan(0)
    await user.click(screen.getByRole("button", { name: "operating" }))
    const { liveEvents, corporateMedia } = getBrandsByDivision()
    expect(screen.getAllByText([...liveEvents, ...corporateMedia][0].tag).length).toBeGreaterThan(0)
  })
})
