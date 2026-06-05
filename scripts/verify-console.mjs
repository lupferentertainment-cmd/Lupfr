/**
 * Browser smoke check: start `next start`, crawl every internal route in a real
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
const FAIL_CONSOLE_TYPES = new Set(["error"])

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function _spawn_server() {
    return spawn("bun", ["run", "start", "--", "-p", String(PORT)], {
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

function _on_console(msg, route, sink) {
    if (!FAIL_CONSOLE_TYPES.has(msg.type())) return
    sink.push({ route, kind: "console.error", text: msg.text() })
}

function _on_response(resp, route, sink) {
    const status = resp.status()
    if (status < 400 || !resp.url().startsWith(BASE)) return
    sink.push({ route, kind: `http ${status}`, text: resp.url() })
}

function _attach(page, route, sink) {
    page.on("console", (msg) => _on_console(msg, route, sink))
    page.on("pageerror", (err) => sink.push({ route, kind: "pageerror", text: err.message }))
    page.on("response", (resp) => _on_response(resp, route, sink))
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
    if (!path || seen.has(path)) return
    seen.add(path)
    queue.push(path)
}

async function _enqueue_links(page, seen, queue) {
    const hrefs = await page.$$eval("a[href]", (els) => els.map((el) => el.getAttribute("href") || ""))
    for (const href of hrefs) _enqueue_one(href, seen, queue)
}

async function _visit(context, route, sink, seen, queue) {
    const page = await context.newPage()
    _attach(page, route, sink)
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS })
    await _enqueue_links(page, seen, queue)
    await page.close()
    console.log(`verify-console: OK  ${route}`)
}

async function _crawl(browser, sink) {
    const seen = new Set(["/"])
    const queue = ["/"]
    const context = await browser.newContext()
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
