/**
 * Playwright edge-case gate for Will's 2026-07-21/22 homepage updates.
 * Starts the built server, loads `/`, and asserts partners/brands/services/
 * artists/past-compact contracts (the Team / Partiful band check now loads /about) in real Chromium.
 *
 * Run: bun scripts/verify-will-home.mjs
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_WILL_HOME_PORT ?? 4395)
const BASE = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 30000

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
  throw new Error("verify-will-home: server did not become ready")
}

/** Deferred home sections only mount near the viewport — scroll until the selector exists. */
async function _scrollUntil(page, selector, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const handle = await page.$(selector)
    if (handle) {
      await handle.evaluate((el) => el.scrollIntoView({ block: "center" }))
      await handle.dispose()
      return
    }
    await page.evaluate(() => window.scrollBy(0, Math.max(400, window.innerHeight * 0.75)))
    await _sleep(200)
  }
  throw new Error(`verify-will-home: timed out waiting for ${selector}`)
}

async function main() {
  const server = _spawn_server()
  let browser
  const failures = []
  try {
    await _wait_ready()
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    page.setDefaultTimeout(NAV_TIMEOUT_MS)
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" })

    // Live home (claude-home-*): Brands links to /brands via "Explore LUPFR →";
    // Services has no /services index link — its CTA is "Plan Your Event" → /contact.
    // (The pre-redesign "View all brands" / "Explore all services" links are gone.)
    await _scrollUntil(page, "#brands")
    const brands = page.locator("#brands").getByRole("link", { name: /Explore LUPFR/i }).first()
    if ((await brands.count()) === 0 || (await brands.getAttribute("href")) !== "/brands") {
      failures.push("missing Explore LUPFR → /brands")
    }

    await _scrollUntil(page, "#services")
    const services = page.locator("#services").getByRole("link", { name: /Plan Your Event/i }).first()
    if ((await services.count()) === 0 || !(await services.getAttribute("href"))?.startsWith("/contact")) {
      failures.push("missing Services → Plan Your Event → /contact")
    }

    await _scrollUntil(page, "#events")
    await page.evaluate(() => window.scrollBy(0, 700))
    // Past events are archive-only now (owner request 2026-08-05): the landing
    // page stays forward-looking and the archive lives on /events.
    await page.waitForTimeout(1500)
    if ((await page.locator('[data-compact="true"]').count()) > 0) {
      failures.push("Past carousel still renders on the landing page")
    }
    if ((await page.locator("#past-events").count()) > 0) {
      failures.push("#past-events section still renders on the landing page")
    }

    // Round 16 (2026-11-18): Past Artists moved to /about (checked below); the home page no longer has #artists.
    if ((await page.locator("#artists").count()) > 0) {
      failures.push("#artists still renders on the landing page (it lives on /about now)")
    }

    // 2026-11-17: About + Our Team + the Partiful band moved to /about; the home page no longer has #team.
    if ((await page.locator("#team").count()) > 0) {
      failures.push("#team still renders on the landing page (it lives on /about now)")
    }
    const aboutPage = await browser.newPage()
    aboutPage.setDefaultTimeout(NAV_TIMEOUT_MS)
    await aboutPage.goto(`${BASE}/about`, { waitUntil: "domcontentloaded" })
    try {
      await aboutPage.getByText(/Backed by Partiful/i).first().waitFor({ state: "visible", timeout: 15000 })
    } catch {
      failures.push("Partiful announcement missing under Team on /about")
    }
    // The Past Artists wall is the design's fixed 7-name pick (round 4), not the full roster; PLS&TY leads it.
    try {
      await aboutPage.locator("#artists").getByRole("heading", { name: "PLS&TY" }).waitFor({ state: "attached", timeout: 15000 })
    } catch {
      failures.push("PLS&TY missing from the Past Artists wall on /about")
    }
    await aboutPage.close()

    // Partner strip is above the fold — check after returning near top.
    await page.evaluate(() => window.scrollTo(0, 0))
    await _sleep(200)
    const partnersSection = page.locator('[aria-label="Corporate partners"]')
    if ((await partnersSection.count()) === 0) {
      failures.push("Corporate partners section missing")
    } else if ((await partnersSection.getAttribute("data-partners-chrome")) !== "freeform") {
      failures.push('partners strip missing data-partners-chrome="freeform"')
    }
    if ((await partnersSection.locator(".partner-logo-chip").count()) > 0) {
      failures.push("partners strip still renders .partner-logo-chip card tiles")
    }
    const partnerShells = partnersSection.locator(
      ".partner-marquee-track > div:not([aria-hidden]) .partner-logo-shell",
    )
    const shellCount = await partnerShells.count()
    if (shellCount === 0) {
      failures.push("partners strip has no .partner-logo-shell marks")
    }
    // Focus rings also use box-shadow — only fail on card fill + borders.
    for (let i = 0; i < shellCount; i++) {
      const chrome = await partnerShells.nth(i).evaluate((el) => {
        const s = getComputedStyle(el)
        const parseAlpha = (color) => {
          if (!color || color === "transparent") return 0
          const m = String(color).match(/rgba?\(([^)]+)\)/i)
          if (!m) return 1
          const parts = m[1].split(",").map((p) => p.trim())
          if (parts.length < 4) return 1
          return Number(parts[3])
        }
        return {
          className: el.className,
          bgAlpha: parseAlpha(s.backgroundColor),
          borderTop: Number.parseFloat(s.borderTopWidth) || 0,
          borderRight: Number.parseFloat(s.borderRightWidth) || 0,
          borderBottom: Number.parseFloat(s.borderBottomWidth) || 0,
          borderLeft: Number.parseFloat(s.borderLeftWidth) || 0,
        }
      })
      const hasBorder =
        chrome.borderTop > 0 ||
        chrome.borderRight > 0 ||
        chrome.borderBottom > 0 ||
        chrome.borderLeft > 0
      const classLooksLikeCard = /bg-card|border-border|shadow-md|partner-logo-chip/.test(
        chrome.className,
      )
      if (chrome.bgAlpha > 0.02 || hasBorder || classLooksLikeCard) {
        failures.push(
          `partner shell ${i} has card chrome (bgAlpha=${chrome.bgAlpha}, border=${hasBorder}, classCard=${classLooksLikeCard})`,
        )
        break
      }
    }
    const partners = page.locator('a[href*="partiful.com"], img[alt*="Partiful" i]')
    if ((await partners.count()) === 0) {
      failures.push("Partiful partner mark missing from home")
    }

    if (failures.length > 0) {
      throw new Error(`verify-will-home failed:\n- ${failures.join("\n- ")}`)
    }
    console.log("verify-will-home: ok")
  } finally {
    if (browser) await browser.close()
    server.kill("SIGTERM")
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
