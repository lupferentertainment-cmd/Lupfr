import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("vercel-web-analytics", () => {
  const originalEnv = { ...process.env }
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.resetModules()
    process.env.LUPFR_VERCEL_API_TOKEN = "test-token"
    process.env.LUPFR_VERCEL_PROJECT_ID = "prj_test"
    process.env.LUPFR_VERCEL_TEAM_ID = "team_test"
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it("is configured when token + project id are set", async () => {
    const { isVercelAnalyticsConfigured } = await import("@/lib/vercel-web-analytics")
    expect(isVercelAnalyticsConfigured()).toBe(true)
  })

  it("is not configured when token is missing", async () => {
    delete process.env.LUPFR_VERCEL_API_TOKEN
    const { isVercelAnalyticsConfigured } = await import("@/lib/vercel-web-analytics")
    expect(isVercelAnalyticsConfigured()).toBe(false)
  })

  it("parses daily aggregate rows into chart points", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("visits/count")) {
        return new Response(JSON.stringify({ data: { pageviews: 100, visitors: 40 } }), {
          status: 200,
        })
      }
      if (url.includes("by=day") || url.includes("by%5B%5D=day") || url.includes("by=day")) {
        return new Response(
          JSON.stringify({
            data: [
              { timestamp: "2026-07-01T00:00:00.000Z", pageviews: 10, visitors: 5 },
              { timestamp: "2026-07-02T00:00:00.000Z", pageviews: 20, visitors: 8 },
            ],
          }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({
          data: [
            { requestPath: "/", pageviews: 50, visitors: 20 },
            { requestPath: "/events", pageviews: 30, visitors: 12 },
          ],
        }),
        { status: 200 }
      )
    }) as typeof fetch

    const { fetchAdminTrafficAnalytics } = await import("@/lib/vercel-web-analytics")
    const result = await fetchAdminTrafficAnalytics({
      since: "2026-07-01",
      until: "2026-07-03",
    })
    expect(result.configured).toBe(true)
    expect(result.error).toBeUndefined()
    expect(result.totals).toEqual({ pageviews: 100, visitors: 40 })
    expect(result.daily).toEqual([
      { day: "2026-07-01", pageviews: 10, visitors: 5 },
      { day: "2026-07-02", pageviews: 20, visitors: 8 },
    ])
    expect(result.topPaths[0]).toMatchObject({ path: "/", pageviews: 50 })
  })

  it("surfaces API errors without inventing traffic numbers", async () => {
    globalThis.fetch = vi.fn(async () => new Response("nope", { status: 403 })) as typeof fetch
    const { fetchAdminTrafficAnalytics } = await import("@/lib/vercel-web-analytics")
    const result = await fetchAdminTrafficAnalytics({
      since: "2026-07-01",
      until: "2026-07-03",
    })
    expect(result.configured).toBe(true)
    expect(result.daily).toEqual([])
    expect(result.totals).toEqual({ pageviews: 0, visitors: 0 })
    expect(result.error).toMatch(/403|Analytics/i)
  })

  it("surfaces network failures without inventing traffic numbers", async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error("network down")
    }) as typeof fetch
    const { fetchAdminTrafficAnalytics } = await import("@/lib/vercel-web-analytics")
    const result = await fetchAdminTrafficAnalytics({
      since: "2026-07-01",
      until: "2026-07-03",
    })
    expect(result.daily).toEqual([])
    expect(result.error).toMatch(/network down/i)
  })

  it("returns unconfigured payload when token missing", async () => {
    delete process.env.LUPFR_VERCEL_API_TOKEN
    const { fetchAdminTrafficAnalytics } = await import("@/lib/vercel-web-analytics")
    const result = await fetchAdminTrafficAnalytics()
    expect(result.configured).toBe(false)
    expect(result.daily).toEqual([])
    expect(result.error).toMatch(/LUPFR_VERCEL_API_TOKEN/)
  })

  it("falls back to default team id and coerces bad metric values", async () => {
    delete process.env.LUPFR_VERCEL_TEAM_ID
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      expect(url).toContain("prj_test")
      expect(url).toContain("team_CcitcXHm1mAGX3McZPYNuOtm")
      if (url.includes("visits/count")) {
        return new Response(JSON.stringify({ data: { pageviews: "x", visitors: null } }), {
          status: 200,
        })
      }
      if (url.includes("day")) {
        return new Response(
          JSON.stringify({
            data: [
              { timestamp: "", pageviews: 1, visitors: 1 },
              { timestamp: "2026-07-02T00:00:00.000Z", pageviews: undefined, visitors: 2 },
            ],
          }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({
          data: [{ requestPath: "", pageviews: 3, visitors: 1 }, { pageviews: 4, visitors: 1 }],
        }),
        { status: 200 }
      )
    }) as typeof fetch

    const { fetchAdminTrafficAnalytics, isVercelAnalyticsConfigured } = await import(
      "@/lib/vercel-web-analytics"
    )
    expect(isVercelAnalyticsConfigured()).toBe(true)
    const result = await fetchAdminTrafficAnalytics({
      since: "2026-07-01",
      until: "2026-07-03",
    })
    expect(result.configured).toBe(true)
    expect(result.totals.pageviews).toBe(0)
    expect(result.daily.every((row) => row.day.length === 10)).toBe(true)
  })

  it("reports which upstream call failed when only one endpoint errors", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("visits/count")) {
        return new Response(JSON.stringify({ data: { pageviews: 1, visitors: 1 } }), {
          status: 200,
        })
      }
      if (url.includes("day")) {
        return new Response("fail", { status: 500 })
      }
      return new Response(JSON.stringify({ data: [] }), { status: 200 })
    }) as typeof fetch
    const { fetchAdminTrafficAnalytics } = await import("@/lib/vercel-web-analytics")
    const result = await fetchAdminTrafficAnalytics({
      since: "2026-07-01",
      until: "2026-07-03",
    })
    expect(result.error).toMatch(/500/)
  })
})
