/** @vitest-environment happy-dom */

/**
 * About section's right-column photo (owner restructure, 2026-10-02: "Built
 * from the Ground up - remove the carousel, it should have the attached
 * image, faded in like we did on the hero"). Replaces the former
 * story-graphics + press-card carousel (arrows/dots/counter) with a single
 * static photo. See components/about.tsx.
 */

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { About } from "@/components/about"

vi.mock("next/image", () => ({
  default({ src, alt, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string }) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...img } = rest as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...img} />
  },
}))

function photoBlock(): HTMLElement {
  return screen.getByRole("article", { name: "LUPFR story" })
}

describe("About — story photo", () => {
  it("renders the boat-DJ lead photo, not a carousel", () => {
    render(<About />)
    const block = photoBlock()
    expect(block.querySelector('img[src="/story/h-01.webp"]')).not.toBeNull()
    expect(block.textContent).toContain("The LUPFR Story")
  })

  it("has no carousel controls (arrows, dots, slide counter)", () => {
    render(<About />)
    const block = photoBlock()
    expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull()
    expect(screen.queryByRole("button", { name: "Previous slide" })).toBeNull()
    expect(screen.queryAllByRole("tab")).toHaveLength(0)
    expect(block.textContent).not.toMatch(/\d{2} \/ \d{2}/)
  })

  it("does not surface the featured-press link in this section anymore", () => {
    render(<About />)
    expect(screen.queryByRole("link", { name: /Read ".*" on/ })).toBeNull()
  })
})

// 2026-10-04 fix, round 10 (owner, mobile screenshot: "we need to have that
// image faded behind the text on mobile, not below it"). Adds a decorative,
// `lg:hidden` background layer behind the text column using the same
// photo, separate from (and in addition to) the real `lg:`-only photo
// block above.
describe("About — mobile background photo (round 10)", () => {
  it("renders a decorative, aria-hidden background using the same story photo, alongside the real lg-only photo block", () => {
    const { container } = render(<About />)
    const images = container.querySelectorAll('img[src="/story/h-01.webp"]')
    // One inside the real `aria-label="LUPFR story"` article, one in the
    // new decorative mobile background layer.
    expect(images.length).toBe(2)
    const decorative = [...images].find((img) => img.getAttribute("alt") === "")
    expect(decorative).toBeTruthy()
    expect(decorative?.closest('[aria-hidden="true"]')).not.toBeNull()
  })
})
