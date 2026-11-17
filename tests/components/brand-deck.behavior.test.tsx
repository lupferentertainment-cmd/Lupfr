/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BrandDeck } from "@/components/brand-deck"

const SLIDES = ["/brands/a.webp", "/brands/b.webp", "/brands/c.webp"]

describe("BrandDeck viewer", () => {
  it("renders nothing for an empty deck", () => {
    const { container } = render(<BrandDeck slides={[]} label="HIGH RISE" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("opens on slide 1, pages with the chevrons and arrow keys (looping), and reopens on slide 1", async () => {
    const user = userEvent.setup()
    render(<BrandDeck slides={SLIDES} label="HIGH RISE" className="extra" />)
    const trigger = screen.getByRole("button", { name: "View the HIGH RISE deck — 3 slides" })
    expect(trigger.className).toContain("extra")

    await user.click(trigger)
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByText("1 / 3")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Next slide" }))
    expect(screen.getByText("2 / 3")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Previous slide" }))
    await user.click(screen.getByRole("button", { name: "Previous slide" }))
    expect(screen.getByText("3 / 3")).toBeInTheDocument() // loops backward

    fireEvent.keyDown(window, { key: "ArrowRight" })
    expect(screen.getByText("1 / 3")).toBeInTheDocument() // loops forward
    fireEvent.keyDown(window, { key: "ArrowRight" })
    fireEvent.keyDown(window, { key: "ArrowLeft" })
    fireEvent.keyDown(window, { key: "x" })
    expect(screen.getByText("1 / 3")).toBeInTheDocument()

    fireEvent.keyDown(window, { key: "ArrowRight" })
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" })
    await user.click(trigger)
    expect(screen.getByText("1 / 3")).toBeInTheDocument()
  })

  it("hides the chevrons for a single-slide deck", async () => {
    const user = userEvent.setup()
    render(<BrandDeck slides={["/brands/a.webp"]} label="LUPFR" />)
    await user.click(screen.getByRole("button", { name: "View the LUPFR deck — 1 slides" }))
    expect(screen.getByText("1 / 1")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Next slide" })).toBeNull()
  })
})
