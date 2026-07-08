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

  it("has the temporary blog access kill switch wired in", () => {
    expect(proxySource).toContain("BLOG_PUBLIC_ACCESS_ENABLED")
  })

  it("strips port before host comparison (isBlogHost)", () => {
    expect(proxySource).toContain('split(":")')
  })

  it("still names /blog as a guarded public path", () => {
    expect(proxySource).toContain('"/blog"')
  })
})

// ── behavioral tests via proxy() ──────────────────────────────────────────────

const nextMock = vi.hoisted(() => {
  class MockNextResponse {
    status: number

    constructor(_body?: string, init?: { status?: number }) {
      this.status = init?.status ?? 200
    }

    static next = vi.fn(() => ({ type: "next" }))
    static rewrite = vi.fn((url: { pathname: string }) => ({ type: "rewrite", pathname: url.pathname }))
    static redirect = vi.fn((url: string, status?: number) => ({ type: "redirect", url, status: status ?? 307 }))
  }

  return { NextResponse: MockNextResponse }
})

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

describe("proxy() — disabled blog access", () => {
  beforeEach(() => {
    nextMock.NextResponse.next.mockClear()
    nextMock.NextResponse.rewrite.mockClear()
  })

  it("returns 404 for blog.lupfr.com root", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/", "blog.lupfr.com") as never)
    expect(res.status).toBe(404)
  })

  it("returns 404 for blog.lupfr.com paths", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/some-post", "blog.lupfr.com") as never)
    expect(res.status).toBe(404)
  })

  it("returns 404 for blog.localhost paths", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/about", "blog.localhost") as never)
    expect(res.status).toBe(404)
  })

  it("returns 404 after stripping host ports", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/about", "blog.lupfr.com:443") as never)
    expect(res.status).toBe(404)
  })

  it("returns 404 for case-insensitive blog hosts", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/about", "BLOG.LUPFR.COM") as never)
    expect(res.status).toBe(404)
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

  it("returns 404 for /blog on the primary host", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/blog", "lupfr.com") as never)
    expect(res.status).toBe(404)
  })

  it("returns 404 for /blog/slug on the primary host", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/blog/some-post", "lupfr.com") as never)
    expect(res.status).toBe(404)
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

describe("proxy() — seaside decommissioned (308 → seaside.la)", () => {
  beforeEach(() => {
    nextMock.NextResponse.next.mockClear()
    nextMock.NextResponse.rewrite.mockClear()
    nextMock.NextResponse.redirect.mockClear()
  })

  it("still defines seaside.lupfr.com as a (legacy) SEASIDE_HOST", () => {
    expect(proxySource).toContain("seaside.lupfr.com")
  })

  it("still defines seaside.localhost as a SEASIDE_HOST for local dev", () => {
    expect(proxySource).toContain("seaside.localhost")
  })

  it("308-redirects seaside.lupfr.com root to seaside.la", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/", "seaside.lupfr.com") as never) as { status?: number; url?: string }
    expect(res.status).toBe(308)
    expect(res.url).toBe("https://seaside.la/")
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("redirects any subpath on a seaside host to seaside.la (whole host retired)", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/editions", "seaside.localhost:3000") as never) as { status?: number; url?: string }
    expect(res.status).toBe(308)
    expect(res.url).toBe("https://seaside.la/")
  })

  it("308-redirects the dev.seaside.lupfr.com staging host to seaside.la", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/", "dev.seaside.lupfr.com") as never) as { status?: number; url?: string }
    expect(res.status).toBe(308)
    expect(res.url).toBe("https://seaside.la/")
  })

  it("308-redirects the exact /seaside page route on the primary host", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/seaside", "lupfr.com") as never) as { status?: number; url?: string }
    expect(res.status).toBe(308)
    expect(res.url).toBe("https://seaside.la/")
  })

  it("does NOT redirect /seaside/<asset> on the primary host (static files still serve)", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/seaside/hero-golden.webp", "lupfr.com") as never)
    expect(nextMock.NextResponse.redirect).not.toHaveBeenCalled()
    expect(nextMock.NextResponse.next).toHaveBeenCalledOnce()
  })

  it("does not redirect the primary host root", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/", "lupfr.com") as never)
    expect(nextMock.NextResponse.redirect).not.toHaveBeenCalled()
    expect(nextMock.NextResponse.next).toHaveBeenCalledOnce()
  })
})
