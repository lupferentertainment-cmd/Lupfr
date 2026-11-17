/** @vitest-environment happy-dom */

import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ZUSEBI_EMBED_SRC, ZUSEBI_WATCH_URL, ZusebiFilmButton } from "@/components/zusebi-film"

describe("ZusebiFilmButton", () => {
  it("opens the YouTube set (nocookie, starting at the set) in a modal and offers Open on YouTube", async () => {
    const user = userEvent.setup()
    render(<ZusebiFilmButton>poster</ZusebiFilmButton>)
    expect(screen.queryByRole("dialog")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Watch Zusebi live at Golden Gate Park" }))
    const dialog = screen.getByRole("dialog")
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(screen.getByTitle("Zusebi · Live at Golden Gate Park")).toHaveAttribute("src", ZUSEBI_EMBED_SRC)
    expect(ZUSEBI_EMBED_SRC).toContain("start=4034")
    expect(screen.getByRole("link", { name: "OPEN ON YOUTUBE ↗" })).toHaveAttribute("href", ZUSEBI_WATCH_URL)
    expect(document.body.style.overflow).toBe("hidden")
  })

  it("closes with ×, Escape or the backdrop, restoring scroll and focus", async () => {
    const user = userEvent.setup()
    render(<ZusebiFilmButton>poster</ZusebiFilmButton>)
    const trigger = screen.getByRole("button", { name: "Watch Zusebi live at Golden Gate Park" })

    await user.click(trigger)
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus()
    await user.click(screen.getByRole("button", { name: "Close" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    expect(document.body.style.overflow).toBe("")
    expect(trigger).toHaveFocus()

    await user.click(trigger)
    fireEvent.keyDown(document, { key: "ArrowLeft" })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog")).toBeNull()

    await user.click(trigger)
    await user.click(screen.getByTestId("film-modal"))
    expect(screen.queryByRole("dialog")).toBeNull()

    await user.click(trigger)
    await user.click(screen.getByRole("dialog")) // clicks inside don't close
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })
})
