import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminCredentials,
} from "@/lib/admin-auth"
import { createRateLimitKey, enforceRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const rateLimited = enforceRateLimit({
    key: createRateLimitKey(request, "admin-login"),
    limit: 5,
    windowMs: 15 * 60_000,
  })
  if (rateLimited) return rateLimited

  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin portal is unavailable." },
      { status: 503 }
    )
  }

  let body: { username?: unknown; password?: unknown }
  try {
    body = (await request.json()) as { username?: unknown; password?: unknown }
  } catch {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 })
  }

  const username = typeof body.username === "string" ? body.username : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
  }

  const host = request.headers.get("host")
  const token = createAdminSessionToken(username.trim())
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions(host))
  return response
}
