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

  it("describes non-Error storage failures when warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw "string-fail"
    })
    expect(hasPhoneListPreference(PHONE_LIST_DISMISSED_KEY)).toBe(false)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("string-fail"))
  })

  it("falls back to a generic warning when Error.message is empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("")
    })
    expect(hasPhoneListPreference(PHONE_LIST_DISMISSED_KEY)).toBe(false)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("browser storage is unavailable"))
  })

  it("treats cookie read throws as missing and cookie write throws as no-ops", () => {
    acceptCookieConsent()
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const cookieDesc =
      Object.getOwnPropertyDescriptor(document, "cookie") ??
      Object.getOwnPropertyDescriptor(Document.prototype, "cookie")
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get() {
        throw new Error("cookie-blocked")
      },
      set() {
        throw new Error("cookie-write-blocked")
      },
    })
    try {
      expect(hasPhoneListCookie(PHONE_LIST_DISMISSED_COOKIE)).toBe(false)
      expect(() => setPhoneListCookie(PHONE_LIST_DISMISSED_COOKIE)).not.toThrow()
      expect(warn).toHaveBeenCalled()
    } finally {
      if (cookieDesc) Object.defineProperty(document, "cookie", cookieDesc)
      else Reflect.deleteProperty(document, "cookie")
    }
  })
})
