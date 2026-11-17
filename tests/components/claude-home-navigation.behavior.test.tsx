/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeNavigation } from "@/components/claude-home-navigation"

/**
 * Round 12 (owner handoff "LUPFR Website Design v15"): six header links
 * (v16 dropped the 01–06 numbers) and the same labels in the mobile menu.
 */
const EXPECTED: Array<[string, string]> = [
  ["Services", "#services"],
  ["Experiences", "#events"],
  ["Brands", "#brands"],
  ["Media", "#news"],
  ["About", "#about"],
  ["Team", "#team"],
]

describe("ClaudeHomeNavigation (v15)", () => {
  it("renders the six links in order with their section anchors", () => {
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    const links = within(primary).getAllByRole("link").filter((a) => a.getAttribute("href")?.startsWith("#") && a.getAttribute("href") !== "#")
    expect(links.map((a) => [a.textContent?.replace(/^\d+/, ""), a.getAttribute("href")])).toEqual(EXPECTED)
  })

  it("has no numbers before the labels (v16: numbered nav removed)", () => {
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    for (const [label] of EXPECTED) expect(within(primary).getByRole("link", { name: label })).toBeInTheDocument()
    expect(primary.querySelector("a > span[aria-hidden='true']")).toBeNull()
    for (const a of Array.from(primary.querySelectorAll("a[href^='#']")).filter((n) => n.getAttribute("href") !== "#")) {
      expect(a.textContent).not.toMatch(/\d/)
    }
  })

  it("uses Barlow Condensed 600 / 15px uppercase labels spaced 30px apart", () => {
    render(<ClaudeHomeNavigation />)
    const link = within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Services" })
    for (const cls of ["font-condensed", "text-[15px]", "font-semibold", "uppercase"]) expect(link.className).toContain(cls)
    expect(link.parentElement?.className).toContain("gap-[30px]")
  })

  it("opens a mobile menu with the same six labels and closes it on selection", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeNavigation />)
    const toggle = screen.getByRole("button", { name: "Toggle menu" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")
    const menu = screen.getByRole("navigation", { name: "Site navigation" })
    expect(within(menu).getAllByRole("link").slice(0, 6).map((a) => [a.textContent, a.getAttribute("href")])).toEqual(EXPECTED)
    await user.click(within(menu).getByRole("link", { name: "Team" }))
    expect(screen.queryByRole("navigation", { name: "Site navigation" })).not.toBeInTheDocument()
  })

  it("closes the mobile menu from the Plan Your Event link too", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeNavigation />)
    await user.click(screen.getByRole("button", { name: "Toggle menu" }))
    await user.click(within(screen.getByRole("navigation", { name: "Site navigation" })).getByRole("link", { name: "Plan Your Event" }))
    expect(screen.queryByRole("navigation", { name: "Site navigation" })).not.toBeInTheDocument()
  })
})
