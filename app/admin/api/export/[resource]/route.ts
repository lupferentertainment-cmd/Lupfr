import { NextResponse } from "next/server"
import {
  buildAdminExport,
  isAdminExportResource,
} from "@/lib/admin-export"
import {
  isAdminConfigured,
  requireAdminSessionFromRequest,
} from "@/lib/admin-auth"

type RouteContext = {
  params: Promise<{ resource: string }>
}

export async function GET(request: Request, context: RouteContext) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: "Admin portal is unavailable." }, { status: 503 })
  }

  const session = await requireAdminSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const { resource } = await context.params
  if (!isAdminExportResource(resource)) {
    return NextResponse.json({ error: "Unknown export resource." }, { status: 404 })
  }

  const { filename, csv } = buildAdminExport(resource)
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}
