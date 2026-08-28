import { describe, expect, it } from "vitest"
import type { EventItem } from "@/lib/events"
import { shortDate, upcomingPillLabel } from "@/components/events-directory"

const eventFixture = (overrides: Partial<EventItem>): EventItem => ({
  id: 99,
  slug: "fixture",
  title: "Fixture",
  subtitle: "",
  date: "Jan 1, 2099",
  dateISO: "2099-01-01",
  time: "1 PM",
  location: "SF",
  image: "/events/x.webp",
  ...overrides,
})

// No event in the live roster is currently TBD (dateISO: null) — the
// 2026-08-28 owner restructure filled in SEA//SIDE 002's date and dropped
// Zusebi 003, the roster's last two TBD-shaped rows — so these fixtures keep
// the TBD-rendering branches covered independent of what's on the live roster.
describe("events-directory TBD (dateISO: null) rendering", () => {
  it("shortDate renders TBD for a null dateISO", () => {
    expect(shortDate(null)).toBe("TBD")
    expect(shortDate("2026-07-24")).toBe("Jul 24")
  })

  it("upcomingPillLabel renders DATE TBD for a null dateISO", () => {
    expect(upcomingPillLabel(eventFixture({ dateISO: null }), "2026-01-01")).toBe("DATE TBD")
  })
})
