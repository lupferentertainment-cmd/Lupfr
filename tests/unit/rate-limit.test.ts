import { randomUUID } from "node:crypto"
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit"

describe("rate limiting", () => {
  it("creates a stable key using forwarded ip", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-forwarded-for": "203.0.113.4, 10.0.0.1" },
    })

    expect(createRateLimitKey(req, "scope")).toBe("scope:203.0.113.4")
  })

  it("falls back to x-real-ip when the first forwarded hop is empty", () => {
    const req = new Request("http://localhost/api/test", {
      headers: {
        "x-forwarded-for": ", 203.0.113.9",
        "x-real-ip": "198.51.100.20",
      },
    })
    expect(createRateLimitKey(req, "scope")).toBe("scope:198.51.100.20")
  })

  it("uses x-real-ip when forwarded header is absent", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "x-real-ip": " 198.51.100.2 " },
    })
    expect(createRateLimitKey(req, "scope")).toBe("scope:198.51.100.2")
  })

  it("uses unknown-ip when no client ip headers are present", () => {
    const req = new Request("http://localhost/api/test")
    expect(createRateLimitKey(req, "scope")).toBe("scope:unknown-ip")
  })

  it("allows requests under limit and then blocks with retry-after", () => {
    const key = `unit-enforce-${randomUUID()}`

    expect(enforceRateLimit({ key, limit: 2, windowMs: 60_000 })).toBeNull()
    expect(enforceRateLimit({ key, limit: 2, windowMs: 60_000 })).toBeNull()

    const blocked = enforceRateLimit({ key, limit: 2, windowMs: 60_000 })
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get("Retry-After")).toBeTruthy()
  })

  it("resets after the window", async () => {
    const key = `unit-reset-${randomUUID()}`
    const windowMs = 400

    expect(enforceRateLimit({ key, limit: 1, windowMs })).toBeNull()
    expect(enforceRateLimit({ key, limit: 1, windowMs })?.status).toBe(429)

    await new Promise((resolve) => setTimeout(resolve, windowMs + 50))
    expect(enforceRateLimit({ key, limit: 1, windowMs })).toBeNull()
  })
})
