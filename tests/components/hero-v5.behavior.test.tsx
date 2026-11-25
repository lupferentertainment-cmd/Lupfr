/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { ClaudeHomeHero } from "@/components/claude-home-hero"

/**
 * LUPFR Website Design v5/v6 hero: the tagline reads "Real Experiences // Music-Led // Built for You."
 * with thin gold skewed dividers; v6 (2026-11-24) removed the left lockup and the 01/02/03 picker.
 */
describe("ClaudeHomeHero v5", () => {
  it("renders the tagline with gold skewed // dividers instead of periods", () => {
    render(<ClaudeHomeHero />)
    const tagline = screen.getByTestId("hero-tagline")
    expect(tagline).toHaveTextContent(/Real Experiences\s*\/\/\s*Music-Led\s*\/\/\s*Built for You\./)
    const dividers = [...tagline.querySelectorAll("span[aria-hidden]")].filter((el) => el.textContent === "//")
    expect(dividers).toHaveLength(2)
    for (const d of dividers) expect(d).toHaveClass("text-[#c9a869]", "-skew-x-12", "font-light")
    expect(tagline).toHaveClass("min-[761px]:whitespace-nowrap")
  })

  it("drops the 01/02/03 picker in v6 (the videos still rotate behind the mark)", () => {
    render(<ClaudeHomeHero />)
    expect(screen.queryAllByTestId("hero-tab-brand")).toHaveLength(0)
    expect(screen.queryByText(/01 · Bal Masque/)).toBeNull()
  })

  it("hides only the second button at <=760px and keeps Plan Your Event", () => {
    render(<ClaudeHomeHero />)
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveClass("max-[760px]:hidden")
    expect(screen.getByRole("link", { name: "Plan Your Event" })).not.toHaveClass("max-[760px]:hidden")
  })
})
