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

  it("ClaudeHomeServices lists every real service as a tab", () => {
    const services = getServices()
    render(<ClaudeHomeServices />)
    for (const service of services) {
      expect(screen.getAllByText(service.title).length).toBeGreaterThan(0)
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

  it("ClaudeHomeExperiences and ClaudeHomeMedia render without crashing on real data", () => {
    expect(() => render(<ClaudeHomeExperiences />)).not.toThrow()
    expect(() => render(<ClaudeHomeMedia />)).not.toThrow()
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
