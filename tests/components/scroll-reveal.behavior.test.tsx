/** @vitest-environment happy-dom */

import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScrollReveal, ScrollRevealStagger } from "@/components/scroll-reveal"

describe("ScrollReveal branches", () => {
  it("covers default className, custom className, and stagger wrapper", () => {
    const { rerender, container } = render(
      <ScrollReveal variant="up">
        <span>up</span>
      </ScrollReveal>,
    )
    expect(container.querySelector(".gpu-accelerate")).not.toBeNull()

    rerender(
      <ScrollReveal className="extra" variant="scale">
        <span>scale</span>
      </ScrollReveal>,
    )
    expect(container.querySelector(".extra")).not.toBeNull()

    rerender(
      <ScrollRevealStagger className="stagger" stagger={0.05}>
        <span>a</span>
        <span>b</span>
      </ScrollRevealStagger>,
    )
    expect(container.querySelector(".stagger")).not.toBeNull()
  })
})
