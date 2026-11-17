/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeHero } from "@/components/claude-home-hero"

/**
 * LUPFR Website Design v5 (owner, 2026-11-17) hero: the tagline reads
 * "Real Experiences // Music-Led // Built for You." with gold skewed dividers;
 * the three tabs lead with the brand wordmark, `0N · EVENT NAME` beneath;
 * at <=760px only the logo, wordmark, tagline and Plan Your Event remain.
 */
describe("ClaudeHomeHero v5", () => {
  it("renders the tagline with gold skewed // dividers instead of periods", () => {
    render(<ClaudeHomeHero />)
    const tagline = screen.getByTestId("hero-tagline")
    expect(tagline).toHaveTextContent(/Real Experiences\s*\/\/\s*Music-Led\s*\/\/\s*Built for You\./)
    const dividers = [...tagline.querySelectorAll("span[aria-hidden]")].filter((el) => el.textContent === "//")
    expect(dividers).toHaveLength(2)
    for (const d of dividers) expect(d).toHaveClass("text-[#c9a869]", "-skew-x-12")
    expect(tagline).toHaveClass("min-[761px]:whitespace-nowrap")
  })

  it("leads each tab with its brand wordmark in order IN//SIDE, SEA//SIDE, OUT//SIDE, event name beneath", () => {
    render(<ClaudeHomeHero />)
    const brands = screen.getAllByTestId("hero-tab-brand")
    expect(brands.map((b) => b.textContent)).toEqual(["IN//SIDE", "SEA//SIDE", "OUT//SIDE"])
    expect(screen.getByText("01 · Bal Masque")).toBeInTheDocument()
    expect(screen.getByText("02 · Yacht Series")).toBeInTheDocument()
    expect(screen.getByText("03 · Golden Gate")).toBeInTheDocument()
  })

  it("keeps the active tab at full opacity and the others at 42%, following clicks", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeHero />)
    const brands = () => screen.getAllByTestId("hero-tab-brand")
    expect(brands()[0]).toHaveClass("opacity-100")
    expect(brands()[1]).toHaveClass("opacity-[0.42]")
    await user.click(screen.getByText("03 · Golden Gate"))
    expect(brands()[2]).toHaveClass("opacity-100")
    expect(brands()[0]).toHaveClass("opacity-[0.42]")
  })

  it("hides the second button, the gold rule and the logo divider at <=760px", () => {
    const { container } = render(<ClaudeHomeHero />)
    expect(screen.getByRole("link", { name: "Explore Our Work" })).toHaveClass("max-[760px]:hidden")
    expect(screen.getByRole("link", { name: "Plan Your Event" })).not.toHaveClass("max-[760px]:hidden")
    const hiddenOnPhone = container.querySelectorAll("[aria-hidden].max-\\[760px\\]\\:hidden")
    expect(hiddenOnPhone.length).toBeGreaterThanOrEqual(2)
  })
})
