/**
 * Node-only: cookie helpers must no-op without browser globals (SSR).
 */
import { afterEach, describe, expect, it, vi } from "vitest"

afterEach(() => {
  vi.resetModules()
  vi.unstubAllGlobals()
})

describe("cookie-consent SSR branches", () => {
  it("returns false / no-ops when window and document are absent", async () => {
    vi.stubGlobal("window", undefined)
    vi.stubGlobal("document", undefined)
    const mod = await import("@/lib/cookie-consent")
    expect(mod.getCookieConsentAccepted()).toBe(false)
    expect(() => mod.acceptCookieConsent()).not.toThrow()
  })
})
