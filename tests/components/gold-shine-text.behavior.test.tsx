/** @vitest-environment happy-dom */

import { createRef } from "react"
import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { GoldShineText } from "@/components/gold-shine-text"

/**
 * GoldShineText contract: the metallic classes always ship; `static` fixes the
 * gradient position, `scroll` binds it to scroll (global or a target ref);
 * the `as` tag decides the rendered element (no extra wrapper).
 */
describe("GoldShineText", () => {
  it("static variant renders the metallic classes with a fixed gradient position", () => {
    const { container } = render(<GoldShineText>LUPFR</GoldShineText>)
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe("SPAN")
    expect(el.className).toContain("heading-metallic-gold")
    expect(el.className).toContain("gold-shine-text")
    expect(el.style.backgroundPosition).toBe("50% 50%")
    expect(el.textContent).toBe("LUPFR")
  })

  it("renders headings via the as prop", () => {
    const { container } = render(
      <GoldShineText as="h3" className="lupfr-heading-sub">
        Reels
      </GoldShineText>
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.tagName).toBe("H3")
    expect(el.className).toContain("lupfr-heading-sub")
  })

  it("scroll variant with a section ref binds the shine without crashing pre-hydration", () => {
    const ref = createRef<HTMLElement>()
    const { container } = render(
      <section ref={ref as React.RefObject<HTMLElement>}>
        <GoldShineText variant="scroll" scrollTargetRef={ref} as="h2">
          Events
        </GoldShineText>
      </section>
    )
    const el = container.querySelector("h2") as HTMLElement
    expect(el.className).toContain("gold-shine-text")
    expect(el.textContent).toBe("Events")
  })

  it("scroll variant without a target falls back to global scroll", () => {
    const { container } = render(
      <GoldShineText variant="scroll">Global</GoldShineText>
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain("heading-metallic-gold")
    expect(el.textContent).toBe("Global")
  })
})
