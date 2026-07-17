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
    expect(screen.getByRole("link", { name: "View Brand Partnerships service" })).toHaveAttribute(
      "href",
      "/services/brand-partnerships",
    )
    expect(container.querySelector("article[tabindex='0']")).toBeNull()
  })
})
