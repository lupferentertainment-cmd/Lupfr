import { describe, expect, it } from "vitest"
import { parseTelemetryBody, TELEMETRY_EVENT_NAMES } from "@/lib/telemetry"

describe("parseTelemetryBody", () => {
  it("accepts page_impression with path", () => {
    const parsed = parseTelemetryBody({
      eventName: "page_impression",
      path: "/events",
    })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.value.eventName).toBe("page_impression")
      expect(parsed.value.path).toBe("/events")
    }
  })

  it("accepts cta_click with label", () => {
    const parsed = parseTelemetryBody({
      eventName: "cta_click",
      path: "/",
      label: "Book an Event",
      href: "/contact",
    })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.value.label).toBe("Book an Event")
      expect(parsed.value.href).toBe("/contact")
    }
  })

  it("rejects unknown event names", () => {
    const parsed = parseTelemetryBody({ eventName: "hack", path: "/" })
    expect(parsed.ok).toBe(false)
  })

  it("rejects missing path", () => {
    const parsed = parseTelemetryBody({ eventName: "page_impression" })
    expect(parsed.ok).toBe(false)
  })

  it("lists allowed event names", () => {
    expect(TELEMETRY_EVENT_NAMES).toContain("page_impression")
    expect(TELEMETRY_EVENT_NAMES).toContain("cta_click")
  })

  it("rejects non-object bodies", () => {
    expect(parseTelemetryBody(null).ok).toBe(false)
    expect(parseTelemetryBody("x").ok).toBe(false)
  })

  it("accepts optional meta string map and trims oversized values", () => {
    const parsed = parseTelemetryBody({
      eventName: "cta_click",
      path: "/",
      meta: {
        ok: "yes",
        skip: 1,
        ["k".repeat(50)]: "v".repeat(300),
      },
    })
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.value.meta?.ok).toBe("yes")
      expect(parsed.value.meta?.skip).toBeUndefined()
    }
  })
})
