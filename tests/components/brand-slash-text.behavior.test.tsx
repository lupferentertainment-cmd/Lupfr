/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { BrandSlashText } from "@/components/brand-slash-text"

/**
 * Corporate redesign (2026-07-16): brand names like "SEA//SIDE" get a skewed,
 * gold "//" divider (ported from the LUPFR Website Restructure comp). The
 * divider always renders with exactly one space on each side (owner request
 * 2026-07-17), whether or not the source string already has spaces. Plain
 * strings with no "//" render unchanged — this wraps every event/section
 * title, so it must be a no-op for the common case.
 */
describe("BrandSlashText", () => {
  it("renders plain text unchanged when there is no //", () => {
    const { container } = render(<BrandSlashText text="Devvy Dub Live" />)
    expect(container.textContent).toBe("Devvy Dub Live")
    expect(container.querySelector(".lupfr-brand-slash")).toBeNull()
  })

  it("wraps // in a skewed gold accent span with one space on each side", () => {
    const { container } = render(<BrandSlashText text="SEA//SIDE 001" />)
    expect(container.textContent).toBe("SEA // SIDE 001")
    const slash = container.querySelector(".lupfr-brand-slash")
    expect(slash).not.toBeNull()
    expect(slash?.textContent).toBe("//")
  })

  it("does not double the spacing when the source string is already spaced", () => {
    const { container } = render(<BrandSlashText text="34.1478°N // 118.1445°W" />)
    expect(container.textContent).toBe("34.1478°N // 118.1445°W")
  })

  it("colors the slash with the given accent when `color` is passed (brand cards)", () => {
    const { container } = render(<BrandSlashText text="HIGH//RISE" color="#e08a4a" />)
    const slash = container.querySelector(".lupfr-brand-slash") as HTMLElement
    expect(slash).not.toBeNull()
    expect(slash.style.color).toBe("#e08a4a")
  })

  it("leaves the slash uncolored (gold via CSS) when no color is passed", () => {
    const { container } = render(<BrandSlashText text="SEA//SIDE" />)
    const slash = container.querySelector(".lupfr-brand-slash") as HTMLElement
    expect(slash.style.color).toBe("")
  })

  it("handles multiple // occurrences in one string", () => {
    const { container } = render(<BrandSlashText text="SEA//SIDE feat. HIGH//RISE" />)
    expect(container.textContent).toBe("SEA // SIDE feat. HIGH // RISE")
    expect(container.querySelectorAll(".lupfr-brand-slash").length).toBe(2)
  })
})
