/** @vitest-environment happy-dom */

/**
 * Story carousel regression coverage (owner restructure, 2026-08-29): the
 * About section's right column moved from a single static press card to a
 * carousel of story graphics + the SF Post press card. See
 * components/about.tsx and docs/DESIGN.md phase 39.
 *
 * 2026-10-02 round 5: a new lead slide (h-01.webp, the "Built From the
 * Ground Up" boat-DJ photo) was added ahead of the original 5, making this
 * a 7-slide carousel (6 story graphics + the press card) instead of 6.
 */

import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { About } from "@/components/about"

vi.mock("next/image", () => ({
  default({ src, alt, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string }) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...img } = rest as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...img} />
  },
}))

function carousel(): HTMLElement {
  return screen.getByRole("article", { name: "LUPFR story" })
}

describe("About — story carousel", () => {
  it("starts on slide 1 of 7 with the new lead story graphic visible", () => {
    render(<About />)
    const region = carousel()
    expect(region.textContent).toContain("01 / 07")
    expect(region.querySelector('img[src="/story/h-01.webp"]')).not.toBeNull()
  })

  it("advances to the next slide via the arrow button", async () => {
    const user = userEvent.setup()
    render(<About />)
    await user.click(screen.getByRole("button", { name: "Next slide" }))
    const region = carousel()
    expect(region.textContent).toContain("02 / 07")
  })

  it("wraps from the first slide back to the last via the previous arrow", async () => {
    const user = userEvent.setup()
    render(<About />)
    await user.click(screen.getByRole("button", { name: "Previous slide" }))
    const region = carousel()
    expect(region.textContent).toContain("07 / 07")
  })

  it("jumps straight to the press card (slide 7) via its dot", async () => {
    const user = userEvent.setup()
    render(<About />)
    const dots = screen.getAllByRole("tab", { name: /Show slide/ })
    expect(dots).toHaveLength(7)
    await user.click(dots[6])
    const region = carousel()
    expect(region.textContent).toContain("07 / 07")
    expect(screen.getByRole("link", { name: /Read ".*" on/ })).toBeInTheDocument()
  })

  it("renders all 7 dots with the active one marked aria-selected", async () => {
    const user = userEvent.setup()
    render(<About />)
    const dots = screen.getAllByRole("tab", { name: /Show slide/ })
    expect(dots[0]).toHaveAttribute("aria-selected", "true")
    await user.click(dots[2])
    expect(dots[2]).toHaveAttribute("aria-selected", "true")
    expect(dots[0]).toHaveAttribute("aria-selected", "false")
  })

  it("advances and rewinds via the arrow keys while focus is inside the carousel", () => {
    render(<About />)
    const region = carousel()
    fireEvent.keyDown(region, { key: "ArrowRight" })
    expect(region.textContent).toContain("02 / 07")
    fireEvent.keyDown(region, { key: "ArrowLeft" })
    expect(region.textContent).toContain("01 / 07")
  })

  it("ignores non-arrow keys", () => {
    render(<About />)
    const region = carousel()
    fireEvent.keyDown(region, { key: "Enter" })
    expect(region.textContent).toContain("01 / 07")
  })
})
