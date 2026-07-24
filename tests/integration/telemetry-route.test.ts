import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/lib/supabase-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/supabase-server")>(
    "@/lib/supabase-server"
  )
  return {
    ...actual,
    insertTelemetryEvent: vi.fn(),
    isSupabaseConfigured: vi.fn(),
  }
})

describe("POST /api/telemetry", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.SUPABASE_URL = "https://example.supabase.co"
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key"
  })

  afterEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it("returns 400 for invalid body", async () => {
    const { isSupabaseConfigured } = await import("@/lib/supabase-server")
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    const { POST } = await import("@/app/api/telemetry/route")
    const res = await POST(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: "nope" }),
      })
    )
    expect(res.status).toBe(400)
  })

  it("returns 503 when Supabase is not configured", async () => {
    const { isSupabaseConfigured } = await import("@/lib/supabase-server")
    vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    const { POST } = await import("@/app/api/telemetry/route")
    const res = await POST(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: "page_impression", path: "/" }),
      })
    )
    expect(res.status).toBe(503)
  })

  it("accepts valid event and persists via insertTelemetryEvent", async () => {
    const { isSupabaseConfigured, insertTelemetryEvent } = await import("@/lib/supabase-server")
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    vi.mocked(insertTelemetryEvent).mockResolvedValue({ ok: true })

    const { POST } = await import("@/app/api/telemetry/route")
    const res = await POST(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "cta_click",
          path: "/",
          label: "Book an Event",
          href: "/contact",
        }),
      })
    )
    expect(res.status).toBe(200)
    expect(insertTelemetryEvent).toHaveBeenCalled()
  })

  it("returns 502 when insert fails", async () => {
    const { isSupabaseConfigured, insertTelemetryEvent } = await import("@/lib/supabase-server")
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    vi.mocked(insertTelemetryEvent).mockResolvedValue({ ok: false, error: "db down" })
    const { POST } = await import("@/app/api/telemetry/route")
    const res = await POST(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName: "page_impression", path: "/" }),
      })
    )
    expect(res.status).toBe(502)
  })

  it("returns 400 for invalid JSON text", async () => {
    const { isSupabaseConfigured } = await import("@/lib/supabase-server")
    vi.mocked(isSupabaseConfigured).mockReturnValue(true)
    const { POST } = await import("@/app/api/telemetry/route")
    const res = await POST(
      new Request("http://localhost/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "{not-json",
      })
    )
    expect(res.status).toBe(400)
  })
})
