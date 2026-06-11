import { NextRequest, NextResponse } from "next/server"

const BLOCKED_PREFIXES = ["/docs", "/_docs"]
const BLOG_HOSTS = ["blog.localhost", "blog.lupfr.com"]
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

function shouldBlock(pathname: string): boolean {
  const normalized = pathname.toLowerCase().replace(/\/+$/, "") || "/"

  if (BLOCKED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return true
  }

  return BLOCKED_ROOT_PATHS.has(normalized)
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

export function proxy(request: NextRequest) {
  if (!shouldBlock(request.nextUrl.pathname)) {
    const rewritten = rewriteBlogHost(request)
    if (rewritten) return rewritten
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
