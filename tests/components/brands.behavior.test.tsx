/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Brands } from "@/components/brands"

/**
 * Brands section contract: five sub-brand cards with brand-slash titles
 * (rendered via BrandSlashText, not raw "//" text) under the #brands anchor.
 */
describe("Brands", () => {
  it("renders the #brands section with the corporate eyebrow and heading", () => {
    const { container } = render(<Brands />)
    const section = container.querySelector("section#brands")
    expect(section).not.toBeNull()
    expect(screen.getByText("The Portfolio · Five Series")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Our Brands" })).toBeInTheDocument()
  })

  it("renders all five sub-brand cards with their tags", () => {
    const { container } = render(<Brands />)
    for (const tag of ["YACHTS", "CORPORATE", "COMING FALL 2026", "INDOORS", "OUTDOORS"]) {
      expect(screen.getByText(tag)).toBeInTheDocument()
    }
    expect(container.querySelectorAll("h3")).toHaveLength(5)
  })

  it("splits brand-slash titles into styled spans instead of raw '//' text", () => {
    const { container } = render(<Brands />)
    const slashes = container.querySelectorAll(".lupfr-brand-slash")
    expect(slashes.length).toBe(5)
    expect(screen.getByText((_, el) => el?.textContent === "SEA // SIDE")).toBeInTheDocument()
  })

  it("colors each title's '//' with that brand's accent, matching its tag pill", () => {
    const { container } = render(<Brands />)
    const slashes = Array.from(container.querySelectorAll(".lupfr-brand-slash")) as HTMLElement[]
    const accents = slashes.map((s) => s.style.color)
    // Comp: SEA//SIDE #6fb8c9, HIGH//RISE #e08a4a, SOUND//CHECK #c9a869,
    // IN//SIDE #e8e4da, OUT//SIDE #8aa878 — same hex as each card's tag/dot.
    expect(accents).toEqual(["#6fb8c9", "#e08a4a", "#c9a869", "#e8e4da", "#8aa878"])
  })

  it("links SEA//SIDE out to seaside.la; other cards have no external link", () => {
    const { container } = render(<Brands />)
    const links = Array.from(container.querySelectorAll('a[href="https://seaside.la"]'))
    expect(links).toHaveLength(1)
  })
})
