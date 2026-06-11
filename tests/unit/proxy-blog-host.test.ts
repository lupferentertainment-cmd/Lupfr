import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it, vi } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const proxySource = fs.readFileSync(path.join(rootDir, "proxy.ts"), "utf8")

// ── source shape ──────────────────────────────────────────────────────────────

describe("proxy.ts source contracts", () => {
  it("defines blog.lupfr.com as a BLOG_HOST", () => {
    expect(proxySource).toContain("blog.lupfr.com")
  })

  it("defines blog.localhost as a BLOG_HOST for local dev", () => {
    expect(proxySource).toContain("blog.localhost")
  })

  it("skips /_next paths to avoid rewriting Next static assets", () => {
    expect(proxySource).toContain("/_next")
  })

  it("skips /api paths to avoid rewriting API routes", () => {
    expect(proxySource).toContain('"/api"')
  })

  it("skips /blog prefix — already a blog route, no double-prefix", () => {
    expect(proxySource).toContain('"/blog"')
  })

  it("strips port before host comparison (isBlogHost)", () => {
    expect(proxySource).toContain('split(":")')
  })

  it("rewrites root / to /blog, not /blog/", () => {
    expect(proxySource).toContain('"/blog"')
    expect(proxySource).toContain('`/blog${request.nextUrl.pathname}`')
  })
})

// ── behavioral tests via proxy() ──────────────────────────────────────────────

const nextMock = vi.hoisted(() => ({
  NextResponse: {
    next: vi.fn(() => ({ type: "next" })),
    rewrite: vi.fn((url: { pathname: string }) => ({ type: "rewrite", pathname: url.pathname })),
  },
}))

vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: nextMock.NextResponse,
}))

function buildRequest(pathname: string, host: string | null = null) {
  const headers = new Map<string, string>()
  if (host) headers.set("host", host)

  const clonedUrl = { pathname }
  return {
    headers: { get: (key: string) => (key === "host" ? (host ?? null) : null) },
    nextUrl: {
      pathname,
      clone: () => clonedUrl,
    },
  }
}

describe("proxy() — blog subdomain rewrite", () => {
  beforeEach(() => {
    nextMock.NextResponse.next.mockClear()
    nextMock.NextResponse.rewrite.mockClear()
  })

  it("rewrites / to /blog for blog.lupfr.com", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalledOnce()
    const arg = nextMock.NextResponse.rewrite.mock.calls[0][0] as { pathname: string }
    expect(arg.pathname).toBe("/blog")
  })

  it("rewrites /some-post to /blog/some-post for blog.lupfr.com", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/some-post", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalledOnce()
    const arg = nextMock.NextResponse.rewrite.mock.calls[0][0] as { pathname: string }
    expect(arg.pathname).toBe("/blog/some-post")
  })

  it("rewrites for blog.localhost (local dev)", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/about", "blog.localhost") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalledOnce()
  })

  it("strips port from host header before comparison", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/about", "blog.lupfr.com:443") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalledOnce()
  })

  it("is case-insensitive for host header", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/about", "BLOG.LUPFR.COM") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalledOnce()
  })

  it("passes through (next) for non-blog host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/about", "lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
    expect(nextMock.NextResponse.next).toHaveBeenCalledOnce()
  })

  it("passes through when no host header present", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/about", null) as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /_next/* on blog host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/_next/static/chunks/main.js", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /api/* on blog host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/api/contact", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /blog path — already routed correctly", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/blog", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /blog/slug paths — already routed correctly", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/blog/some-post", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /favicon.ico on blog host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/favicon.ico", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("skips rewrite for /robots.txt on blog host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/robots.txt", "blog.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })
})
