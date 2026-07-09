/**
 * Mobile runtime performance gate: start the built server, drive a throttled
 * mobile Chromium (CDP CPU + network) against the home route, and FAIL if
 * best-of-N mins for LCP / FCP / long-task ms / same-origin transfer bytes
 * exceed budgets in tests/performance/mobile-budgets.json.
 *
 * Measurement only — does not change the site. Cross-origin requests are
 * blocked (204) so third parties cannot flake metrics.
 *
 * Run: bun scripts/verify-mobile-perf.mjs
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_MOBILE_PERF_PORT ?? 6397)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 60000
const PAGE_SETTLE_MS = 1500
const BUDGETS_PATH = join(process.cwd(), "tests/performance/mobile-budgets.json")
const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
const METRIC_KEYS = ["lcpMs", "fcpMs", "longTaskMs", "transferBytes"]

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function _load_budgets() {
  const budgets = JSON.parse(readFileSync(BUDGETS_PATH, "utf8"))
  for (const key of [...METRIC_KEYS, "route", "samples", "cpuThrottle", "netDownMbps", "netLatencyMs", "viewport", "deviceScaleFactor"]) {
    if (budgets[key] === undefined || budgets[key] === null) {
      throw new Error(`verify-mobile-perf: budgets missing required key "${key}"`)
    }
  }
  return budgets
}

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
  throw new Error("verify-mobile-perf: server did not become ready")
}

function _safe_url(href) {
  try {
    return new URL(href, BASE)
  } catch {
    return new URL("http://invalid.local/")
  }
}

async function _block_cross_origin(context) {
  await context.route("**/*", (route) => {
    const url = _safe_url(route.request().url())
    if (url.origin !== BASE) return route.fulfill({ status: 204, body: "" })
    return route.continue()
  })
}

async function _install_perf_observers(context) {
  await context.addInitScript(() => {
    const store = {
      lcpMs: null,
      fcpMs: null,
      longTaskMs: 0,
      longTaskSupported: false,
    }
    globalThis.__lupfrMobilePerf = store

    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          store.lcpMs = entry.renderTime || entry.loadTime || entry.startTime
        }
      })
      po.observe({ type: "largest-contentful-paint", buffered: true })
    } catch {
      /* LCP observer unavailable */
    }

    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") store.fcpMs = entry.startTime
        }
      })
      po.observe({ type: "paint", buffered: true })
    } catch {
      /* paint observer unavailable */
    }

    try {
      store.longTaskSupported = true
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) store.longTaskMs += entry.duration
        }
      })
      po.observe({ type: "longtask", buffered: true })
    } catch {
      store.longTaskSupported = false
    }
  })
}

async function _apply_cdp_throttle(page, budgets) {
  const client = await page.context().newCDPSession(page)
  await client.send("Network.enable")
  await client.send("Emulation.setCPUThrottlingRate", { rate: budgets.cpuThrottle })
  const downloadThroughput = budgets.netDownMbps * 125000
  const uploadThroughput = downloadThroughput / 2
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: budgets.netLatencyMs,
    downloadThroughput,
    uploadThroughput,
    connectionType: "cellular3g",
  })
  return client
}

async function _collect_metrics(page) {
  return page.evaluate((origin) => {
    const store = globalThis.__lupfrMobilePerf ?? {
      lcpMs: null,
      fcpMs: null,
      longTaskMs: 0,
      longTaskSupported: false,
    }

    const lcpEntries = performance.getEntriesByType("largest-contentful-paint")
    let lcpMs = store.lcpMs
    if (lcpEntries.length > 0) {
      const last = lcpEntries[lcpEntries.length - 1]
      lcpMs = last.renderTime || last.loadTime || last.startTime
    }

    const paintEntries = performance.getEntriesByType("paint")
    const fcpEntry = paintEntries.find((e) => e.name === "first-contentful-paint")
    const fcpMs = fcpEntry?.startTime ?? store.fcpMs ?? 0

    let transferBytes = 0
    for (const nav of performance.getEntriesByType("navigation")) {
      try {
        if (new URL(nav.name, origin).origin === origin) transferBytes += nav.transferSize || 0
      } catch {
        /* ignore malformed */
      }
    }
    for (const res of performance.getEntriesByType("resource")) {
      try {
        if (new URL(res.name, origin).origin === origin) transferBytes += res.transferSize || 0
      } catch {
        /* ignore malformed */
      }
    }

    return {
      lcpMs: Number(lcpMs ?? 0),
      fcpMs: Number(fcpMs ?? 0),
      longTaskMs: store.longTaskSupported ? Number(store.longTaskMs || 0) : 0,
      transferBytes: Number(transferBytes || 0),
      longTaskSupported: Boolean(store.longTaskSupported),
    }
  }, BASE)
}

async function _sample(browser, budgets, sampleIndex, warnState) {
  const context = await browser.newContext({
    viewport: budgets.viewport,
    deviceScaleFactor: budgets.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    userAgent: MOBILE_UA,
    reducedMotion: "reduce",
  })
  await _block_cross_origin(context)
  await _install_perf_observers(context)
  const page = await context.newPage()
  try {
    await _apply_cdp_throttle(page, budgets)
    await page.goto(`${BASE}${budgets.route}`, { waitUntil: "load", timeout: NAV_TIMEOUT_MS })
    await page.waitForTimeout(PAGE_SETTLE_MS)
    const metrics = await _collect_metrics(page)
    if (!metrics.longTaskSupported && !warnState.longTaskWarned) {
      console.warn("verify-mobile-perf: WARN Long Tasks API unavailable; longTaskMs treated as 0")
      warnState.longTaskWarned = true
    }
    console.log(
      `verify-mobile-perf: sample ${sampleIndex + 1}/${budgets.samples}` +
        ` lcp=${metrics.lcpMs.toFixed(0)}ms` +
        ` fcp=${metrics.fcpMs.toFixed(0)}ms` +
        ` longTask=${metrics.longTaskMs.toFixed(0)}ms` +
        ` transfer=${metrics.transferBytes}B`,
    )
    return metrics
  } finally {
    await context.close()
  }
}

function _best_of(samples) {
  const best = {}
  for (const key of METRIC_KEYS) {
    best[key] = Math.min(...samples.map((s) => s[key]))
  }
  return best
}

function _report(best, budgets) {
  const rows = METRIC_KEYS.map((key) => {
    const measured = best[key]
    const budget = budgets[key]
    const ok = measured <= budget
    return { key, measured, budget, ok }
  })

  console.log("verify-mobile-perf: summary (best-of-N mins)")
  console.log("  metric           measured       budget     status")
  for (const row of rows) {
    const measured =
      row.key === "transferBytes" ? `${Math.round(row.measured)}B` : `${row.measured.toFixed(0)}ms`
    const budget =
      row.key === "transferBytes" ? `${Math.round(row.budget)}B` : `${row.budget}ms`
    const status = row.ok ? "OK" : "FAIL"
    console.log(
      `  ${row.key.padEnd(16)} ${measured.padStart(10)}  ${budget.padStart(10)}     ${status}`,
    )
  }

  const failures = rows.filter((r) => !r.ok)
  if (failures.length === 0) {
    console.log("verify-mobile-perf: all mobile runtime budgets passed.")
    return
  }
  console.error(`verify-mobile-perf: FAIL — ${failures.length} budget(s) exceeded:`)
  for (const f of failures) {
    const unit = f.key === "transferBytes" ? "B" : "ms"
    console.error(
      `  [${f.key}] measured=${Math.round(f.measured)}${unit} budget=${f.budget}${unit}`,
    )
  }
  process.exitCode = 1
}

function _kill(server) {
  if (!server.killed) server.kill("SIGTERM")
}

async function _run(budgets) {
  await _wait_ready()
  const browser = await chromium.launch()
  const warnState = { longTaskWarned: false }
  const samples = []
  try {
    for (let i = 0; i < budgets.samples; i++) {
      samples.push(await _sample(browser, budgets, i, warnState))
    }
  } finally {
    await browser.close()
  }
  const best = _best_of(samples)
  _report(best, budgets)
}

async function main() {
  const budgets = _load_budgets()
  const server = _spawn_server()
  try {
    await _run(budgets)
  } finally {
    _kill(server)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
