/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { UpcomingEventCard } from "@/components/events-directory"
import type { EventItem } from "@/lib/events"

const TODAY = "2026-09-07"

const eventFixture = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: 9001,
  slug: "fixture-event",
  title: "Fixture Event",
  subtitle: "feat. Nobody",
  date: "September 20th, 2026",
  dateISO: "2026-09-20",
  time: "9 PM - Close",
  location: "Fixture Venue, SF",
  brandTag: "IN//SIDE",
  city: "SF",
  image: "/events/fixture.webp",
  ...overrides,
})

// The ticket CTA on an upcoming card resolves through resolveEventTicket(), so
// its three outcomes (Partiful/ticketLink, explicit TBD, nothing) and the
// optional venue/time rows need fixtures — the live roster currently exercises
// only the Partiful-with-both-rows shape.
describe("UpcomingEventCard ticket CTA and venue/time rows", () => {
  it("links the ticket button straight to the event's Partiful page in a new tab", () => {
    render(
      <UpcomingEventCard
        event={eventFixture({ partifulLink: "https://partiful.com/e/abc123" })}
        todayISO={TODAY}
      />,
    )
    const cta = screen.getByRole("link", { name: "Get tickets for Fixture Event" })
    expect(cta).toHaveAttribute("href", "https://partiful.com/e/abc123")
    expect(cta).toHaveAttribute("target", "_blank")
    expect(cta).toHaveAttribute("rel", "noopener noreferrer")
  })

  it("falls back to ticketLink when the event has no Partiful page", () => {
    render(
      <UpcomingEventCard
        event={eventFixture({ ticketLink: "https://www.eventbrite.com/e/fixture" })}
        todayISO={TODAY}
      />,
    )
    expect(screen.getByRole("link", { name: "Get tickets for Fixture Event" })).toHaveAttribute(
      "href",
      "https://www.eventbrite.com/e/fixture",
    )
  })

  it("shows a non-link TBA pill for an explicitly TBD event", () => {
    render(<UpcomingEventCard event={eventFixture({ ticketStatus: "tbd" })} todayISO={TODAY} />)
    expect(screen.getByText("Tickets TBA")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /^Get tickets/ })).toBeNull()
  })

  it("renders no ticket control when the event has neither link nor TBD status", () => {
    render(<UpcomingEventCard event={eventFixture()} todayISO={TODAY} />)
    expect(screen.queryByRole("link", { name: /^Get tickets/ })).toBeNull()
    expect(screen.queryByText("Tickets TBA")).toBeNull()
  })

  it("shows the venue and start time, and omits either row when it is blank", () => {
    const { unmount } = render(<UpcomingEventCard event={eventFixture()} todayISO={TODAY} />)
    expect(screen.getByText("Fixture Venue, SF")).toBeInTheDocument()
    expect(screen.getByText("9 PM - Close")).toBeInTheDocument()
    unmount()

    render(<UpcomingEventCard event={eventFixture({ location: "", time: "" })} todayISO={TODAY} />)
    expect(screen.queryByText("Fixture Venue, SF")).toBeNull()
    expect(screen.queryByText("9 PM - Close")).toBeNull()
  })

  it("keeps the card's detail link pointing at the event page", () => {
    render(<UpcomingEventCard event={eventFixture()} todayISO={TODAY} />)
    expect(screen.getByRole("link", { name: "View event: Fixture Event" })).toHaveAttribute(
      "href",
      "/events/fixture-event",
    )
  })
})
