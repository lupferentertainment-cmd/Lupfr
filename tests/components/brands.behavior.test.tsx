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
    expect(screen.getByText((_, el) => el?.textContent === "SEA//SIDE")).toBeInTheDocument()
  })

  it("links SEA//SIDE out to seaside.la; other cards have no external link", () => {
    const { container } = render(<Brands />)
    const links = Array.from(container.querySelectorAll('a[href="https://seaside.la"]'))
    expect(links).toHaveLength(1)
  })
})
