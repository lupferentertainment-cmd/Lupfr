/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Services } from "@/components/services"

describe("Services", () => {
  it("links each home card to its dedicated service page", () => {
    const { container } = render(<Services />)

    expect(screen.getByRole("link", { name: "View Private Events service" })).toHaveAttribute(
      "href",
      "/services/private-events",
    )
    expect(screen.getByRole("link", { name: "View Venue Programming service" })).toHaveAttribute(
      "href",
      "/services/venue-programming",
    )
    expect(container.querySelector("article[tabindex='0']")).toBeNull()
  })

  // All six services render on the home page, as open poster tiles (owner
  // correction, 2026-08-28: "no the homepage services should be all six,
  // just in that style"). Titles updated 2026-10-02 (round 2 design-file
  // alignment) — see data/services.yml's doc comment.
  it("shows all six services on the home page in poster-tile style", () => {
    render(<Services />)
    expect(screen.getByRole("link", { name: "View Private Events service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Brand Activations service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Music & Entertainment service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Venue Programming service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Production service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Content & Media service" })).toBeInTheDocument()
  })
})
