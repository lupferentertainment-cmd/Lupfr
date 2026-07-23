import { describe, expect, it } from "vitest"
import type { EventItem } from "@/lib/events"
import {
  eventDetailPath,
  eventHeroAbsoluteUrl,
  eventShareTitle,
  getEventBreadcrumbLabel,
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
      "boiler-party-marina-lupfr-baum",
      "fifa-world-cup-watch-party-eria-marina",
      "gas-money-eria-marina",
      "devvy-dub-live-eria-sausalito",
      "marina-music-002-fromclay-thatfranco",
      "seaside-001-long-beach-harbor",
      "bal-masque",
      "zusebi-001-live-from-sf",
      "zusebi-002-live-from-golden-gate",
      "zusebi-003-live-from-la",
      "seaside-002",
    ])
  })

  it("past: sorts by dateISO descending (newest past first)", () => {
    const now = la("2027-01-15T20:00:00-08:00")
    const slugs = getPastEvents(now).map((e) => e.slug)
    expect(slugs).toEqual([
      "zusebi-003-live-from-la",
      "zusebi-002-live-from-golden-gate",
      "zusebi-001-live-from-sf",
      "bal-masque",
      "seaside-001-long-beach-harbor",
      "marina-music-002-fromclay-thatfranco",
      "devvy-dub-live-eria-sausalito",
      "gas-money-eria-marina",
      "fifa-world-cup-watch-party-eria-marina",
      "boiler-party-marina-lupfr-baum",
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
    const event = getEventBySlug("boiler-boat-003-wheres-west-warehouse-session")
    expect(event?.contentLinks).toEqual([
      {
        label: "GoPro Footage",
        url: "https://gopro.com/v/1778da2d-d76a-4897-9e05-0a3f3c8ef463",
      },
      {
        label: "Yohei Photos",
        url: "https://drive.google.com/drive/folders/1HYKhIfdG2_IxR0k7U2wZw5Pl82t6eXGR",
      },
      {
        label: "James Videos",
        url: "https://www.dropbox.com/scl/fo/ycr5vdoah1stre5d9dgia/AB0di8Qybx7M7BknTFwfCsI?dl=0&e=1&rlkey=9a1xbvo35u9j21rb0ladvo3ja&st=u5xe8wtn",
      },
      {
        label: "Yahsek Videos",
        url: "https://www.dropbox.com/scl/fo/bupowh3f1u49mg5ma6cgx/ACGn633EjoeSRaHvtPs-mCc?rlkey=movr07k3ea27q9qpkpr62f45v&st=ht8g6t67&dl=0",
      },
    ])
  })

  it("loads ticket availability state from generated event data", () => {
    const fifa = getEventBySlug("fifa-world-cup-watch-party-eria-marina")
    const marina = getEventBySlug("marina-music-002-fromclay-thatfranco")

    expect({ fifaLink: fifa?.ticketLink, marinaLink: marina?.ticketLink }).toEqual({
      fifaLink: "https://partiful.com/e/qzqeUgwc3iMmBrt6A0MC",
      marinaLink: "https://partiful.com/e/ofADe6R9PY4T4obW3aMa",
    })

    const marinaEvent = getEventBySlug("marina-music-002-fromclay-thatfranco")
    expect(marinaEvent).toMatchObject({
      time: "8 PM - 2 AM",
      location: "Paris 75, North Beach, SF",
    })

    const balMasque = getEventBySlug("bal-masque")
    expect(balMasque?.ticketLink).toBe("https://partiful.com/e/Ccgql9UJQIpXlKl5XWzH")
    expect(balMasque?.ticketStatus).toBeUndefined()
  })
})

describe("getEventBreadcrumbLabel", () => {
  it("returns null for past dateISO", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2025-01-01" }), la("2026-06-05T12:00:00-07:00"))
    ).toBeNull()
  })

  it("returns Upcoming for null dateISO", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: null }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("Upcoming")
  })

  it("returns Today's Event when dateISO matches today in event TZ", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2026-06-05" }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("Today's Event")
  })

  it("returns Tomorrow's Event when event is 1 day away", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2026-06-06" }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("Tomorrow's Event")
  })

  it("returns In X days for an event 4 days away", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2026-06-09" }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("In 4 days")
  })

  it("returns In 8 days for an event 8 days away", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2026-06-13" }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("In 8 days")
  })

  it("returns In X days for an event more than 14 days away", () => {
    expect(
      getEventBreadcrumbLabel(eventFixture({ dateISO: "2026-07-15" }), la("2026-06-05T12:00:00-07:00"))
    ).toBe("In 40 days")
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

  it("getEventTag: upcoming shows Tomorrow when 1 day away", () => {
    const tag = getEventTag(
      eventFixture({ dateISO: "2026-04-02" }),
      la("2026-04-01T20:00:00-07:00")
    )
    expect(tag.kind).toBe("upcoming")
    expect(tag.label).toBe("Tomorrow")
  })

  it("getEventTag: upcoming shows In X days when multiple days away", () => {
    const tag = getEventTag(
      eventFixture({ dateISO: "2026-05-21" }),
      la("2026-04-01T20:00:00-07:00")
    )
    expect(tag.kind).toBe("upcoming")
    expect(tag.label).toBe("In 50 days")
  })
})
