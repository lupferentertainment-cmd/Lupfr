/** @vitest-environment happy-dom */

/**
 * Story carousel regression coverage (owner restructure, 2026-08-29): the
 * About section's right column moved from a single static press card to a
 * 6-slide carousel (5 story graphics + the SF Post press card). See
 * components/about.tsx and docs/DESIGN.md phase 39.
 */

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
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
  it("starts on slide 1 of 6 with the first story graphic visible", () => {
    render(<About />)
    const region = carousel()
    expect(region.textContent).toContain("01 / 06")
    expect(region.querySelector('img[src="/story/h-02.webp"]')).not.toBeNull()
  })

  it("advances to the next slide via the arrow button", async () => {
    const user = userEvent.setup()
    render(<About />)
    await user.click(screen.getByRole("button", { name: "Next slide" }))
    const region = carousel()
    expect(region.textContent).toContain("02 / 06")
  })

  it("wraps from the first slide back to the last via the previous arrow", async () => {
    const user = userEvent.setup()
    render(<About />)
    await user.click(screen.getByRole("button", { name: "Previous slide" }))
    const region = carousel()
    expect(region.textContent).toContain("06 / 06")
  })

  it("jumps straight to the press card (slide 6) via its dot", async () => {
    const user = userEvent.setup()
    render(<About />)
    const dots = screen.getAllByRole("tab", { name: /Show slide/ })
    expect(dots).toHaveLength(6)
    await user.click(dots[5])
    const region = carousel()
    expect(region.textContent).toContain("06 / 06")
    expect(screen.getByRole("link", { name: /Read ".*" on/ })).toBeInTheDocument()
  })

  it("renders all 6 dots with the active one marked aria-selected", async () => {
    const user = userEvent.setup()
    render(<About />)
    const dots = screen.getAllByRole("tab", { name: /Show slide/ })
    expect(dots[0]).toHaveAttribute("aria-selected", "true")
    await user.click(dots[2])
    expect(dots[2]).toHaveAttribute("aria-selected", "true")
    expect(dots[0]).toHaveAttribute("aria-selected", "false")
  })
})
