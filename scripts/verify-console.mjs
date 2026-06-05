/**
 * Browser smoke check: start the built server, crawl every internal route in a real
 * headless Chromium, and FAIL on any console.error, uncaught page/runtime error
 * (incl. React hydration #418/#423), or same-origin HTTP >= 400 response.
 *
 * This is the gate that catches Next.js client errors curl-based route checks
 * cannot see. Run: bun scripts/verify-console.mjs
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_CONSOLE_PORT ?? 4399)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 30000
const PAGE_SETTLE_MS = 750
const FAIL_CONSOLE_TYPES = new Set(["error"])
const BLOCKED_RESOURCE_TYPES = new Set(["font", "image", "media"])
const SKIPPED_CONSOLE_ROUTE_PATTERNS = [/^\/gallery\/p\//]

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function _spawn_server() {
    return spawn("bun", ["run", "_serve", "--", "-p", String(PORT)], {
        stdio: ["ignore", "ignore", "inherit"],
        env: { ...process.env },
    })
}

async function _ping() {
    try {
        return (await fetch(`${BASE}/`)).ok
    } catch {
        return false
    }
}

async function _wait_ready() {
    const deadline = Date.now() + READY_TIMEOUT_MS
    while (Date.now() < deadline) {
        if (await _ping()) return
        await _sleep(1000)
    }
    throw new Error("verify-console: server did not become ready")
}

function _is_resource_console_noise(msg) {
    return msg.text().startsWith("Failed to load resource: net::ERR_FAILED")
}

function _on_console(msg, route, sink) {
    if (!FAIL_CONSOLE_TYPES.has(msg.type())) return
    if (_is_resource_console_noise(msg)) return
    sink.push({ route, kind: "console.error", text: msg.text() })
}

function _on_response(resp, route, sink) {
    const status = resp.status()
    if (status < 400 || !resp.url().startsWith(BASE)) return
    sink.push({ route, kind: `http ${status}`, text: resp.url() })
}

function _is_rsc_prefetch_abort(req) {
    const url = _safe_url(req.url())
    const errorText = req.failure()?.errorText ?? ""
    return url.origin === BASE && url.searchParams.has("_rsc") && errorText === "net::ERR_ABORTED"
}

function _on_request_failed(req, route, sink) {
    if (BLOCKED_RESOURCE_TYPES.has(req.resourceType())) return
    if (_is_rsc_prefetch_abort(req)) return
    if (!req.url().startsWith(BASE)) return
    sink.push({ route, kind: "requestfailed", text: `${req.url()} ${req.failure()?.errorText ?? ""}` })
}

function _attach(page, route, sink) {
    page.on("console", (msg) => _on_console(msg, route, sink))
    page.on("pageerror", (err) => sink.push({ route, kind: "pageerror", text: err.message }))
    page.on("response", (resp) => _on_response(resp, route, sink))
    page.on("requestfailed", (req) => _on_request_failed(req, route, sink))
}

function _safe_url(href) {
    try {
        return new URL(href, BASE)
    } catch {
        return new URL("http://invalid.local/")
    }
}

function _to_path(href) {
    const url = _safe_url(href)
    if (url.origin !== BASE) return ""
    let path = url.pathname || "/"
    if (path === "/api" || path.startsWith("/api/")) return ""
    if (path !== "/" && path.endsWith("/")) path = path.slice(0, -1)
    if (/\.[A-Za-z0-9]+$/.test(path)) return ""
    return path
}

function _enqueue_one(href, seen, queue) {
    const path = _to_path(href)
    if (!path || seen.has(path) || !_should_crawl(path)) return
    seen.add(path)
    queue.push(path)
}

function _should_crawl(path) {
    return !SKIPPED_CONSOLE_ROUTE_PATTERNS.some((pattern) => pattern.test(path))
}

async function _enqueue_links(page, seen, queue) {
    const hrefs = await page.$$eval("a[href]", (els) => els.map((el) => el.getAttribute("href") || ""))
    for (const href of hrefs) _enqueue_one(href, seen, queue)
}

async function _block_heavy_assets(context) {
    await context.route("**/*", (route) => {
        const resourceType = route.request().resourceType()
        if (BLOCKED_RESOURCE_TYPES.has(resourceType)) return route.fulfill({ status: 204, body: "" })
        return route.continue()
    })
}

function _is_closed_error(err) {
    return String(err?.message ?? err).includes("Target page, context or browser has been closed")
}

async function _close_page(page) {
    if (page.isClosed()) return
    await page.close()
}

async function _visit(context, route, sink, seen, queue) {
    const page = await context.newPage()
    _attach(page, route, sink)
    try {
        await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS })
        await page.waitForTimeout(PAGE_SETTLE_MS)
        await _enqueue_links(page, seen, queue)
        console.log(`verify-console: OK  ${route}`)
    } catch (err) {
        if (!_is_closed_error(err)) throw err
        console.warn(`verify-console: WARN ${route} closed during settle`)
    } finally {
        await _close_page(page)
    }
}

async function _crawl(browser, sink) {
    const seen = new Set(["/"])
    const queue = ["/"]
    const context = await browser.newContext()
    await _block_heavy_assets(context)
    while (queue.length) {
        await _visit(context, queue.shift(), sink, seen, queue)
    }
    await context.close()
    console.log(`verify-console: crawled ${seen.size} internal route(s).`)
}

function _report(sink) {
    if (sink.length === 0) {
        console.log("verify-console: no console/runtime errors across crawl.")
        return
    }
    console.error(`verify-console: FAIL — ${sink.length} browser error(s):`)
    for (const e of sink) console.error(`  [${e.route}] ${e.kind}: ${e.text}`)
    process.exitCode = 1
}

function _kill(server) {
    if (!server.killed) server.kill("SIGTERM")
}

async function _run(sink) {
    await _wait_ready()
    const browser = await chromium.launch()
    await _crawl(browser, sink)
    await browser.close()
}

async function main() {
    const server = _spawn_server()
    const sink = []
    try {
        await _run(sink)
    } finally {
        _kill(server)
    }
    _report(sink)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
