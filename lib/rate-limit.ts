import { NextResponse } from "next/server"

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
}

const RATE_LIMIT_STORE = new Map<string, RateLimitEntry>()

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim()
    if (firstIp) return firstIp
  }
  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) return realIp
  return "unknown-ip"
}

export function createRateLimitKey(request: Request, scope: string): string {
  const ip = getClientIp(request)
  return `${scope}:${ip}`
}

export function enforceRateLimit(options: RateLimitOptions): NextResponse | null {
  const now = Date.now()
  const existing = RATE_LIMIT_STORE.get(options.key)

  if (!existing || now >= existing.resetAt) {
    RATE_LIMIT_STORE.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return null
  }

  if (existing.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      }
    )
  }

  existing.count += 1
  RATE_LIMIT_STORE.set(options.key, existing)
  return null
}