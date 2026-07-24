import { NextRequest, NextResponse } from "next/server"
import { BLOG_PUBLIC_ACCESS_ENABLED, SEASIDE_REDIRECT_URL } from "@/lib/site"

const BLOCKED_PREFIXES = ["/docs", "/_docs"]
const BLOG_HOSTS = ["blog.localhost", "blog.lupfr.com"]
const ADMIN_HOSTS = ["admin.localhost", "admin.lupfr.com"]
const SEASIDE_HOSTS = ["seaside.localhost", "seaside.lupfr.com"]
const HOST_SKIP_PREFIXES = ["/_next", "/api"]
const HOST_SKIP_EXACT = new Set([
  "/favicon.ico",
  "/favicon.svg",
  "/site.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/llms.txt",
  "/opengraph-image",
  "/twitter-image",
  "/layout.css",
])

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

const BLOG_DISABLED_EXACT = new Set(["/blog"])
const NOINDEX_ROBOTS = "noindex, nofollow, noarchive"

function shouldBlock(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"

  if (BLOCKED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return true
  }

  return BLOCKED_ROOT_PATHS.has(normalized)
}

function notFoundResponse(): NextResponse {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": NOINDEX_ROBOTS,
    },
  })
}

function withNoindex(response: NextResponse): NextResponse {
  response.headers.set("X-Robots-Tag", NOINDEX_ROBOTS)
  return response
}

function isAdminPath(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  return normalized === "/admin" || normalized.startsWith("/admin/")
}

function shouldBlockBlogAccess(pathname: string, hostHeader: string | null): boolean {
  if (BLOG_PUBLIC_ACCESS_ENABLED) return false
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (BLOG_DISABLED_EXACT.has(normalized) || normalized.startsWith("/blog/")) return true
  return isBlogHost(hostHeader) && !shouldSkipHostRewrite(pathname)
}

function hostFromHeader(hostHeader: string | null): string | null {
  if (!hostHeader) return null
  return hostHeader.toLowerCase().split(":")[0] ?? null
}

function isBlogHost(hostHeader: string | null): boolean {
  const host = hostFromHeader(hostHeader)
  return host !== null && BLOG_HOSTS.includes(host)
}

function isAdminHost(hostHeader: string | null): boolean {
  const host = hostFromHeader(hostHeader)
  return host !== null && ADMIN_HOSTS.includes(host)
}

function shouldSkipHostRewrite(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (HOST_SKIP_EXACT.has(normalized)) return true
  return HOST_SKIP_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

function rewriteBlogHost(request: NextRequest): NextResponse | null {
  if (!isBlogHost(request.headers.get("host"))) return null
  if (shouldSkipHostRewrite(request.nextUrl.pathname)) return null
  const normalized = request.nextUrl.pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (normalized === "/blog" || normalized.startsWith("/blog/")) return null

  const url = request.nextUrl.clone()
  url.pathname = request.nextUrl.pathname === "/" ? "/blog" : `/blog${request.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

/**
 * Admin host rewrite (auth is enforced in app/admin layouts, not here).
 * admin.lupfr.com / admin.localhost → /admin/* so Preview + dedicated DNS share one app path.
 */
function rewriteAdminHost(request: NextRequest): NextResponse | null {
  if (!isAdminHost(request.headers.get("host"))) return null
  if (shouldSkipHostRewrite(request.nextUrl.pathname)) return null

  const pathname = request.nextUrl.pathname
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (normalized === "/admin" || normalized.startsWith("/admin/")) {
    return withNoindex(NextResponse.next())
  }

  const url = request.nextUrl.clone()
  url.pathname = pathname === "/" ? "/admin" : `/admin${pathname}`
  return withNoindex(NextResponse.rewrite(url))
}

function isSeasideHost(hostHeader: string | null): boolean {
  const host = hostFromHeader(hostHeader)
  return host !== null && SEASIDE_HOSTS.includes(host)
}

/**
 * SEA // SIDE is decommissioned here (owner decision 2026-07-08): the microsite
 * now lives at seaside.la (separate Vercel project). Every legacy seaside host
 * 308-redirects to seaside.la so old links and search ranking transfer; on the
 * primary host only the exact `/seaside` page route redirects, while
 * `/seaside/<asset>` static files still serve.
 */
function redirectDecommissionedSeaside(request: NextRequest): NextResponse | null {
  if (isSeasideHost(request.headers.get("host"))) {
    return NextResponse.redirect(SEASIDE_REDIRECT_URL, 308)
  }
  const normalized = request.nextUrl.pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (normalized === "/seaside") {
    return NextResponse.redirect(SEASIDE_REDIRECT_URL, 308)
  }
  return null
}

export function proxy(request: NextRequest) {
  if (shouldBlockBlogAccess(request.nextUrl.pathname, request.headers.get("host"))) {
    return notFoundResponse()
  }

  const seasideRedirect = redirectDecommissionedSeaside(request)
  if (seasideRedirect) return seasideRedirect

  if (!shouldBlock(request.nextUrl.pathname)) {
    const adminRewritten = rewriteAdminHost(request)
    if (adminRewritten) return adminRewritten

    const rewritten = rewriteBlogHost(request)
    if (rewritten) return rewritten

    if (isAdminPath(request.nextUrl.pathname)) {
      return withNoindex(NextResponse.next())
    }

    return NextResponse.next()
  }

  return notFoundResponse()
}

export const config = {
  matcher: ["/:path*"],
}
