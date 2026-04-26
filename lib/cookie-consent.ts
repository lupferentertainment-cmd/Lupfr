/** localStorage + small cookie: user accepted storage of preference cookies. */
export const LUPFR_CONSENT_STORAGE_KEY = "lupfr_cookie_consent"

/** Broadcast when consent is saved (for lazy-mounted scripts). */
export const LUPFR_CONSENT_EVENT = "lupfr:cookie-consent"

const CONSENT_COOKIE = "lupfr_cookie_consent"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 400

function readStorage(): string | null {
    if (typeof window === "undefined") return null
    try {
        return window.localStorage.getItem(LUPFR_CONSENT_STORAGE_KEY)
    } catch {
        return null
    }
}

/** Whether the user has accepted cookies / storage notice (client-only). */
export function getCookieConsentAccepted(): boolean {
    return readStorage() === "accepted"
}

function setConsentCookie(): void {
    if (typeof document === "undefined") return
    document.cookie = `${CONSENT_COOKIE}=accepted; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`
}

/** Persist consent and notify listeners (call only after user action). */
export function acceptCookieConsent(): void {
    if (typeof window === "undefined") return
    try {
        window.localStorage.setItem(LUPFR_CONSENT_STORAGE_KEY, "accepted")
    } catch {
        // quota or private mode: still set cookie
    }
    setConsentCookie()
    window.dispatchEvent(new Event(LUPFR_CONSENT_EVENT))
}
