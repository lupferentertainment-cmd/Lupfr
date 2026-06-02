import { describe, expect, it } from "vitest"
import type { EventItem } from "@/lib/events"
import {
  eventDetailPath,
  eventHeroAbsoluteUrl,
  eventShareTitle,
  getEventBySlug,
  getEventTag,
  getPastEvents,
  getUpcomingEvents,
  todayDateISOInEventTZ,
} from "@/lib/events"

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

/** Fixed instant in America/Los_Angeles (offset included) so “today” in event TZ is stable in CI. */
const la = (iso: string) => new Date(iso)

describe("events list ordering", () => {
  it("upcoming: sorts by dateISO ascending; TBD (null) last", () => {
    const now = la("2026-04-01T20:00:00-07:00")
    const slugs = getUpcomingEvents(now).map((e) => e.slug)
    expect(slugs).toEqual([
      "boiler-boat-003-wheres-west-warehouse-session",
      "wheres-west-corbin-mason",
      "third-thursdays-operator-sf-eria",
      "boiler-room-marina-lupfr-baum",
      "fifa-world-cup-watch-party-eria-marina",
      "marina-music-002-fromclay-thatfranco",
    ])
  })

  it("past: sorts by dateISO descending (newest past first)", () => {
    const now = la("2027-01-15T20:00:00-08:00")
    const slugs = getPastEvents(now).map((e) => e.slug)
    expect(slugs).toEqual([
      "marina-music-002-fromclay-thatfranco",
      "fifa-world-cup-watch-party-eria-marina",
      "boiler-room-marina-lupfr-baum",
      "third-thursdays-operator-sf-eria",
      "wheres-west-corbin-mason",
      "boiler-boat-003-wheres-west-warehouse-session",
      "shamrock-house",
      "boiler-boat-002-apres-ski-edition",
      "haunted-at-brixton",
    ])
  })
})

describe("event share helpers", () => {
  it("eventShareTitle joins YAML title and subtitle", () => {
    expect(
      eventShareTitle(
        eventFixture({ title: "Boiler Boat 003", subtitle: "Yacht Edition feat. HLWA" })
      )
    ).toBe("LUPFR — Boiler Boat 003 — Yacht Edition feat. HLWA")
  })

  it("eventShareTitle omits blank subtitle", () => {
    expect(eventShareTitle(eventFixture({ title: "Solo", subtitle: "   " }))).toBe("LUPFR — Solo")
  })

  it("eventHeroAbsoluteUrl resolves site-relative paths and passes through absolute URLs", () => {
    expect(eventHeroAbsoluteUrl(eventFixture({ image: "/events/a.webp" }), "https://lupfr.com")).toBe(
      "https://lupfr.com/events/a.webp"
    )
    expect(
      eventHeroAbsoluteUrl(
        eventFixture({ image: "https://cdn.example.com/poster.jpg" }),
        "https://lupfr.com"
      )
    ).toBe("https://cdn.example.com/poster.jpg")
  })

  it("eventHeroAbsoluteUrl strips trailing slash on origin", () => {
    expect(eventHeroAbsoluteUrl(eventFixture({ image: "/events/a.webp" }), "https://lupfr.com/")).toBe(
      "https://lupfr.com/events/a.webp"
    )
  })

  it("eventHeroAbsoluteUrl normalizes a site-relative path missing a leading slash", () => {
    expect(eventHeroAbsoluteUrl(eventFixture({ image: "events/a.webp" }), "https://lupfr.com")).toBe(
      "https://lupfr.com/events/a.webp"
    )
  })
})

describe("event routes and lookup", () => {
  it("getEventBySlug returns the row from generated data and undefined for unknown slug", () => {
    const row = getEventBySlug("shamrock-house")
    expect(row?.title).toBe("Shamrock & House")
    expect(getEventBySlug("definitely-missing-slug-xyz")).toBeUndefined()
  })

  it("eventDetailPath is the App Router event page path", () => {
    expect(eventDetailPath("shamrock-house")).toBe("/events/shamrock-house")
  })

  it("post-event content links are loaded from generated event data", () => {
    const event = getEventBySlug("wheres-west-corbin-mason")
    expect(event?.contentLinks).toEqual([
      {
        label: "Photos",
        url: "https://drive.google.com/drive/folders/1F8h2-muaIfuoCdSH7C6dVQ3AlUhE7BUw?usp=sharing",
      },
      {
        label: "Video",
        url: "https://drive.google.com/drive/folders/1S39j1c-277_z76K9O6i9V_RrLkxsM9We",
      },
      {
        label: "Drone",
        url: "https://drive.google.com/drive/folders/1GDy76AOwDTR5ohgXDygl1pA8nzahz6cK?usp=sharing",
      },
    ])
  })

  it("loads ticket availability state from generated event data", () => {
    const fifa = getEventBySlug("fifa-world-cup-watch-party-eria-marina")
    const marina = getEventBySlug("marina-music-002-fromclay-thatfranco")

    expect({ fifaLink: fifa?.ticketLink, marinaStatus: marina?.ticketStatus }).toEqual({
      fifaLink: "https://partiful.com/e/qzqeUgwc3iMmBrt6A0MC",
      marinaStatus: "tbd",
    })
  })
})

describe("event timezone and badges", () => {
  it("todayDateISOInEventTZ returns YYYY-MM-DD in America/Los_Angeles", () => {
    const d = la("2026-04-01T20:00:00-07:00")
    expect(todayDateISOInEventTZ(d)).toBe("2026-04-01")
  })

  it("getEventTag: TBD when dateISO is null", () => {
    const tag = getEventTag(eventFixture({ dateISO: null }), la("2026-04-01T20:00:00-07:00"))
    expect(tag.kind).toBe("tbd")
    expect(tag.label).toBe("Upcoming Event")
  })

  it("getEventTag: past when event date is before today in event TZ", () => {
    const tag = getEventTag(
      eventFixture({ dateISO: "2025-03-14" }),
      la("2027-01-15T20:00:00-08:00")
    )
    expect(tag.kind).toBe("past")
    expect(tag.label).toBe("Past Event")
  })

  it("getEventTag: today when dateISO matches calendar today in event TZ", () => {
    const now = la("2026-04-04T12:00:00-07:00")
    const tag = getEventTag(eventFixture({ dateISO: "2026-04-04" }), now)
    expect(tag.kind).toBe("today")
    expect(tag.label).toBe("Today's Event")
  })

  it("getEventTag: upcoming when event is after today in event TZ", () => {
    const tag = getEventTag(
      eventFixture({ dateISO: "2026-05-21" }),
      la("2026-04-01T20:00:00-07:00")
    )
    expect(tag.kind).toBe("upcoming")
    expect(tag.label).toBe("Upcoming Event")
  })
})
