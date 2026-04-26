export const PHONE_LIST_FALLBACK_MESSAGE = "Signup not configured. Opening email to send to LUPFR instead."

const LUPFR_EMAIL = "will@lupfr.com"

interface PhoneListMailtoPayload {
  name: string
  email: string
  phone: string
  source: string
}

export function openPhoneListFallbackMailto(payload: PhoneListMailtoPayload): void {
  if (typeof window === "undefined") return

  const subject = encodeURIComponent(`[LUPFR] Contact list signup - ${payload.name}`)
  const body = encodeURIComponent(
    `Source: ${payload.source}\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}`
  )

  window.location.href = `mailto:${LUPFR_EMAIL}?subject=${subject}&body=${body}`
}