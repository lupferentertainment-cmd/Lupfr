/** @vitest-environment happy-dom */

import { describe, it, expect, beforeAll } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MediaHub } from "@/components/media-hub"
import { getMediaChannels } from "@/lib/data/media"

beforeAll(() => {
  if (typeof globalThis.IntersectionObserver === "undefined") {
    globalThis.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver
  }
})

const channels = getMediaChannels()

describe("Media Hub tabs", () => {
  it("renders a tab per channel with LUPFR active first", () => {
    render(<MediaHub />)
    for (const c of channels) {
      expect(screen.getByRole("tab", { name: c.label })).toBeInTheDocument()
    }
    const active = screen.getAllByRole("tab").filter((t) => t.getAttribute("aria-selected") === "true")
    expect(active).toHaveLength(1)
    expect(active[0].textContent).toMatch(/LUPFR/i)
  })

  it("switches panel content when another brand tab is chosen", async () => {
    const user = userEvent.setup()
    render(<MediaHub />)
    const seaside = channels.find((c) => c.key === "seaside")!
    await user.click(screen.getByRole("tab", { name: "SEA//SIDE" }))
    const panel = screen.getByRole("tabpanel")
    expect(panel.textContent).toContain(seaside.blurb)
    expect(screen.getByRole("tab", { name: "SEA//SIDE" })).toHaveAttribute("aria-selected", "true")
  })

  it("shows the website link only for a brand that has one", async () => {
    const user = userEvent.setup()
    render(<MediaHub />)
    await user.click(screen.getByRole("tab", { name: "SEA//SIDE" }))
    expect(within(screen.getByRole("tabpanel")).getByRole("link", { name: /seaside\.la/i })).toHaveAttribute(
      "href",
      "https://seaside.la"
    )
    // HIGH//RISE has no site in data/brands.yml — no invented link.
    await user.click(screen.getByRole("tab", { name: "HIGH//RISE" }))
    expect(within(screen.getByRole("tabpanel")).queryByRole("link", { name: /visit/i })).toBeNull()
  })

  it("lists the verified channels with external-safe attributes", () => {
    render(<MediaHub />)
    const panel = screen.getByRole("tabpanel")
    const ig = within(panel).getByRole("link", { name: /instagram/i })
    expect(ig).toHaveAttribute("href", "https://www.instagram.com/lupfr_/")
    expect(ig).toHaveAttribute("rel", expect.stringContaining("noopener"))
    expect(ig).toHaveAttribute("target", "_blank")
  })

  it("says whose accounts these are on a brand tab", async () => {
    const user = userEvent.setup()
    render(<MediaHub />)
    await user.click(screen.getByRole("tab", { name: "HIGH//RISE" }))
    expect(screen.getByRole("tabpanel").textContent).toMatch(/LUPFR channels/i)
  })

  it("renders real press on the LUPFR tab and an honest empty state elsewhere", async () => {
    const user = userEvent.setup()
    render(<MediaHub />)
    expect(screen.getByRole("tabpanel").textContent).toContain(channels[0].news[0].title)
    await user.click(screen.getByRole("tab", { name: "OUT//SIDE" }))
    expect(screen.getByRole("tabpanel").textContent).toMatch(/no coverage yet|nothing yet/i)
  })

  it("keeps tabs keyboard reachable", async () => {
    render(<MediaHub />)
    const tabs = screen.getAllByRole("tab")
    expect(tabs.every((t) => t.tagName === "BUTTON")).toBe(true)
    expect(screen.getByRole("tablist")).toBeInTheDocument()
  })
})
