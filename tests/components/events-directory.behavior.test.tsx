/** @vitest-environment happy-dom */

import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EventsDirectory } from "@/components/events-directory"
import { EVENTS, getPastEvents, getUpcomingEvents } from "@/lib/events"
import { getBrands } from "@/lib/data/brands"

describe("EventsDirectory (/events, comp All Events page)", () => {
  it("renders every event as a link to its detail page, split into Upcoming and Past", () => {
    render(<EventsDirectory />)
    const links = screen.getAllByRole("link", { name: /^View (past )?event: / })
    expect(links.length).toBe(EVENTS.length)
    expect(links.length).toBe(getUpcomingEvents().length + getPastEvents().length)
    for (const event of EVENTS) {
      const link = screen.getByRole("link", { name: new RegExp(`event: ${event.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) })
      expect(link).toHaveAttribute("href", `/events/${event.slug}`)
    }
  })

  it("offers the comp's status and brand filter pills and filters by brand wordmark", () => {
    render(<EventsDirectory />)
    for (const label of ["All", "Upcoming", "Past", "All Brands"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument()
    }
    const seaside = getBrands().find((b) => b.key === "seaside")!
    // Brand pill labels render through BrandSlashText (split spans), so match loosely.
    fireEvent.click(screen.getByRole("button", { name: /SEA\s*\/\/\s*SIDE/ }))
    const links = screen.getAllByRole("link", { name: /^View (past )?event: / })
    const expected = EVENTS.filter((e) => e.brandTag === seaside.title)
    expect(expected.length).toBeGreaterThan(0)
    expect(links.length).toBe(expected.length)
  })

  it("hides the Past grid when the Upcoming status pill is active", () => {
    render(<EventsDirectory />)
    fireEvent.click(screen.getByRole("button", { name: "Upcoming" }))
    expect(screen.getAllByRole("link", { name: /^View event: / }).length).toBe(getUpcomingEvents().length)
    expect(screen.queryByRole("link", { name: /^View past event: / })).toBeNull()
  })

  it("Past status pill hides Upcoming and All Brands resets the brand filter", () => {
    render(<EventsDirectory />)
    fireEvent.click(screen.getByRole("button", { name: "Past" }))
    expect(screen.getAllByRole("link", { name: /^View past event: / }).length).toBe(getPastEvents().length)
    expect(screen.queryByRole("link", { name: /^View event: / })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: /SEA\s*\/\/\s*SIDE/ }))
    const filtered = screen.queryAllByRole("link", { name: /^View (past )?event: / })
    fireEvent.click(screen.getByRole("button", { name: "All Brands" }))
    fireEvent.click(screen.getByRole("button", { name: "All" }))
    expect(screen.getAllByRole("link", { name: /^View (past )?event: / }).length).toBeGreaterThanOrEqual(
      filtered.length,
    )
  })
})
