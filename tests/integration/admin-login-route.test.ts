import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const FIXTURE_PASSWORD = "test-admin-password-not-real"
const FIXTURE_SECRET = "test-session-secret-at-least-32-bytes-long!!"

describe("POST /admin/api/login", () => {
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

  function loginRequest(body: unknown, ipSuffix = Math.floor(Math.random() * 200)) {
    return new Request("http://localhost/admin/api/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "localhost:3000",
        "x-forwarded-for": `203.0.113.${ipSuffix}`,
      },
      body: JSON.stringify(body),
    })
  }

  it("returns 503 when admin env is not configured", async () => {
    delete process.env.ADMIN_PASSWORD
    const { POST } = await import("@/app/admin/api/login/route")
    const res = await POST(loginRequest({ username: "will@lupfr.com", password: "x" }))
    expect(res.status).toBe(503)
    const json = (await res.json()) as { error?: string }
    expect(json.error).toMatch(/unavailable/i)
  })

  it("rejects wrong credentials without setting a session cookie", async () => {
    const { POST } = await import("@/app/admin/api/login/route")
    const res = await POST(
      loginRequest({ username: "will@lupfr.com", password: "wrong-password" })
    )
    expect(res.status).toBe(401)
    expect(res.headers.getSetCookie?.() ?? []).toHaveLength(0)
    const setCookie = res.headers.get("set-cookie")
    expect(setCookie).toBeNull()
  })

  it("sets lupfr_admin_session on successful login", async () => {
    const { POST } = await import("@/app/admin/api/login/route")
    const res = await POST(
      loginRequest({ username: "will@lupfr.com", password: FIXTURE_PASSWORD })
    )
    expect(res.status).toBe(200)
    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("lupfr_admin_session=")
    expect(setCookie.toLowerCase()).toContain("httponly")
    expect(setCookie.toLowerCase()).toContain("path=/admin")
    expect(setCookie.toLowerCase()).toContain("samesite=lax")
  })

  it("rate-limits repeated login attempts from the same IP", async () => {
    const { POST } = await import("@/app/admin/api/login/route")
    const ip = 42
    for (let i = 0; i < 5; i += 1) {
      const res = await POST(
        loginRequest({ username: "will@lupfr.com", password: "wrong" }, ip)
      )
      expect(res.status).toBe(401)
    }
    const limited = await POST(
      loginRequest({ username: "will@lupfr.com", password: "wrong" }, ip)
    )
    expect(limited.status).toBe(429)
  })
})

describe("POST /admin/api/logout", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_PASSWORD = FIXTURE_PASSWORD
    process.env.ADMIN_SESSION_SECRET = FIXTURE_SECRET
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it("clears the admin session cookie", async () => {
    const { POST } = await import("@/app/admin/api/logout/route")
    const res = await POST(
      new Request("http://localhost/admin/api/logout", {
        method: "POST",
        headers: { host: "localhost:3000" },
      })
    )
    expect(res.status).toBe(200)
    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("lupfr_admin_session=")
    expect(setCookie).toMatch(/max-age=0|Max-Age=0/i)
  })
})
