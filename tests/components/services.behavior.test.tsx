/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Services } from "@/components/services"

describe("Services", () => {
  it("links each home card to its dedicated service page", () => {
    const { container } = render(<Services />)

    expect(screen.getByRole("link", { name: "View Owned Events service" })).toHaveAttribute(
      "href",
      "/services/owned-events",
    )
    expect(screen.getByRole("link", { name: "View Event Programming service" })).toHaveAttribute(
      "href",
      "/services/event-programming",
    )
    expect(container.querySelector("article[tabindex='0']")).toBeNull()
  })

  // All six services render on the home page, as open poster tiles (owner
  // correction, 2026-08-28: "no the homepage services should be all six,
  // just in that style").
  it("shows all six services on the home page in poster-tile style", () => {
    render(<Services />)
    expect(screen.getByRole("link", { name: "View Owned Events service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Talent Booking service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Event Programming service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Private Events service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Event Production service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Brand Partnerships service" })).toBeInTheDocument()
  })
})
