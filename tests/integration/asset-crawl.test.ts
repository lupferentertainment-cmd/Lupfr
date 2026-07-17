/**
 * Dynamic asset and route crawl — real HTTP requests against the built server.
 *
 * Discovers every internal route from the data layer (events, gallery, blog, sitemap),
 * fetches each page, then checks every <img>, <source>, <link>, <script>, <a href>
 * asset reference to ensure no 404s reach a visitor's browser.
 *
 * Skips when the production build is absent (before `bun run _build`) or when
 * LUPFR_SKIP_ASSET_CRAWL=1. ci.sh runs this after the build via _verify:assets.
 */

import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import path, { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { getBlogPosts } from "@/lib/data/blog"
import { getServices, servicePath } from "@/lib/data/services"
import { EVENTS } from "@/lib/events"
import { BLOG_PUBLIC_ACCESS_ENABLED } from "@/lib/site"

const rootDir = join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")

const distDir = process.env.NEXT_DIST_DIR ?? ".next"
const buildIdPath = join(rootDir, distDir, "BUILD_ID")
const buildExists = existsSync(buildIdPath)
const shouldSkip = !buildExists || process.env.LUPFR_SKIP_ASSET_CRAWL === "1"

const PORT = Number(process.env.VERIFY_ASSETS_PORT ?? 4380)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60_000
const FETCH_TIMEOUT_MS = 10_000

// ── helpers ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

async function pingReady(base: string): Promise<boolean> {
  try {
    return (await fetch(`${base}/`, { signal: AbortSignal.timeout(1500) })).ok
  } catch {
    return false
  }
}

async function waitReady(base: string): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    if (await pingReady(base)) return
    await sleep(1000)
  }
  throw new Error(`asset-crawl: server did not become ready at ${base}`)
}

function extractSrcPaths(html: string, base: URL): string[] {
  const results: string[] = []
  const patterns = [
    /\bsrc=["']([^"']+)["']/gi,
    /\bsrcset=["']([^"']+)["']/gi,
  ]
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      const raw = m[1].trim()
      if (raw.startsWith("data:")) continue
      for (const part of raw.split(",")) {
        const token = part.trim().split(/\s+/)[0]
        if (!token) continue
        try {
          const u = new URL(token, base)
          if (u.origin === base.origin) results.push(u.pathname)
        } catch { /* invalid url */ }
      }
    }
  }
  return results
}

function extractLinkHrefs(html: string, base: URL): string[] {
  const results: string[] = []
  const ALLOWED_REL = new Set(["stylesheet", "icon", "apple-touch-icon", "manifest", "shortcut icon"])
  for (const m of html.matchAll(/<link\b([^>]*)>/gi)) {
    const attrs = m[1]
    const relM = attrs.match(/\brel=["']([^"']+)["']/i)
    if (!relM) continue
    const rel = relM[1].toLowerCase()
    if (!ALLOWED_REL.has(rel)) continue
    const hrefM = attrs.match(/\bhref=["']([^"']+)["']/i)
    if (!hrefM) continue
    try {
      const u = new URL(hrefM[1].trim(), base)
      if (u.origin === base.origin) results.push(u.pathname)
    } catch { /* invalid url */ }
  }
  return results
}

function extractInternalLinks(html: string, base: URL): string[] {
  const results: string[] = []
  for (const m of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const raw = m[1].trim()
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue
    try {
      const u = new URL(raw, base)
      if (u.origin !== base.origin) continue
      let p = u.pathname
      if (p !== "/" && p.endsWith("/")) p = p.slice(0, -1)
      if (/\.[a-z0-9]+$/i.test(p)) continue
      if (p.startsWith("/api") || p.startsWith("/_next")) continue
      results.push(p)
    } catch { /* invalid url */ }
  }
  return results
}

async function fetchStatus(path: string): Promise<number> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
    headers: { "User-Agent": "lupfr-asset-crawl-test/1.0" },
  })
  return res.status
}

async function fetchHtml(path: string): Promise<{ status: number; html: string }> {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    redirect: "follow",
    headers: { Accept: "text/html", "User-Agent": "lupfr-asset-crawl-test/1.0" },
  })
  const html = await res.text()
  return { status: res.status, html }
}

function buildRoutes(): string[] {
  const routes = new Set<string>([
    "/",
    "/artists",
    "/careers",
    "/contact",
    "/gallery",
    "/privacy",
    "/services",
    "/terms",
  ])
  if (BLOG_PUBLIC_ACCESS_ENABLED) routes.add("/blog")
  if (BLOG_PUBLIC_ACCESS_ENABLED) {
    for (const post of getBlogPosts()) routes.add(`/blog/${post.slug}`)
  }
  for (const e of EVENTS) routes.add(`/events/${e.slug}`)
  for (const s of getServices()) routes.add(servicePath(s))
  return Array.from(routes).sort()
}

// ── server lifecycle ──────────────────────────────────────────────────────────

let serverProc: ReturnType<typeof spawn> | null = null

async function startServer(): Promise<void> {
  serverProc = spawn("bun", ["run", "_serve", "--", "-p", String(PORT)], {
    cwd: rootDir,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, NEXT_DIST_DIR: distDir },
  })
  await waitReady(BASE)
}

function stopServer(): void {
  if (serverProc && serverProc.exitCode === null) {
    serverProc.kill("SIGTERM")
    serverProc = null
  }
}

// ── test suite ────────────────────────────────────────────────────────────────

describe.skipIf(shouldSkip)("asset crawl — no 404s in the built site", () => {
  const baseUrl = new URL(BASE)

  beforeAll(async () => {
    await startServer()
  }, READY_TIMEOUT_MS + 5000)

  afterAll(() => {
    stopServer()
  })

  const routes = buildRoutes()

  it.each(routes)("route %s returns 200", async (route) => {
    const status = await fetchStatus(route)
    expect(status, `${route} returned ${status}`).toBe(200)
  })

  it("unknown route returns 404", async () => {
    const status = await fetchStatus("/__lupfr_no_such_page_xyz__")
    expect(status).toBe(404)
  })

  it("discovers assets on each page and none return 404", async () => {
    const failures: string[] = []

    for (const route of routes) {
      const { status, html } = await fetchHtml(route)
      if (status !== 200) continue

      const assets = [
        ...extractSrcPaths(html, baseUrl),
        ...extractLinkHrefs(html, baseUrl),
      ]

      const checked = new Set<string>()
      for (const asset of assets) {
        if (checked.has(asset)) continue
        checked.add(asset)
        if (asset.startsWith("/_next/")) continue
        let s: number
        try {
          s = await fetchStatus(asset)
        } catch {
          failures.push(`${route} → ${asset} (fetch error)`)
          continue
        }
        if (s === 404) failures.push(`${route} → ${asset} (404)`)
      }
    }

    expect(failures, `\nAssets returning 404:\n${failures.join("\n")}`).toEqual([])
  }, READY_TIMEOUT_MS + 30_000)

  it("discovers all internal links and none return 404", async () => {
    const visited = new Set<string>()
    const toVisit = ["/"]
    const failures: string[] = []

    while (toVisit.length > 0) {
      const route = toVisit.shift()!
      if (visited.has(route)) continue
      visited.add(route)

      const { status, html } = await fetchHtml(route)
      if (status === 404) {
        failures.push(`${route} returned 404`)
        continue
      }

      const links = extractInternalLinks(html, baseUrl)
      for (const link of links) {
        if (!visited.has(link)) toVisit.push(link)
      }
    }

    expect(failures, `\nInternal links returning 404:\n${failures.join("\n")}`).toEqual([])
  }, READY_TIMEOUT_MS + 30_000)
})

describe.skipIf(!shouldSkip)("asset crawl skipped", () => {
  it("is skipped when no production build exists", () => {
    const reason = !buildExists
      ? `no BUILD_ID at ${buildIdPath}`
      : "LUPFR_SKIP_ASSET_CRAWL=1"
    expect(reason).toBeTruthy()
  })
})
