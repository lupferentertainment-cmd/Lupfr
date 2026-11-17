/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import { BRAND_PILLAR_ICONS, BrandPillarIcon, brandIconName } from "@/components/brand-pillar-icons"

/** The icon table is transcribed from LUPFR Website Design v5's `BPICONS`. */
describe("brand pillar icons", () => {
  it("assigns four icons per brand exactly as the v5 design does", () => {
    expect(BRAND_PILLAR_ICONS).toEqual({
      seaside: ["sailboat", "sunset", "anchor", "wave"],
      inside: ["building", "disc", "spot", "mic"],
      outside: ["tree", "pin", "sun", "tree"],
      skiside: ["mountain", "mug", "gondola", "snow"],
      highrise: ["tower", "glass", "case", "tower"],
      soundcheck: ["mic", "phones", "waves", "phones"],
    })
  })

  it("looks icons up by brand and index, and returns undefined for unknown brands or indexes", () => {
    expect(brandIconName("skiside", 3)).toBe("snow")
    expect(brandIconName("nope", 0)).toBeUndefined()
    expect(brandIconName("skiside", 9)).toBeUndefined()
  })

  it("draws every icon in the brand set as a stroked 24px SVG in the given colour", () => {
    for (const names of Object.values(BRAND_PILLAR_ICONS)) {
      for (const name of names) {
        const { container, unmount } = render(<BrandPillarIcon name={name} color="#123456" size={20} />)
        const svg = container.querySelector("svg")!
        expect(svg.getAttribute("viewBox")).toBe("0 0 24 24")
        expect(svg.getAttribute("stroke")).toBe("#123456")
        expect(svg.getAttribute("width")).toBe("20")
        expect(svg.querySelectorAll("path, circle, rect").length, name).toBeGreaterThan(0)
        unmount()
      }
    }
  })

  it("renders an empty (but valid) SVG for an unknown icon name", () => {
    const { container } = render(<BrandPillarIcon name="unknown" color="#fff" />)
    expect(container.querySelector("svg")!.children).toHaveLength(0)
  })
})
