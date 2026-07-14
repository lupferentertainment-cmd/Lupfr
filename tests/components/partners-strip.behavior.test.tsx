/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PartnersStrip } from "@/components/partners-strip"

/**
 * PartnersStrip contract: logo marquee with no visible section text — the
 * "Corporate partners" eyebrow was removed (owner request 2026-07-11); the
 * section stays labelled for assistive tech via aria-label only.
 */
describe("PartnersStrip", () => {
  it("renders the marquee without a visible 'Corporate partners' eyebrow", () => {
    const { container } = render(<PartnersStrip />)
    expect(screen.queryByText(/corporate partners/i)).toBeNull()
    expect(container.querySelector(".partner-marquee-track")).not.toBeNull()
  })

  it("keeps the section labelled for assistive tech", () => {
    const { container } = render(<PartnersStrip />)
    const section = container.querySelector("section")
    expect(section?.getAttribute("aria-label")).toBe("Corporate partners")
  })

  it("inherits the page background — no tinted band or border (owner request 2026-07-11)", () => {
    const { container } = render(<PartnersStrip />)
    const section = container.querySelector("section")
    expect(section?.className).not.toMatch(/bg-muted|bg-card|border-y/)
  })
})
