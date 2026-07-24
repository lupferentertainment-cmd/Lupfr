import { NextResponse } from "next/server"
import {
  isAdminConfigured,
  requireAdminSessionFromRequest,
} from "@/lib/admin-auth"
import { getAdminContactsSheetUrl } from "@/lib/admin-export"
import { listContacts } from "@/lib/supabase-server"

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin portal is unavailable." }, { status: 503 })
  }

  const session = await requireAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const result = await listContacts(150)
  return NextResponse.json(
    {
      ...result,
      sheetUrl: getAdminContactsSheetUrl(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }
  )
}
