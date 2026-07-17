/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PartnersStrip } from "@/components/partners-strip"
import { getPartners } from "@/lib/data/partners"

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

  it("renders every partner logo as a link to that partner's site", () => {
    const partners = getPartners()
    expect(partners.length).toBeGreaterThan(0)
    const { container } = render(<PartnersStrip />)
    const primaryRow = container.querySelector(
      ".partner-marquee-track > div:not([aria-hidden])"
    )
    expect(primaryRow).not.toBeNull()
    const links = Array.from(primaryRow!.querySelectorAll("a"))
    expect(links.map((a) => a.getAttribute("href"))).toEqual(partners.map((p) => p.url))
  })

  it("opens partner sites in a new tab without opener access", () => {
    const { container } = render(<PartnersStrip />)
    const links = container.querySelectorAll(".partner-marquee-track a")
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank")
      expect(link.getAttribute("rel")).toContain("noopener")
    }
  })

  it("keeps the duplicate marquee copy hidden and inert for assistive tech", () => {
    const { container } = render(<PartnersStrip />)
    const rows = container.querySelectorAll(".partner-marquee-track > div")
    expect(rows.length).toBe(2)
    expect(rows[1].getAttribute("aria-hidden")).toBe("true")
    expect(rows[1].hasAttribute("inert")).toBe(true)
  })
})
