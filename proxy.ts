import { NextRequest, NextResponse } from "next/server"
import { BLOG_PUBLIC_ACCESS_ENABLED } from "@/lib/site"

const BLOCKED_PREFIXES = ["/docs", "/_docs"]
const BLOG_HOSTS = ["blog.localhost", "blog.lupfr.com"]
const SEASIDE_HOSTS = ["seaside.localhost", "seaside.lupfr.com"]
const BLOG_SKIP_PREFIXES = ["/_next", "/api"]
const BLOG_SKIP_EXACT = new Set([
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
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  })
}

function shouldBlockBlogAccess(pathname: string, hostHeader: string | null): boolean {
  if (BLOG_PUBLIC_ACCESS_ENABLED) return false
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (BLOG_DISABLED_EXACT.has(normalized) || normalized.startsWith("/blog/")) return true
  return isBlogHost(hostHeader) && !shouldSkipBlogRewrite(pathname)
}

function isBlogHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false
  const host = hostHeader.toLowerCase().split(":")[0]
  return BLOG_HOSTS.includes(host)
}

function shouldSkipBlogRewrite(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (BLOG_SKIP_EXACT.has(normalized)) return true
  if (normalized === "/blog" || normalized.startsWith("/blog/")) return true
  return BLOG_SKIP_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

function rewriteBlogHost(request: NextRequest): NextResponse | null {
  if (!isBlogHost(request.headers.get("host"))) return null
  if (shouldSkipBlogRewrite(request.nextUrl.pathname)) return null

  const url = request.nextUrl.clone()
  url.pathname = request.nextUrl.pathname === "/" ? "/blog" : `/blog${request.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

function isSeasideHost(hostHeader: string | null): boolean {
  if (!hostHeader) return false
  const host = hostHeader.toLowerCase().split(":")[0]
  return SEASIDE_HOSTS.includes(host)
}

function shouldSkipSeasideRewrite(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"
  if (BLOG_SKIP_EXACT.has(normalized)) return true
  if (normalized === "/seaside" || normalized.startsWith("/seaside/")) return true
  return BLOG_SKIP_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))
}

function rewriteSeasideHost(request: NextRequest): NextResponse | null {
  if (!isSeasideHost(request.headers.get("host"))) return null
  if (shouldSkipSeasideRewrite(request.nextUrl.pathname)) return null

  const url = request.nextUrl.clone()
  url.pathname = request.nextUrl.pathname === "/" ? "/seaside" : `/seaside${request.nextUrl.pathname}`
  return NextResponse.rewrite(url)
}

export function proxy(request: NextRequest) {
  if (shouldBlockBlogAccess(request.nextUrl.pathname, request.headers.get("host"))) {
    return notFoundResponse()
  }

  if (!shouldBlock(request.nextUrl.pathname)) {
    const rewritten = rewriteBlogHost(request) ?? rewriteSeasideHost(request)
    if (rewritten) return rewritten
    return NextResponse.next()
  }

  return notFoundResponse()
}

export const config = {
  matcher: ["/:path*"],
}
