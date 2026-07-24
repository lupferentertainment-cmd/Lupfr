import { NextResponse } from "next/server"
import {
  ADMIN_SESSION_COOKIE,
  clearAdminSessionCookieOptions,
} from "@/lib/admin-auth"

export async function POST(request: Request) {
  const host = request.headers.get("host")
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearAdminSessionCookieOptions(host))
  return response
}
