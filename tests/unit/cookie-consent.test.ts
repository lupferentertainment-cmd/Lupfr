/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from "vitest"
import {
  acceptCookieConsent,
  getCookieConsentAccepted,
  LUPFR_CONSENT_EVENT,
  LUPFR_CONSENT_STORAGE_KEY,
} from "@/lib/cookie-consent"

describe("cookie-consent", () => {
  afterEach(() => {
    localStorage.clear()
  })

  it("is not accepted by default", () => {
    expect(getCookieConsentAccepted()).toBe(false)
  })

  it("treats read errors as not accepted", () => {
    // Spy the instance (not Storage.prototype): Vercel/happy-dom may not share the same proto chain.
    const spy = vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    expect(getCookieConsentAccepted()).toBe(false)
    spy.mockRestore()
  })

  it("acceptCookieConsent still sets cookie and fires event when localStorage.setItem throws", () => {
    const spy = vi.spyOn(localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })
    let fired = false
    window.addEventListener(LUPFR_CONSENT_EVENT, () => {
      fired = true
    })
    acceptCookieConsent()
    expect(fired).toBe(true)
    expect(document.cookie).toContain("lupfr_cookie_consent")
    spy.mockRestore()
  })

  it("acceptCookieConsent sets storage and fires event", () => {
    let fired = false
    window.addEventListener(LUPFR_CONSENT_EVENT, () => {
      fired = true
    })
    acceptCookieConsent()
    expect(localStorage.getItem(LUPFR_CONSENT_STORAGE_KEY)).toBe("accepted")
    expect(getCookieConsentAccepted()).toBe(true)
    expect(fired).toBe(true)
  })

})
