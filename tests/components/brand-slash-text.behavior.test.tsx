/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { BrandSlashText } from "@/components/brand-slash-text"

/**
 * Corporate redesign (2026-07-16): brand names like "SEA//SIDE" get a skewed,
 * gold "//" divider (ported from the LUPFR Website Restructure comp). Plain
 * strings with no "//" render unchanged — this wraps every event/section
 * title, so it must be a no-op for the common case.
 */
describe("BrandSlashText", () => {
  it("renders plain text unchanged when there is no //", () => {
    const { container } = render(<BrandSlashText text="Devvy Dub Live" />)
    expect(container.textContent).toBe("Devvy Dub Live")
    expect(container.querySelector(".lupfr-brand-slash")).toBeNull()
  })

  it("wraps // in a skewed gold accent span, keeping the rest as plain text", () => {
    const { container } = render(<BrandSlashText text="SEA//SIDE 001" />)
    expect(container.textContent).toBe("SEA//SIDE 001")
    const slash = container.querySelector(".lupfr-brand-slash")
    expect(slash).not.toBeNull()
    expect(slash?.textContent).toBe("//")
  })

  it("handles multiple // occurrences in one string", () => {
    const { container } = render(<BrandSlashText text="SEA//SIDE feat. HIGH//RISE" />)
    expect(container.textContent).toBe("SEA//SIDE feat. HIGH//RISE")
    expect(container.querySelectorAll(".lupfr-brand-slash").length).toBe(2)
  })
})
