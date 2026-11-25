/** @vitest-environment happy-dom */

import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ClaudeHomeNavigation } from "@/components/claude-home-navigation"

const nav = vi.hoisted(() => ({ pathname: "/" as string | null }))
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }))

/**
 * Round 12 (owner handoff "LUPFR Website Design v15"): six header links
 * (v16 dropped the 01–06 numbers) and the same labels in the mobile menu.
 */
const EXPECTED: Array<[string, string]> = [
  ["Services", "#services"],
  ["Experiences", "#events"],
  ["Brands", "#brands"],
  ["Media", "/media"],
  ["About", "/about"],
  ["Team", "/about#team"],
]

describe("ClaudeHomeNavigation (v15)", () => {
  beforeEach(() => {
    nav.pathname = "/"
  })

  it("renders the six links in order with their section anchors", () => {
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    const links = within(primary).getAllByRole("link").filter((a) => a.getAttribute("href") !== "#" && !a.getAttribute("aria-label") && a.textContent !== "Plan Your Event")
    expect(links.map((a) => [a.textContent?.replace(/^\d+/, ""), a.getAttribute("href")])).toEqual(EXPECTED)
  })

  it("has no numbers before the labels (v16: numbered nav removed)", () => {
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    for (const [label] of EXPECTED) expect(within(primary).getByRole("link", { name: label })).toBeInTheDocument()
    expect(primary.querySelector("a > span[aria-hidden='true']")).toBeNull()
    for (const a of Array.from(primary.querySelectorAll("a[href^='#'], a[href^='/about']")).filter((n) => n.getAttribute("href") !== "#")) {
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

  it("off the home page the section tabs become /#anchors, the logo goes home, and About is current on /about", () => {
    nav.pathname = "/about"
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    expect(within(primary).getByRole("link", { name: "Services" })).toHaveAttribute("href", "/#services")
    expect(within(primary).getByRole("link", { name: "Media" })).toHaveAttribute("href", "/media")
    expect(within(primary).getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page")
    expect(within(primary).getByRole("link", { name: "Team" })).toHaveAttribute("href", "/about#team")
    expect(within(primary).getByRole("link", { name: "LUPFR home" })).toHaveAttribute("href", "/")
  })

  it("marks Media as the current page on /media", () => {
    nav.pathname = "/media"
    render(<ClaudeHomeNavigation />)
    const primary = screen.getByRole("navigation", { name: "Primary" })
    expect(within(primary).getByRole("link", { name: "Media" })).toHaveAttribute("aria-current", "page")
    expect(within(primary).getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current")
  })

  it("treats a null pathname (no app router) as the home page", () => {
    nav.pathname = null
    render(<ClaudeHomeNavigation />)
    expect(within(screen.getByRole("navigation", { name: "Primary" })).getByRole("link", { name: "Services" })).toHaveAttribute("href", "#services")
  })

  it("has no light/dark switch", () => {
    render(<ClaudeHomeNavigation />)
    expect(screen.queryByRole("switch")).toBeNull()
  })

  // v6 (owner, 2026-11-24): transparent over the full-screen hero, solid once the page scrolls.
  describe("scroll-aware background", () => {
    const scrollTo = (y: number) => {
      act(() => {
        Object.defineProperty(window, "scrollY", { value: y, configurable: true })
        window.dispatchEvent(new Event("scroll"))
      })
    }
    const header = () => screen.getByRole("banner")

    it("is transparent at the top of the home page and turns solid after scrolling, then transparent again at the top", () => {
      scrollTo(0)
      render(<ClaudeHomeNavigation />)
      expect(header()).toHaveAttribute("data-nav-state", "transparent")
      expect(header()).toHaveClass("bg-transparent")
      scrollTo(200)
      expect(header()).toHaveAttribute("data-nav-state", "solid")
      expect(header().className).toContain("bg-[#070605]/90")
      scrollTo(0)
      expect(header()).toHaveAttribute("data-nav-state", "transparent")
    })

    it("stays solid while the mobile menu is open", async () => {
      const user = userEvent.setup()
      scrollTo(0)
      render(<ClaudeHomeNavigation />)
      await user.click(screen.getByRole("button", { name: "Toggle menu" }))
      expect(header()).toHaveAttribute("data-nav-state", "solid")
    })

    it("is always solid off the home page", () => {
      nav.pathname = "/media"
      scrollTo(0)
      render(<ClaudeHomeNavigation />)
      expect(header()).toHaveAttribute("data-nav-state", "solid")
    })
  })
})
