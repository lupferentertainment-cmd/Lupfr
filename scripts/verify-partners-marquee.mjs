/**
 * Partners-marquee behavior gate: start the built server and drive real headless
 * Chromium through the corporate-partners strip, asserting the interaction
 * contract users actually depend on:
 *
 *   1. the grab-to-spin engine activates (`data-spin`) after hydration;
 *   2. hovering the strip pauses the auto-scroll AND the pause holds — the
 *      regression guarded here is the JS pause listeners living on the
 *      composited, continuously-translating track, where Chromium hit-tests a
 *      layer moving under a stationary cursor against stale geometry and fires
 *      a spurious mouseleave ~400ms after enter, un-pausing the row so clicks
 *      land in the gap where the logo used to be (they must live on the static
 *      partners <section>);
 *   3. a plain click on a visible logo navigates: the click reaches the anchor
 *      un-prevented and a target=_blank popup opens (external navigation is
 *      route-aborted so CI never touches partner sites);
 *   4. a pointer drag spins the track with the pointer, and the drag's own
 *      click is suppressed (no popup, no un-prevented anchor click);
 *   5. on a touch viewport, a horizontal swipe spins the track and a plain tap
 *      on a logo still navigates.
 *
 * Run: bun scripts/verify-partners-marquee.mjs   (after `bun run _build`)
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_PARTNERS_MARQUEE_PORT ?? 4398)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const HOVER_HOLD_MS = 1200 // spurious-mouseleave unpause fired ~400ms in; hold well past it
const HOVER_HOLD_TOLERANCE_PX = 1
const DRAG_TRAVEL_PX = 200
const DRAG_MIN_EFFECT_PX = 120 // drag + fling must move at least this far with the pointer

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function _spawn_server() {
  return spawn("bun", ["run", "_serve", "--", "-p", String(PORT)], {
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env },
  })
}

async function _wait_ready() {
  const deadline = Date.now() + READY_TIMEOUT_MS
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BASE}/`)).ok) return
    } catch {
      /* not up yet */
    }
    await _sleep(1000)
  }
  throw new Error("verify-partners-marquee: server did not become ready")
}

async function _new_page(context) {
  const page = await context.newPage()
  // The phone-list popup opens 2.5s after load and its fixed overlay would
  // swallow every marquee interaction below.
  await page.addInitScript(() => localStorage.setItem("lupfr-phone-popup-dismissed", "1"))
  return page
}

/** Block off-host traffic so partner-site popups never leave the machine. */
async function _sandbox_network(context) {
  await context.route("**/*", (route) => {
    const url = route.request().url()
    if (url.startsWith(BASE) || url.startsWith("data:")) return route.continue()
    return route.abort()
  })
}

async function _open_home(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 30000 })
  const track = page.locator(".partner-marquee-track")
  await track.waitFor({ state: "visible", timeout: 15000 })
  // The track animates forever, so Playwright's actionability checks (auto
  // scroll-into-view, locator.click) never see it "stable" — position the
  // viewport and interact via raw mouse/touch coordinates instead.
  await page.evaluate(() =>
    document.querySelector(".partner-marquee")?.scrollIntoView({ block: "center" })
  )
  await page.waitForTimeout(300)
  // Record clicks that actually reach a partner anchor un-suppressed. The
  // drag-click suppression stops propagation in the capture phase, so a
  // suppressed click never reaches this bubble-phase listener.
  await page.evaluate(() => {
    window.__partnerClicks = []
    document.addEventListener("click", (e) => {
      const a = e.target?.closest?.("a")
      if (a && a.closest(".partner-marquee-track")) {
        window.__partnerClicks.push({ href: a.href, prevented: e.defaultPrevented })
      }
    })
  })
  return track
}

const _offset = (track) =>
  track.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)

/**
 * First partner link fully inside the viewport, measured in ONE in-page pass so
 * the coordinates are at most a frame stale — the marquee auto-advances (and
 * flings decay for seconds), so per-locator boundingBox loops go stale before
 * the interaction lands.
 */
async function _visible_link(page, margin) {
  return page.evaluate((edge) => {
    for (const a of document.querySelectorAll(".partner-marquee-track a")) {
      const r = a.getBoundingClientRect()
      if (
        r.x > edge &&
        r.x + r.width < window.innerWidth - edge &&
        r.y > 0 &&
        r.y + r.height < window.innerHeight
      ) {
        return { x: r.x + r.width / 2, y: r.y + r.height / 2, href: a.href }
      }
    }
    return null
  }, margin)
}

async function _check_desktop(context, sink) {
  const page = await _new_page(context)
  const track = await _open_home(page)

  if ((await track.getAttribute("data-spin")) !== "true") {
    sink.push({ where: "desktop", problem: "grab-to-spin engine never activated (no data-spin)" })
    await page.close()
    return
  }

  // 2. Hover-pause holds. Enter the strip and the row must freeze — and STAY
  // frozen well past the ~400ms mark where the old track-attached listeners
  // dropped the pause.
  const tb = await track.boundingBox()
  const hoverY = tb.y + tb.height / 2
  await page.mouse.move(640, hoverY, { steps: 5 })
  await page.waitForTimeout(150)
  const pausedAt = await _offset(track)
  await page.waitForTimeout(HOVER_HOLD_MS)
  const stillAt = await _offset(track)
  const drift = Math.abs(stillAt - pausedAt)
  if (drift > HOVER_HOLD_TOLERANCE_PX) {
    sink.push({
      where: "desktop hover-pause",
      problem: `track drifted ${drift.toFixed(1)}px during a ${HOVER_HOLD_MS}ms hover — pause did not hold`,
    })
  }

  // 3. Plain click navigates. Re-measure the target while paused so the
  // coordinates cannot go stale, then click with raw mouse events.
  const link = await _visible_link(page, 80)
  if (!link) {
    sink.push({ where: "desktop click", problem: "no fully-visible partner link found" })
  } else {
    await page.mouse.move(link.x, link.y)
    await page.waitForTimeout(100)
    const popupPromise = page.waitForEvent("popup", { timeout: 4000 }).catch(() => null)
    await page.mouse.down()
    await page.waitForTimeout(40)
    await page.mouse.up()
    const popup = await popupPromise
    const clicks = await page.evaluate(() => window.__partnerClicks)
    const good = clicks.find((c) => !c.prevented && c.href.replace(/\/$/, "") === link.href.replace(/\/$/, ""))
    if (!good) {
      sink.push({
        where: "desktop click",
        problem: `click on ${link.href} never reached the anchor un-prevented (got ${JSON.stringify(clicks)})`,
      })
    }
    if (!popup) {
      sink.push({ where: "desktop click", problem: `click on ${link.href} opened no target=_blank popup` })
    } else {
      await popup.close()
    }
  }

  // 4. Drag spins the track; the drag's own click is suppressed.
  await page.evaluate(() => (window.__partnerClicks = []))
  const beforeDrag = await _offset(track)
  const dragPopupPromise = page.waitForEvent("popup", { timeout: 800 }).catch(() => null)
  await page.mouse.move(640, hoverY)
  await page.mouse.down()
  await page.mouse.move(640 - DRAG_TRAVEL_PX / 2, hoverY, { steps: 5 })
  await page.waitForTimeout(80)
  if (!(await track.getAttribute("data-dragging"))) {
    sink.push({ where: "desktop drag", problem: "data-dragging never set mid-drag" })
  }
  await page.mouse.move(640 - DRAG_TRAVEL_PX, hoverY, { steps: 5 })
  await page.mouse.up()
  await page.waitForTimeout(150)
  const afterDrag = await _offset(track)
  if (afterDrag - beforeDrag > -DRAG_MIN_EFFECT_PX) {
    sink.push({
      where: "desktop drag",
      problem: `-${DRAG_TRAVEL_PX}px drag only moved the track ${(afterDrag - beforeDrag).toFixed(1)}px`,
    })
  }
  const dragPopup = await dragPopupPromise
  const dragClicks = await page.evaluate(() => window.__partnerClicks)
  if (dragPopup || dragClicks.some((c) => !c.prevented)) {
    sink.push({
      where: "desktop drag",
      problem: "the click ending a real drag was not suppressed (popup or un-prevented anchor click)",
    })
    if (dragPopup) await dragPopup.close()
  }

  await page.close()
}

async function _check_touch(browser, sink) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  await _sandbox_network(context)
  const page = await _new_page(context)
  const track = await _open_home(page)
  const tb = await track.boundingBox()
  const y = tb.y + tb.height / 2

  // 5a. Horizontal swipe spins the track with the finger.
  const before = await _offset(track)
  const cdp = await context.newCDPSession(page)
  const touch = (type, x) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
    })
  await touch("touchStart", 300)
  for (let x = 300 - 20; x >= 100; x -= 20) await touch("touchMove", x)
  await touch("touchEnd", 100)
  await page.waitForTimeout(150)
  const after = await _offset(track)
  if (after - before > -DRAG_MIN_EFFECT_PX) {
    sink.push({
      where: "touch swipe",
      problem: `-200px swipe only moved the track ${(after - before).toFixed(1)}px`,
    })
  }

  // 5b. A plain tap on a visible logo still navigates. Let the swipe's fling
  // decay to a crawl first (exp(-2.2t): ~3% of release speed after 1.5s), then
  // measure and tap in quick succession — the tap's touchstart freezes the
  // track, so only the measurement→tap gap can go stale.
  await page.waitForTimeout(1500)
  await page.evaluate(() => (window.__partnerClicks = []))
  const link = await _visible_link(page, 40)
  if (!link) {
    sink.push({ where: "touch tap", problem: "no fully-visible partner link found" })
  } else {
    const popupPromise = page.waitForEvent("popup", { timeout: 4000 }).catch(() => null)
    await page.touchscreen.tap(link.x, link.y)
    const popup = await popupPromise
    const clicks = await page.evaluate(() => window.__partnerClicks)
    if (!popup && !clicks.some((c) => !c.prevented)) {
      sink.push({ where: "touch tap", problem: `tap on ${link.href} did not navigate` })
    }
    if (popup) await popup.close()
  }

  await context.close()
}

function _kill(server) {
  if (!server.killed) server.kill("SIGTERM")
}

async function _run(sink) {
  await _wait_ready()
  const browser = await chromium.launch()
  const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await _sandbox_network(desktop)
  await _check_desktop(desktop, sink)
  await desktop.close()
  await _check_touch(browser, sink)
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
  if (sink.length === 0) {
    console.log(
      "verify-partners-marquee: hover-pause holds, logo clicks navigate, drag spins with a suppressed click, touch swipe follows the finger."
    )
    return
  }
  console.error(`verify-partners-marquee: FAIL — ${sink.length} problem(s):`)
  for (const e of sink) console.error(`  [${e.where}] ${e.problem}`)
  process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
