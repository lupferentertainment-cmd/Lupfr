import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const FIXTURE_PASSWORD = "test-admin-password-not-real"
const FIXTURE_SECRET = "test-session-secret-at-least-32-bytes-long!!"

describe("GET /admin/api/export/[resource]", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_PASSWORD = FIXTURE_PASSWORD
    process.env.ADMIN_SESSION_SECRET = FIXTURE_SECRET
    process.env.ADMIN_USERNAME = "will@lupfr.com"
  })

  afterEach(() => {
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

  it("returns 401 without a session cookie", async () => {
    const { GET } = await import("@/app/admin/api/export/[resource]/route")
    const res = await GET(new Request("http://localhost/admin/api/export/events"), {
      params: Promise.resolve({ resource: "events" }),
    })
    expect(res.status).toBe(401)
  })

  it("returns CSV for events when authenticated", async () => {
    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/export/[resource]/route")
    const res = await GET(
      new Request("http://localhost/admin/api/export/events", {
        headers: { cookie },
      }),
      { params: Promise.resolve({ resource: "events" }) }
    )
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toMatch(/text\/csv/)
    expect(res.headers.get("content-disposition")).toMatch(/lupfr-events-/)
    const body = await res.text()
    expect(body).toContain("slug,title,dateISO,status")
  })

  it("returns 404 for unknown resources", async () => {
    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/export/[resource]/route")
    const res = await GET(
      new Request("http://localhost/admin/api/export/payments", {
        headers: { cookie },
      }),
      { params: Promise.resolve({ resource: "payments" }) }
    )
    expect(res.status).toBe(404)
  })

  it("returns 503 when admin is not configured", async () => {
    delete process.env.ADMIN_PASSWORD
    const { GET } = await import("@/app/admin/api/export/[resource]/route")
    const res = await GET(new Request("http://localhost/admin/api/export/artists"), {
      params: Promise.resolve({ resource: "artists" }),
    })
    expect(res.status).toBe(503)
  })

  it("returns CSV for artists when authenticated", async () => {
    const cookie = await authedCookie()
    const { GET } = await import("@/app/admin/api/export/[resource]/route")
    const res = await GET(
      new Request("http://localhost/admin/api/export/artists", {
        headers: { cookie },
      }),
      { params: Promise.resolve({ resource: "artists" }) }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toContain("name,genre,instagram")
  })
})

