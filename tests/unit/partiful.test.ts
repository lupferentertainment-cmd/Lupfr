import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { EventItem } from "@/lib/events"
import {
  fetchPartifulMeta,
  resolveEventDescription,
  resolveEventImage,
  resolveEventTicket,
} from "@/lib/partiful"

// ── fixtures ─────────────────────────────────────────────────────────────────

const localEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: 1,
  slug: "test-event",
  title: "Test Event",
  subtitle: "",
  date: "Jan 1, 2099",
  dateISO: "2099-01-01",
  time: "9 PM",
  location: "SF",
  image: "/events/test.webp",
  description: "Local description.",
  ticketLink: "https://eventbrite.com/e/123",
  ticketLabel: "Tickets",
  ...overrides,
})

const partifulEvent = (overrides: Partial<EventItem> = {}): EventItem => ({
  id: 2,
  slug: "partiful-event",
  title: "Partiful Event",
  subtitle: "",
  date: "Feb 1, 2099",
  dateISO: "2099-02-01",
  time: "10 PM",
  location: "SF",
  partifulLink: "https://partiful.com/e/abc123",
  ...overrides,
})

function mockHtml(overrides: { image?: string; description?: string; title?: string } = {}): string {
  const image = overrides.image ?? "https://cdn.partiful.com/events/abc123/poster.jpg"
  const description = overrides.description ?? "A great party in the city."
  const title = overrides.title ?? "Partiful Event"
  return `<!DOCTYPE html><html><head>
    <meta property="og:image" content="${image}">
    <meta property="og:description" content="${description}">
    <meta property="og:title" content="${title}">
  </head><body></body></html>`
}

// ── fetch mock helpers ────────────────────────────────────────────────────────

function stubFetchOk(body: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => body })
  )
}

function stubFetchError(status: number) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: false, status, statusText: "Error", text: async () => "" })
  )
}

beforeEach(() => vi.restoreAllMocks())
afterEach(() => vi.unstubAllGlobals())

// ── fetchPartifulMeta ─────────────────────────────────────────────────────────

describe("fetchPartifulMeta", () => {
  it("parses og:image, og:description, og:title from a successful response", async () => {
    stubFetchOk(mockHtml())
    const meta = await fetchPartifulMeta("https://partiful.com/e/abc123")
    expect(meta.image).toBe("https://cdn.partiful.com/events/abc123/poster.jpg")
    expect(meta.description).toBe("A great party in the city.")
    expect(meta.title).toBe("Partiful Event")
  })

  it("passes the partiful URL to fetch", async () => {
    stubFetchOk(mockHtml())
    await fetchPartifulMeta("https://partiful.com/e/xyz999")
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://partiful.com/e/xyz999",
      expect.objectContaining({ headers: expect.any(Object) })
    )
  })

  it("throws when the response is not ok", async () => {
    stubFetchError(404)
    await expect(fetchPartifulMeta("https://partiful.com/e/missing")).rejects.toThrow(
      "Partiful fetch failed: 404"
    )
  })

  it("returns empty strings for missing og tags", async () => {
    stubFetchOk("<html><head></head><body></body></html>")
    const meta = await fetchPartifulMeta("https://partiful.com/e/empty")
    expect(meta.image).toBe("")
    expect(meta.description).toBe("")
    expect(meta.title).toBe("")
  })

  it("handles content-first og tag attribute order", async () => {
    const html = `<html><head>
      <meta content="https://cdn.partiful.com/img.jpg" property="og:image">
    </head></html>`
    stubFetchOk(html)
    const meta = await fetchPartifulMeta("https://partiful.com/e/contentfirst")
    expect(meta.image).toBe("https://cdn.partiful.com/img.jpg")
  })

  it("decodes HTML entities in og:description so text doesn't render as raw markup", async () => {
    stubFetchOk(
      mockHtml({
        description:
          "Zusebi&#x27;s SF tour &amp; a &quot;private&quot; set &mdash; not &lt;public&gt;.",
      })
    )
    const meta = await fetchPartifulMeta("https://partiful.com/e/entities")
    expect(meta.description).toBe(
      `Zusebi's SF tour & a "private" set &mdash; not <public>.`
    )
  })

  it("decodes numeric decimal entities as well as hex", async () => {
    stubFetchOk(mockHtml({ description: "Rock &#38; Roll" }))
    const meta = await fetchPartifulMeta("https://partiful.com/e/numeric")
    expect(meta.description).toBe("Rock & Roll")
  })
})

// ── resolveEventImage ─────────────────────────────────────────────────────────

describe("resolveEventImage", () => {
  it("returns local image when no partifulLink", () => {
    const event = localEvent()
    expect(resolveEventImage(event, null)).toBe("/events/test.webp")
  })

  it("returns Partiful CDN image when partifulLink and meta image are present", () => {
    const event = partifulEvent()
    expect(
      resolveEventImage(event, { image: "https://cdn.partiful.com/poster.jpg", description: "", title: "" })
    ).toBe("https://cdn.partiful.com/poster.jpg")
  })

  it("falls back to local image when partifulLink set but meta has no image", () => {
    const event = partifulEvent({ image: "/events/fallback.webp" })
    expect(resolveEventImage(event, { image: "", description: "", title: "" })).toBe("/events/fallback.webp")
  })

  it("falls back to empty string when no image anywhere", () => {
    const event = partifulEvent()
    expect(resolveEventImage(event, null)).toBe("")
  })
})

// ── resolveEventDescription ───────────────────────────────────────────────────

describe("resolveEventDescription", () => {
  it("returns local description when no partifulLink", () => {
    const event = localEvent()
    expect(resolveEventDescription(event, null)).toBe("Local description.")
  })

  it("returns Partiful description when partifulLink and meta description present", () => {
    const event = partifulEvent()
    expect(
      resolveEventDescription(event, { image: "", description: "Dynamic party desc.", title: "" })
    ).toBe("Dynamic party desc.")
  })

  it("falls back to local description when partifulLink set but meta description empty", () => {
    const event = partifulEvent({ description: "Fallback desc." })
    expect(resolveEventDescription(event, { image: "", description: "", title: "" })).toBe("Fallback desc.")
  })

  it("returns undefined when no description anywhere", () => {
    const event = partifulEvent()
    expect(resolveEventDescription(event, null)).toBeUndefined()
  })
})

// ── resolveEventTicket ────────────────────────────────────────────────────────

describe("resolveEventTicket", () => {
  it("returns tbd string when ticketStatus is tbd", () => {
    const event = localEvent({ ticketStatus: "tbd", ticketLink: undefined })
    expect(resolveEventTicket(event)).toBe("tbd")
  })

  it("returns Partiful link with RSVP label when partifulLink present", () => {
    const event = partifulEvent()
    expect(resolveEventTicket(event)).toEqual({
      link: "https://partiful.com/e/abc123",
      label: "RSVP on Partiful",
    })
  })

  it("uses custom ticketLabel when set alongside partifulLink", () => {
    const event = partifulEvent({ ticketLabel: "Join the Party" })
    const ticket = resolveEventTicket(event)
    expect(ticket).not.toBe("tbd")
    expect(ticket).not.toBeNull()
    expect((ticket as { label: string }).label).toBe("Join the Party")
  })

  it("returns local ticketLink with Tickets label when no partifulLink", () => {
    const event = localEvent({ ticketLabel: undefined })
    expect(resolveEventTicket(event)).toEqual({
      link: "https://eventbrite.com/e/123",
      label: "Tickets",
    })
  })

  it("uses custom ticketLabel for local ticket", () => {
    const event = localEvent({ ticketLabel: "Get In" })
    const ticket = resolveEventTicket(event)
    expect((ticket as { label: string }).label).toBe("Get In")
  })

  it("returns null when no ticket info and no partifulLink", () => {
    const event = localEvent({ ticketLink: undefined, ticketLabel: undefined })
    expect(resolveEventTicket(event)).toBeNull()
  })
})
