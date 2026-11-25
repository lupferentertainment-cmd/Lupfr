/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { ClaudeHomeHero } from "@/components/claude-home-hero"
import { ClaudeHomeServices } from "@/components/claude-home-services"
import { ClaudeHomeBrands } from "@/components/claude-home-brands"
import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"

/**
 * v6 mobile follow-ups (owner, 2026-11-25). happy-dom does not apply Tailwind, so these pin the responsive class
 * contract instead: which elements are hidden on phones, which spread across the screen, and the one-line headings.
 * The global MobileStickyCta bar is `lg:hidden` (< 1024px), so the duplicate in-page "Plan Your Event" buttons are
 * hidden at exactly `max-[1023px]`. The real cascade is checked in tests/unit/brands-desktop-breakpoint-css.test.ts.
 */
describe("v6 mobile tweaks", () => {
  it("hides the hero's Plan Your Event button below 1024px (the sticky bottom bar already carries it)", () => {
    render(<ClaudeHomeHero />)
    const cta = screen.getByRole("link", { name: "Plan Your Event" })
    expect(cta).toHaveAttribute("href", "/contact")
    expect(cta.className).toContain("max-[1023px]:hidden")
  })

  it("hides the Services header CTA on phones and spreads the Services/Platforms toggle edge to edge", () => {
    render(<ClaudeHomeServices />)
    expect(screen.getByTestId("services-header-cta").className).toContain("max-[1023px]:hidden")
    const toggle = screen.getByRole("group", { name: "Services or platforms" })
    expect(toggle.className).toContain("max-[900px]:w-full")
    for (const button of within(toggle).getAllByRole("button")) {
      expect(button.className).toContain("max-[900px]:flex-1")
      expect(button.className).toContain("max-[900px]:justify-center")
    }
  })

  it("drops the 'Full event design & execution' strip on phones only", () => {
    render(<ClaudeHomeServices />)
    const strip = screen.getByTestId("services-footer-cta").parentElement!
    expect(strip.className).toContain("max-[900px]:hidden")
    expect(strip.className).not.toContain("max-[900px]:flex")
  })

  it("keeps the services section's bottom padding short on phones so there is less black before Brands", () => {
    const { container } = render(<ClaudeHomeServices />)
    const section = container.querySelector("section#services")!
    expect(section.className).toContain("pb-8")
    expect(section.className).not.toContain("py-[72px]")
    expect(section.className).toContain("min-[901px]:py-[84px]")
  })

  it("shows a shorter single-line intro under 'Find your side.' on phones and the full line on desktop", () => {
    render(<ClaudeHomeBrands />)
    const full = screen.getByText(/Four experience brands, one crew/)
    expect(full.className).toContain("max-[900px]:hidden")
    const short = screen.getByText("Four brands, one crew. Pick your setting.")
    expect(short.className).toContain("max-[900px]:inline")
    expect(short.parentElement!.className).toContain("max-[900px]:whitespace-nowrap")
  })

  it("keeps a single Explore LUPFR link and orders it after the card grid on phones", () => {
    render(<ClaudeHomeBrands />)
    const links = screen.getAllByRole("link", { name: "Explore LUPFR →" })
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute("href", "/brands")
    expect(links[0]!.className).toContain("max-[900px]:order-4")
    expect(screen.getByTestId("brands-grid").className).toContain("max-[900px]:order-3")
    // the wrappers flatten (display: contents) at <=900px so the ordering reaches the section's flex column
    expect(links[0]!.parentElement!.className).toContain("max-[900px]:contents")
    expect(links[0]!.parentElement!.parentElement!.className).toContain("max-[900px]:contents")
  })

  it("fits the 'Featured Experiences' title on one row and shrinks its intro on phones", () => {
    const { container } = render(<ClaudeHomeExperiences />)
    const h2 = container.querySelector("#events h2")!
    expect(h2.className).toContain("max-[900px]:whitespace-nowrap")
    expect(h2.className).toContain("max-[900px]:text-[clamp(26px,8.4vw,52px)]")
    const intro = h2.nextElementSibling as HTMLElement
    expect(intro.className).toContain("max-[900px]:text-[13px]")
  })
})
