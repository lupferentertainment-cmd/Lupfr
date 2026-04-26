import { NextRequest, NextResponse } from "next/server"

const BLOCKED_PREFIXES = ["/docs", "/_docs"]

const BLOCKED_ROOT_PATHS = new Set([
  "/readme",
  "/readme.md",
  "/overview.md",
  "/architecture.md",
  "/design.md",
  "/requirements.md",
  "/api.md",
  "/deployment.md",
  "/testing.md",
])

function shouldBlock(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"

  if (BLOCKED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return true
  }

  return BLOCKED_ROOT_PATHS.has(normalized)
}

export function proxy(request: NextRequest) {
  if (!shouldBlock(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}

export const config = {
  matcher: ["/:path*"],
}
