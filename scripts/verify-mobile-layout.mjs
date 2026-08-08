/**
 * Mobile layout gate (owner request 2026-08-08): "ensure that mobile everything
 * is centered ... no right margin or empty space".
 *
 * Starts the built server, loads the key routes in a real mobile Chromium at
 * several phone widths, and FAILS on either of the two defects the owner can
 * actually see:
 *
 *   1. Horizontal overflow — `documentElement.scrollWidth` wider than the
 *      viewport. This is what produces a dead strip on the right and lets the
 *      page pan sideways.
 *   2. Asymmetric section gutters — a section's content box sitting closer to
 *      one edge than the other, which reads as "not centered".
 *
 * Decorative/full-bleed elements are exempt by design: absolutely-positioned
 * blur glows, the deliberately viewport-bleeding event carousel track, and
 * off-canvas shimmer sweeps all legitimately extend past the content column.
 * The gate measures the *content* boxes only, so it stays quiet about those and
 * loud about real layout breakage.
 *
 * Measurement only — does not change the site.
 *
 * Run: bun scripts/verify-mobile-layout.mjs
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_MOBILE_LAYOUT_PORT ?? 6521)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 60000
const SETTLE_MS = 1200

/** Narrowest phone we support, a common mid-size, and a large phone. */
const WIDTHS = [320, 390, 430]
const ROUTES = ["/", "/events", "/artists", "/brands", "/services", "/media"]

/** Home sections whose content column must sit symmetrically in the viewport. */
const SECTION_IDS = ["brands", "events", "services", "artists", "about", "team", "contact"]

/** Gutter asymmetry we treat as a defect, in CSS px. */
const GUTTER_TOLERANCE_PX = 2

const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

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
    if (await _ping()) return true
    await _sleep(500)
  }
  return false
}

/**
 * Runs in the page. Scrolls the full document first so lazy/deferred sections
 * mount and their scroll-reveal transforms settle — an unsettled reveal is
 * mid-animation, not a layout bug, and measuring it would flake.
 */
async function _measure([sectionIds, tolerance, deviceWidth]) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo(0, y)
    await sleep(60)
  }
  window.scrollTo(0, 0)
  await sleep(500)

  // A mobile browser widens its *layout viewport* to fit overflowing content
  // instead of reporting overflow, so `innerWidth` grows in lockstep with
  // `scrollWidth` and comparing the two would never fail. Both are therefore
  // measured against the fixed device width we emulated: if either exceeds it,
  // the page has pushed itself wider than the phone.
  const vw = window.innerWidth
  const docWidth = document.documentElement.scrollWidth

  // Gutters are measured against the device width for the same reason.
  const gutters = []
  for (const id of sectionIds) {
    const section = document.getElementById(id)
    if (!section) continue

    // The content column is the section's centered wrapper, not the full-bleed
    // section element and not its decorative absolute children.
    const wrapper = section.querySelector(".container, [class*='max-w-']")
    if (!wrapper) continue

    const r = wrapper.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue

    const left = r.left
    const right = deviceWidth - r.right
    if (Math.abs(left - right) > tolerance) {
      gutters.push({ id, left: Math.round(left), right: Math.round(right) })
    }
  }

  return { vw, docWidth, gutters }
}

async function main() {
  const server = _spawn_server()
  let browser
  const failures = []

  try {
    if (!(await _wait_ready())) {
      throw new Error(`verify-mobile-layout: server never became ready on ${BASE}`)
    }

    browser = await chromium.launch()

    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: MOBILE_UA,
      })
      const page = await context.newPage()

      for (const route of ROUTES) {
        await page.goto(`${BASE}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: NAV_TIMEOUT_MS,
        })
        await page.waitForTimeout(SETTLE_MS)

        const result = await page.evaluate(_measure, [
          route === "/" ? SECTION_IDS : [],
          GUTTER_TOLERANCE_PX,
          width,
        ])

        const widest = Math.max(result.docWidth, result.vw)
        if (widest > width) {
          failures.push(
            `${route} @${width}px: horizontal overflow — page lays out ${widest}px ` +
              `wide on a ${width}px device (${widest - width}px of dead space to the side)`
          )
        }

        for (const g of result.gutters) {
          failures.push(
            `${route} @${width}px: #${g.id} is off-centre — ${g.left}px left gutter vs ${g.right}px right`
          )
        }

        const status = widest > width || result.gutters.length ? "FAIL" : "OK"
        console.log(
          `verify-mobile-layout: ${status.padEnd(4)} ${route.padEnd(10)} @${width}px ` +
            `doc=${result.docWidth} vw=${result.vw} device=${width}`
        )
      }

      await context.close()
    }
  } finally {
    if (browser) await browser.close()
    server.kill("SIGTERM")
  }

  if (failures.length) {
    console.error("\nverify-mobile-layout: FAILED")
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }

  console.log("verify-mobile-layout: all mobile layout checks passed.")
}

await main()
