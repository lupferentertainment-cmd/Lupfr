/** @vitest-environment happy-dom */

import { describe, it, expect } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { GoldCard } from "@/components/gold-card"

/**
 * GoldCard shell contract: card surface (sharper corporate `rounded-sm`
 * corners, owner redesign 2026-07-16 — was a `rounded-2xl` squircle), reveal
 * gate, and pointer-only tilt (mouse math runs only when enableTilt is true).
 */
describe("GoldCard", () => {
  it("renders children in the card shell", () => {
    render(
      <GoldCard index={1} isRevealed>
        <p>Card body</p>
      </GoldCard>
    )
    expect(screen.getByText("Card body")).toBeInTheDocument()
    const article = document.querySelector("article")
    expect(article?.className).toContain("rounded-sm")
    expect(article?.className).toContain("bg-card")
  })

  it("tilt handlers run without error when enabled and are inert when disabled", () => {
    const { container: enabled } = render(
      <GoldCard isRevealed enableTilt tiltMaxDeg={10}>
        <p>tilting</p>
      </GoldCard>
    )
    const enabledCard = enabled.querySelector("article") as HTMLElement
    fireEvent.mouseMove(enabledCard, { clientX: 10, clientY: 10 })
    fireEvent.mouseLeave(enabledCard)

    const { container: disabled } = render(
      <GoldCard isRevealed={false} enableTilt={false}>
        <p>static</p>
      </GoldCard>
    )
    const disabledCard = disabled.querySelector("article") as HTMLElement
    fireEvent.mouseMove(disabledCard, { clientX: 10, clientY: 10 })
    fireEvent.mouseLeave(disabledCard)
    expect(screen.getByText("static")).toBeInTheDocument()
  })
})
