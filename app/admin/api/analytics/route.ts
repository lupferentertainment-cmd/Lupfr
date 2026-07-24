import { NextResponse } from "next/server"
import {
  isAdminConfigured,
  requireAdminSessionFromRequest,
} from "@/lib/admin-auth"
import { fetchAdminTrafficAnalytics } from "@/lib/vercel-web-analytics"

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin portal is unavailable." }, { status: 503 })
  }

  const session = await requireAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const analytics = await fetchAdminTrafficAnalytics()
  return NextResponse.json(analytics, {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}
