import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const FIXTURE_PASSWORD = "test-admin-password-not-real"
const FIXTURE_SECRET = "test-session-secret-at-least-32-bytes-long!!"

describe("lib/admin-auth", () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    process.env.ADMIN_PASSWORD = FIXTURE_PASSWORD
    process.env.ADMIN_SESSION_SECRET = FIXTURE_SECRET
    process.env.ADMIN_USERNAME = "will@lupfr.com"
    delete process.env.VERCEL_ENV
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  it("reports configured when password and session secret are set", async () => {
    const { isAdminConfigured } = await import("@/lib/admin-auth")
    expect(isAdminConfigured()).toBe(true)
  })

  it("fail-closes when ADMIN_PASSWORD is missing", async () => {
    delete process.env.ADMIN_PASSWORD
    const { isAdminConfigured, verifyAdminCredentials } = await import("@/lib/admin-auth")
    expect(isAdminConfigured()).toBe(false)
    expect(verifyAdminCredentials("will@lupfr.com", FIXTURE_PASSWORD)).toBe(false)
  })

  it("fail-closes when ADMIN_SESSION_SECRET is missing", async () => {
    delete process.env.ADMIN_SESSION_SECRET
    const { isAdminConfigured, createAdminSessionToken } = await import("@/lib/admin-auth")
    expect(isAdminConfigured()).toBe(false)
    expect(() => createAdminSessionToken("will@lupfr.com")).toThrow(/ADMIN_SESSION_SECRET/)
  })

  it("defaults ADMIN_USERNAME to will@lupfr.com", async () => {
    delete process.env.ADMIN_USERNAME
    const { getAdminUsername, verifyAdminCredentials } = await import("@/lib/admin-auth")
    expect(getAdminUsername()).toBe("will@lupfr.com")
    expect(verifyAdminCredentials("will@lupfr.com", FIXTURE_PASSWORD)).toBe(true)
  })

  it("accepts matching credentials with constant-time password check", async () => {
    const { verifyAdminCredentials } = await import("@/lib/admin-auth")
    expect(verifyAdminCredentials("will@lupfr.com", FIXTURE_PASSWORD)).toBe(true)
    expect(verifyAdminCredentials("will@lupfr.com", "wrong-password")).toBe(false)
    expect(verifyAdminCredentials("other@example.com", FIXTURE_PASSWORD)).toBe(false)
  })

  it("creates and verifies a signed session token within TTL", async () => {
    const { createAdminSessionToken, verifyAdminSessionToken } = await import("@/lib/admin-auth")
    const token = createAdminSessionToken("will@lupfr.com")
    const session = verifyAdminSessionToken(token)
    expect(session).toEqual({ username: "will@lupfr.com" })
  })

  it("rejects tampered or expired session tokens", async () => {
    const { createAdminSessionToken, verifyAdminSessionToken } = await import("@/lib/admin-auth")
    const token = createAdminSessionToken("will@lupfr.com")
    expect(verifyAdminSessionToken(`${token}x`)).toBeNull()
    expect(verifyAdminSessionToken("not.a.token")).toBeNull()
    expect(verifyAdminSessionToken("")).toBeNull()

    vi.useFakeTimers()
    const fresh = createAdminSessionToken("will@lupfr.com")
    vi.advanceTimersByTime(12 * 60 * 60 * 1000 + 1)
    expect(verifyAdminSessionToken(fresh)).toBeNull()
    vi.useRealTimers()
  })

  it("uses Path=/admin on apex hosts and Path=/ on admin hosts", async () => {
    const { adminSessionCookiePath, ADMIN_SESSION_COOKIE } = await import("@/lib/admin-auth")
    expect(ADMIN_SESSION_COOKIE).toBe("lupfr_admin_session")
    expect(adminSessionCookiePath("lupfr.com")).toBe("/admin")
    expect(adminSessionCookiePath("localhost")).toBe("/admin")
    expect(adminSessionCookiePath("admin.lupfr.com")).toBe("/")
    expect(adminSessionCookiePath("admin.localhost:3000")).toBe("/")
  })

  it("builds secure cookie options for production", async () => {
    process.env.VERCEL_ENV = "production"
    const { adminSessionCookieOptions } = await import("@/lib/admin-auth")
    const opts = adminSessionCookieOptions("lupfr.com")
    expect(opts).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/admin",
      secure: true,
      maxAge: 12 * 60 * 60,
    })
  })

  it("reads a valid session from a Cookie header", async () => {
    const {
      ADMIN_SESSION_COOKIE,
      createAdminSessionToken,
      getAdminSessionFromCookieHeader,
    } = await import("@/lib/admin-auth")
    const token = createAdminSessionToken("will@lupfr.com")
    const header = `other=1; ${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; path=/admin`
    expect(getAdminSessionFromCookieHeader(header)).toEqual({ username: "will@lupfr.com" })
    expect(getAdminSessionFromCookieHeader(null)).toBeNull()
    expect(getAdminSessionFromCookieHeader("nope=1")).toBeNull()
  })
})


