import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { beforeEach, describe, expect, it, vi } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const proxySource = fs.readFileSync(path.join(rootDir, "proxy.ts"), "utf8")

describe("proxy.ts admin host contracts", () => {
  it("defines admin.lupfr.com and admin.localhost as ADMIN_HOSTS", () => {
    expect(proxySource).toContain("admin.lupfr.com")
    expect(proxySource).toContain("admin.localhost")
    expect(proxySource).toContain("ADMIN_HOSTS")
  })

  it("does not gate auth redirects in proxy (layout owns auth)", () => {
    expect(proxySource).not.toMatch(/redirect\(.*\/admin\/login/)
    expect(proxySource).not.toContain("lupfr_admin_session")
  })
})

const nextMock = vi.hoisted(() => {
  class MockNextResponse {
    status: number
    headers: Map<string, string>

    constructor(_body?: string, init?: { status?: number; headers?: Record<string, string> }) {
      this.status = init?.status ?? 200
      this.headers = new Map(Object.entries(init?.headers ?? {}))
    }

    static next = vi.fn((init?: { headers?: Record<string, string> }) => ({
      type: "next",
      headers: new Map(Object.entries(init?.headers ?? {})),
    }))
    static rewrite = vi.fn((url: { pathname: string }, init?: { headers?: Record<string, string> }) => ({
      type: "rewrite",
      pathname: url.pathname,
      headers: new Map(Object.entries(init?.headers ?? {})),
    }))
    static redirect = vi.fn((url: string, status?: number) => ({
      type: "redirect",
      url,
      status: status ?? 307,
    }))
  }

  return { NextResponse: MockNextResponse }
})

vi.mock("next/server", () => ({
  NextRequest: class {},
  NextResponse: nextMock.NextResponse,
}))

function buildRequest(pathname: string, host: string | null = null) {
  const clonedUrl = { pathname }
  return {
    headers: { get: (key: string) => (key === "host" ? (host ?? null) : null) },
    nextUrl: {
      pathname,
      clone: () => clonedUrl,
    },
  }
}

describe("proxy() — admin host rewrite", () => {
  beforeEach(() => {
    nextMock.NextResponse.next.mockClear()
    nextMock.NextResponse.rewrite.mockClear()
    vi.resetModules()
  })

  it("rewrites admin.lupfr.com root onto /admin", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/", "admin.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalled()
    const url = nextMock.NextResponse.rewrite.mock.calls[0]?.[0] as { pathname: string }
    expect(url.pathname).toBe("/admin")
  })

  it("rewrites admin.localhost /login onto /admin/login", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/login", "admin.localhost:3000") as never)
    expect(nextMock.NextResponse.rewrite).toHaveBeenCalled()
    const url = nextMock.NextResponse.rewrite.mock.calls[0]?.[0] as { pathname: string }
    expect(url.pathname).toBe("/admin/login")
  })

  it("does not double-prefix paths already under /admin", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/admin/login", "admin.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
    expect(nextMock.NextResponse.next).toHaveBeenCalled()
  })

  it("skips rewrite for /_next on admin host", async () => {
    const { proxy } = await import("@/proxy")
    proxy(buildRequest("/_next/static/chunks/main.js", "admin.lupfr.com") as never)
    expect(nextMock.NextResponse.rewrite).not.toHaveBeenCalled()
  })

  it("adds X-Robots-Tag noindex for /admin paths on apex", async () => {
    const { proxy } = await import("@/proxy")
    const res = proxy(buildRequest("/admin", "lupfr.com") as never) as unknown as {
      headers?: Map<string, string>
    }
    const robots =
      res.headers?.get("X-Robots-Tag") ??
      (nextMock.NextResponse.next.mock.calls[0]?.[0] as { headers?: Record<string, string> } | undefined)
        ?.headers?.["X-Robots-Tag"]
    expect(robots).toMatch(/noindex/i)
  })
})
