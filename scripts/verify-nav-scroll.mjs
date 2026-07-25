/**
 * Nav section-scroll gate: start the built server and drive a real headless
 * Chromium through the navbar's section links, asserting that clicking a section
 * lands the viewport ON that section quickly and stays there.
 *
 * Regression guarded: deferred lower sections (#about/#team/#contact) used to
 * mount only the target, leaving the deferred sections above it as wrong-height
 * placeholders — so the target drifted while chunks loaded and blind timers
 * chased it for ~2s ("takes forever to scroll"). To reproduce real conditions we
 * throttle `_next/static` chunk delivery; a correct fix must still settle fast
 * and land the target flush under the fixed header (scroll-padding-top).
 *
 * Run: bun scripts/verify-nav-scroll.mjs
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_NAV_SCROLL_PORT ?? 4397)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 30000
const CHUNK_THROTTLE_MS = 400 // simulate a real network for lazy section chunks
// Deadline to converge flush under the header. Generous so throttled multi-chunk
// loads under CI contention don't false-fail; the regression this guards (wrong
// final position / perpetual drift) never converges flush regardless of budget.
// Above the app's 12s realign cap (lib/hash-scroll.ts maxDurationMs) plus margin,
// so a pathologically slow-but-correct settle under CI load isn't false-failed.
// Normal runs settle in ~1s; this is only a safety ceiling.
const CONVERGE_DEADLINE_MS = 15000
const POLL_INTERVAL_MS = 100
const STABILITY_WINDOW_MS = 500
const ALIGN_TOLERANCE_PX = 48 // flush under the header; a broken jump is off by 100s
const STABILITY_TOLERANCE_PX = 4
// Scroll-spy (IntersectionObserver) can lag the scroll settle under parallel CI
// load, so the active-link read is polled to convergence instead of read once.
const ACTIVE_SETTLE_MS = 4000

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
  throw new Error("verify-nav-scroll: server did not become ready")
}

async function _throttle_chunks(context) {
  await context.route("**/_next/static/**", async (route) => {
    await _sleep(CHUNK_THROTTLE_MS)
    return route.continue()
  })
}

async function _scroll_padding_top(page) {
  return page.evaluate(() => {
    const raw = getComputedStyle(document.documentElement).scrollPaddingTop
    return Number.parseFloat(raw) || 0
  })
}

async function _section_top(page, id) {
  return page.evaluate((sectionId) => {
    const el = document.getElementById(sectionId)
    return el ? el.getBoundingClientRect().top : null
  }, id)
}

async function _open_mobile_menu(page) {
  // The mobile toggle is a pure-JS button (no anchor fallback), so a click fired
  // before hydration under chunk throttling is simply lost. Retry while the menu
  // is still closed; only click when closed so we never toggle it back shut.
  const dialog = page.getByRole("dialog", { name: "Site navigation" })
  const deadline = Date.now() + 15000
  while (Date.now() < deadline) {
    if ((await page.getAttribute("header", "data-lupfr-nav-menu-open")) === "true") {
      await dialog.waitFor({ state: "visible", timeout: 2000 })
      return
    }
    await page
      .getByRole("button", { name: "Open menu" })
      .click({ timeout: 2000 })
      .catch(() => {})
    await page.waitForTimeout(300)
  }
  throw new Error("verify-nav-scroll: mobile menu did not open (hydration timeout)")
}

/**
 * Load the home page fresh, click a nav link to `sectionId`, and assert the
 * section settles flush under the header within budget and holds still.
 */
async function _check(page, { label, sectionId, mobile }, sink) {
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 })
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS })

  const linkScope = mobile
    ? (await (async () => {
        await _open_mobile_menu(page)
        return page.getByRole("dialog", { name: "Site navigation" })
      })())
    : page.locator('nav[aria-label="Primary"]')

  await linkScope.getByRole("link", { name: label, exact: true }).click()

  const pad = await _scroll_padding_top(page)
  const where = `${mobile ? "mobile" : "desktop"} → ${label} (#${sectionId})`

  // Wait for sustained quiescence: the section must sit flush under the header AND
  // hold that position continuously for the stability window. Deferred targets and
  // the deferred sections above them load their chunks at staggered times, so a
  // single post-settle sample is brittle under CI load (a late sibling can cause a
  // transient shift/re-render). Any disturbance resets the window; we keep trying
  // until the deadline. The regression this guards never reaches sustained flush,
  // so the deadline only bounds how long we wait, not what counts as pass. This
  // mirrors the app's own time-based settle in lib/hash-scroll.ts.
  const deadline = Date.now() + CONVERGE_DEADLINE_MS
  let flushSince = null
  let lastTop = null
  let settledTop = null
  while (Date.now() < deadline) {
    const top = await _section_top(page, sectionId)
    const isFlush = top !== null && Math.abs(top - pad) <= ALIGN_TOLERANCE_PX
    const isSteady = top !== null && lastTop !== null && Math.abs(top - lastTop) <= STABILITY_TOLERANCE_PX
    if (isFlush && isSteady) {
      if (flushSince === null) flushSince = Date.now()
      if (Date.now() - flushSince >= STABILITY_WINDOW_MS) {
        settledTop = top
        break
      }
    } else {
      flushSince = null // disturbance — restart the quiescence window
    }
    lastTop = top
    await page.waitForTimeout(POLL_INTERVAL_MS)
  }

  if (settledTop === null) {
    const lastSeen = lastTop === null ? "unmounted" : `${lastTop.toFixed(1)}px`
    sink.push({
      where,
      problem: `never reached a sustained flush position (±${ALIGN_TOLERANCE_PX}px of ${pad}px) within ${CONVERGE_DEADLINE_MS}ms; last=${lastSeen}`,
    })
    return
  }

  if (mobile) await _open_mobile_menu(page)
  // Poll for scroll-spy to converge on the clicked section — the observer that
  // sets aria-current can fire a frame or two after the scroll settles under CI
  // contention, so a single read races and false-flags the section above.
  let activeLabels = []
  const activeDeadline = Date.now() + ACTIVE_SETTLE_MS
  while (Date.now() < activeDeadline) {
    activeLabels = await linkScope.locator('a[aria-current="true"]').allTextContents()
    if (activeLabels.length === 1 && activeLabels[0]?.trim() === label) break
    await page.waitForTimeout(POLL_INTERVAL_MS)
  }
  if (activeLabels.length !== 1 || activeLabels[0]?.trim() !== label) {
    sink.push({
      where,
      problem: `active navbar link is ${JSON.stringify(activeLabels.map((value) => value.trim()))}; expected only ${JSON.stringify(label)}`,
    })
    return
  }
  // Desktop links have the visual underline; the mobile drawer indicates active
  // state with gold text only, so its rendered contract is aria-current above.
  if (!mobile) {
    const visibleUnderlines = linkScope.locator('[data-lupfr-nav-underline].w-full')
    const visibleUnderlineCount = await visibleUnderlines.count()
    const activeUnderlineClass = await linkScope
      .locator('a[aria-current="true"] [data-lupfr-nav-underline]')
      .getAttribute("class")
    if (visibleUnderlineCount !== 1 || !activeUnderlineClass?.includes("w-full")) {
      sink.push({
        where,
        problem: `visible underline count=${visibleUnderlineCount}, active underline class=${JSON.stringify(activeUnderlineClass)}; expected exactly the clicked link underline at full width`,
      })
      return
    }
  }
  console.log(`verify-nav-scroll: OK  ${where} top=${settledTop.toFixed(1)}px pad=${pad}px`)
}

const CASES = [
  { label: "Events", sectionId: "events", mobile: false }, // eager control
  { label: "Contact", sectionId: "contact", mobile: false }, // deepest deferred
  { label: "Team", sectionId: "team", mobile: false }, // middle deferred
  { label: "Contact", sectionId: "contact", mobile: true }, // mobile menu path
]

function _report(sink) {
  if (sink.length === 0) {
    console.log("verify-nav-scroll: all section links land flush and settle fast.")
    return
  }
  console.error(`verify-nav-scroll: FAIL — ${sink.length} navigation problem(s):`)
  for (const e of sink) console.error(`  [${e.where}] ${e.problem}`)
  process.exitCode = 1
}

function _kill(server) {
  if (!server.killed) server.kill("SIGTERM")
}

async function _run(sink) {
  await _wait_ready()
  const browser = await chromium.launch()
  const context = await browser.newContext()
  await _throttle_chunks(context)
  const page = await context.newPage()
  for (const testCase of CASES) {
    await _check(page, testCase, sink)
  }
  await context.close()
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
