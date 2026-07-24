import { NextResponse } from "next/server"
import {
  isAdminConfigured,
  requireAdminSessionFromRequest,
} from "@/lib/admin-auth"
import { listTelemetryEvents } from "@/lib/supabase-server"

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin portal is unavailable." }, { status: 503 })
  }

  const session = await requireAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const result = await listTelemetryEvents(200)
  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}
