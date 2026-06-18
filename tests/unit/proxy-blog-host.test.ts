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
