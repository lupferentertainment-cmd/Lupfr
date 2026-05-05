import { getCookieConsentAccepted } from "@/lib/cookie-consent"

export const PHONE_LIST_DISMISSED_KEY = "lupfr-phone-popup-dismissed"
export const PHONE_LIST_SUBMITTED_KEY = "lupfr-phone-popup-submitted"
export const PHONE_LIST_DISMISSED_COOKIE = "lupfr_phone_popup_dismissed"
export const PHONE_LIST_SUBMITTED_COOKIE = "lupfr_phone_popup_submitted"

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

type PhoneListPreferenceKey =
  | typeof PHONE_LIST_DISMISSED_KEY
  | typeof PHONE_LIST_SUBMITTED_KEY

type PhoneListPreferenceCookie =
  | typeof PHONE_LIST_DISMISSED_COOKIE
  | typeof PHONE_LIST_SUBMITTED_COOKIE

function describeStorageError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) return error.message
  if (typeof error === "string" && error.length > 0) return error
  return "browser storage is unavailable"
}

function warnPreferenceFailure(action: string, error: unknown): void {
  if (typeof console === "undefined") return
  console.warn(`Phone-list preference ${action} skipped: ${describeStorageError(error)}`)
}

export function hasPhoneListPreference(key: PhoneListPreferenceKey): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(key) === "1"
  } catch (error: unknown) {
    warnPreferenceFailure("read", error)
    return false
  }
}

export function setPhoneListPreference(key: PhoneListPreferenceKey): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, "1")
  } catch (error: unknown) {
    warnPreferenceFailure("write", error)
  }
}

export function hasPhoneListCookie(name: PhoneListPreferenceCookie): boolean {
  if (typeof document === "undefined") return false
  try {
    return document.cookie.split(";").some((chunk) => chunk.trim() === `${name}=1`)
  } catch (error: unknown) {
    warnPreferenceFailure("cookie read", error)
    return false
  }
}

export function setPhoneListCookie(name: PhoneListPreferenceCookie): void {
  if (!getCookieConsentAccepted() || typeof document === "undefined") return
  try {
    document.cookie = `${name}=1; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`
  } catch (error: unknown) {
    warnPreferenceFailure("cookie write", error)
  }
}