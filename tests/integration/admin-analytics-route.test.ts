import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const FIXTURE_PASSWORD = "test-admin-password-not-real"
const FIXTURE_SECRET = "test-session-secret-at-least-32-bytes-long!!"

describe("GET /admin/api/analytics", () => {
  const originalEnv = { ...process.env }
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_PASSWORD = FIXTURE_PASSWORD
    process.env.ADMIN_SESSION_SECRET = FIXTURE_SECRET
    process.env.ADMIN_USERNAME = "will@lupfr.com"
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

  async function authedCookie(): Promise<string> {
    const { createAdminSessionToken, ADMIN_SESSION_COOKIE } = await import("@/lib/admin-auth")
    const token = createAdminSessionToken("will@lupfr.com")
    return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}`
  }

  it("returns 401 without a session", async () => {
    const { GET } = await import("@/app/admin/api/analytics/route")
    const res = await GET(new Request("http://localhost/admin/api/analytics"))
    expect(res.status).toBe(401)
  })

  it("returns configured:false payload when token missing (no fake series)", async () => {
    delete process.env.LUPFR_VERCEL_API_TOKEN
    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/analytics/route")
    const res = await GET(
      new Request("http://localhost/admin/api/analytics", { headers: { cookie } })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      configured: boolean
      daily: unknown[]
      totals: { pageviews: number; visitors: number }
    }
    expect(body.configured).toBe(false)
    expect(body.daily).toEqual([])
    expect(body.totals).toEqual({ pageviews: 0, visitors: 0 })
  })

  it("returns real series when Vercel API responds", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("visits/count")) {
        return new Response(JSON.stringify({ data: { pageviews: 12, visitors: 4 } }), {
          status: 200,
        })
      }
      if (url.includes("day")) {
        return new Response(
          JSON.stringify({
            data: [{ timestamp: "2026-07-20T00:00:00.000Z", pageviews: 12, visitors: 4 }],
          }),
          { status: 200 }
        )
      }
      return new Response(
        JSON.stringify({ data: [{ requestPath: "/", pageviews: 12, visitors: 4 }] }),
        { status: 200 }
      )
    }) as typeof fetch

    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/analytics/route")
    const res = await GET(
      new Request("http://localhost/admin/api/analytics", { headers: { cookie } })
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      configured: boolean
      daily: Array<{ day: string; pageviews: number }>
      totals: { pageviews: number; visitors: number }
    }
    expect(body.configured).toBe(true)
    expect(body.totals.pageviews).toBe(12)
    expect(body.daily[0]?.pageviews).toBe(12)
  })
})
