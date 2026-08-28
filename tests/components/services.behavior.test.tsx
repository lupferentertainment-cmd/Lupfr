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

  // Home tease shows only the first three services as open poster tiles
  // (owner restructure, 2026-08-28); the full six-service grid lives on
  // /services, reached via "Explore all services →".
  it("shows exactly the first three services on the home page, not all six", () => {
    render(<Services />)
    expect(screen.getByRole("link", { name: "View Owned Events service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Talent Booking service" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Event Programming service" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "View Private Events service" })).toBeNull()
    expect(screen.queryByRole("link", { name: "View Brand Partnerships service" })).toBeNull()
  })
})
