import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies, headers } from "next/headers"

export const ADMIN_SESSION_COOKIE = "lupfr_admin_session" as const
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60
export const DEFAULT_ADMIN_USERNAME = "will@lupfr.com" as const

const ADMIN_HOSTS = new Set(["admin.lupfr.com", "admin.localhost"])

type SessionPayload = {
  v: 1
  u: string
  exp: number
}

export type AdminSession = {
  username: string
}

function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim()
  return value ? value : null
}

function getSessionSecret(): string | null {
  const value = process.env.ADMIN_SESSION_SECRET?.trim()
  return value ? value : null
}

export function getAdminUsername(): string {
  const value = process.env.ADMIN_USERNAME?.trim()
  return value || DEFAULT_ADMIN_USERNAME
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminPassword() && getSessionSecret())
}

function safeEqualString(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) {
    const padded = Buffer.alloc(aBuf.length)
    timingSafeEqual(aBuf, padded)
    return false
  }
  return timingSafeEqual(aBuf, bBuf)
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const expectedPassword = getAdminPassword()
  if (!expectedPassword || !getSessionSecret()) return false
  const userOk = safeEqualString(username.trim().toLowerCase(), getAdminUsername().toLowerCase())
  const passOk = safeEqualString(password, expectedPassword)
  return userOk && passOk
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url")
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url")
}

export function createAdminSessionToken(username: string, nowMs = Date.now()): string {
  const secret = getSessionSecret()
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required to create an admin session")
  }
  const payload: SessionPayload = {
    v: 1,
    u: username,
    exp: Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminSessionToken(token: string | undefined | null, nowMs = Date.now()): AdminSession | null {
  if (!token) return null
  const secret = getSessionSecret()
  if (!secret) return null

  const [encodedPayload, signature] = token.split(".")
  if (!encodedPayload || !signature) return null

  const expected = signPayload(encodedPayload, secret)
  if (!safeEqualString(signature, expected)) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload
    if (payload.v !== 1 || typeof payload.u !== "string" || typeof payload.exp !== "number") {
      return null
    }
    if (payload.exp * 1000 <= nowMs) return null
    if (!safeEqualString(payload.u.toLowerCase(), getAdminUsername().toLowerCase())) return null
    return { username: payload.u }
  } catch {
    return null
  }
}

export function isAdminHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return false
  const host = hostHeader.toLowerCase().split(":")[0] ?? ""
  return ADMIN_HOSTS.has(host)
}

export function adminSessionCookiePath(hostHeader: string | null | undefined): string {
  return isAdminHost(hostHeader) ? "/" : "/admin"
}

export function adminSessionCookieOptions(hostHeader: string | null | undefined) {
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    path: adminSessionCookiePath(hostHeader),
    secure,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  }
}

export function clearAdminSessionCookieOptions(hostHeader: string | null | undefined) {
  return {
    ...adminSessionCookieOptions(hostHeader),
    maxAge: 0,
  }
}

export function getAdminSessionFromCookieHeader(
  cookieHeader: string | null | undefined
): AdminSession | null {
  if (!isAdminConfigured() || !cookieHeader) return null
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
  if (!match) return null
  const token = decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE.length + 1))
  return verifyAdminSessionToken(token)
}

export async function requireAdminSession(): Promise<AdminSession | null> {
  if (!isAdminConfigured()) return null
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  return verifyAdminSessionToken(token)
}

export async function requireAdminSessionFromRequest(
  request: Request
): Promise<AdminSession | null> {
  return getAdminSessionFromCookieHeader(request.headers.get("cookie"))
}


export async function getRequestHost(): Promise<string | null> {
  const h = await headers()
  return h.get("host")
}

/** Deep-link to Vercel Analytics for the Lupfr project (dashboard operator entry). */
export const VERCEL_ANALYTICS_URL =
  "https://vercel.com/lupferentertainment-5199s-projects/lupfr/analytics" as const
