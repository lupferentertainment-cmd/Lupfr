import { NextResponse } from "next/server"
import {
  isAdminConfigured,
  requireAdminSessionFromRequest,
} from "@/lib/admin-auth"
import { contactsToCsv, listContacts } from "@/lib/supabase-server"

export async function GET(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin portal is unavailable." }, { status: 503 })
  }

  const session = await requireAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const result = await listContacts(500)
  if (!result.configured) {
    return NextResponse.json(
      { error: "Contacts store is not configured." },
      { status: 503 }
    )
  }

  const day = new Date().toISOString().slice(0, 10)
  const csv = contactsToCsv(result.contacts)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lupfr-contacts-${day}.csv"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}
