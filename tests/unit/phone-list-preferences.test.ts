/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { acceptCookieConsent } from "@/lib/cookie-consent"
import {
  hasPhoneListCookie,
  hasPhoneListPreference,
  PHONE_LIST_DISMISSED_COOKIE,
  PHONE_LIST_DISMISSED_KEY,
  PHONE_LIST_SUBMITTED_COOKIE,
  PHONE_LIST_SUBMITTED_KEY,
  setPhoneListCookie,
  setPhoneListPreference,
} from "@/lib/phone-list-preferences"

describe("phone-list-preferences", () => {
  const resetBrowserState = () => {
    vi.restoreAllMocks()
    localStorage.clear()
    document.cookie = `${PHONE_LIST_DISMISSED_COOKIE}=; Max-Age=0; Path=/`
    document.cookie = `${PHONE_LIST_SUBMITTED_COOKIE}=; Max-Age=0; Path=/`
    document.cookie = "lupfr_cookie_consent=; Max-Age=0; Path=/"
  }

  beforeEach(resetBrowserState)
  afterEach(resetBrowserState)

  it("stores and reads local phone-list preferences", () => {
    expect(hasPhoneListPreference(PHONE_LIST_DISMISSED_KEY)).toBe(false)

    setPhoneListPreference(PHONE_LIST_DISMISSED_KEY)

    expect(hasPhoneListPreference(PHONE_LIST_DISMISSED_KEY)).toBe(true)
  })

  it("treats blocked localStorage reads as missing preferences", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked")
    })

    expect(hasPhoneListPreference(PHONE_LIST_SUBMITTED_KEY)).toBe(false)
  })

  it("does not throw when localStorage writes are blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota")
    })

    expect(() => setPhoneListPreference(PHONE_LIST_SUBMITTED_KEY)).not.toThrow()
  })

  it("sets contact-list cookies only after consent", () => {
    setPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)
    expect(hasPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)).toBe(false)

    acceptCookieConsent()
    setPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)

    expect(hasPhoneListCookie(PHONE_LIST_SUBMITTED_COOKIE)).toBe(true)
  })
})
