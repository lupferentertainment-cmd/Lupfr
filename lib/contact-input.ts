const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_ALLOWED_PATTERN = /^[0-9+()\-\s.]{10,25}$/

export function sanitizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function sanitizeEmail(value: string): string {
  return value.replace(/\s+/g, "").trim().toLowerCase()
}

export function sanitizePhone(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value)
}

export function isValidPhone(value: string): boolean {
  if (!PHONE_ALLOWED_PATTERN.test(value)) return false
  const digitsOnly = value.replace(/\D/g, "")
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}