/**
 * Playwright edge-case gate for the operator admin portal.
 * Starts the built server with test-only ADMIN_* secrets, then asserts:
 * login gate, failed login, successful dashboard smoke, export 401/200.
 *
 * Run: bun scripts/verify-admin.mjs
 * Wired into `bun run test` / `bun run ci` browser checks (skipped on Vercel
 * via LUPFR_SKIP_BROWSER_CHECK=1, same as other Playwright gates).
 */
import { spawn } from "node:child_process"
import process from "node:process"
import { chromium } from "playwright"

const PORT = Number(process.env.VERIFY_ADMIN_PORT ?? 4396)
// Use localhost (not 127.0.0.1): next start sets Secure cookies in production
// NODE_ENV, and Chromium will store Secure cookies on http://localhost only.
const BASE = `http://localhost:${PORT}`
const READY_TIMEOUT_MS = 60000
const NAV_TIMEOUT_MS = 30000

/** Test-only credentials — never production secrets. */
const TEST_USERNAME = "will@lupfr.com"
const TEST_PASSWORD = "lupfr-admin-test-password-ci-only"
const TEST_SESSION_SECRET = "lupfr-admin-test-session-secret-32b-min!!"

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function _spawn_server() {
  return spawn("bun", ["run", "_serve", "--", "-p", String(PORT)], {
    stdio: ["ignore", "ignore", "inherit"],
    env: {
      ...process.env,
      ADMIN_USERNAME: TEST_USERNAME,
      ADMIN_PASSWORD: TEST_PASSWORD,
      ADMIN_SESSION_SECRET: TEST_SESSION_SECRET,
    },
  })
}

async function _ping() {
  try {
    const res = await fetch(`${BASE}/admin/login`)
    return res.status === 200 || res.status === 307 || res.status === 308
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
  throw new Error("verify-admin: server did not become ready")
}

async function main() {
  if (Buffer.byteLength(TEST_SESSION_SECRET, "utf8") < 32) {
    throw new Error("verify-admin: TEST_SESSION_SECRET must be ≥32 bytes")
  }

  const server = _spawn_server()
  let browser
  const failures = []
  try {
    await _wait_ready()
    browser = await chromium.launch({ headless: true })
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    page.setDefaultTimeout(NAV_TIMEOUT_MS)

    // Unauthenticated /admin should land on login (redirect or login UI).
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" })
    await page.waitForURL(/\/admin\/login/, { timeout: NAV_TIMEOUT_MS }).catch(() => {})
    const pageText = await page.locator("body").innerText().catch(() => "")
    if (/Admin unavailable/i.test(pageText)) {
      throw new Error(
        "verify-admin: server did not see ADMIN_* test secrets (got Admin unavailable). " +
          "Ensure lib/admin-auth reads env dynamically and spawn env is passed to next start.",
      )
    }
    const loginHeading = page.getByRole("heading", { name: /Sign in/i })
    try {
      await loginHeading.waitFor({ state: "visible", timeout: 10000 })
    } catch {
      failures.push(`unauthenticated /admin did not show Sign in (url=${page.url()})`)
    }
    const form = page.getByTestId("admin-login-form")
    try {
      await form.waitFor({ state: "visible", timeout: 10000 })
    } catch {
      failures.push("admin login form missing")
    }
    if (failures.length > 0) {
      throw new Error(`verify-admin: login gate failed early:\n- ${failures.join("\n- ")}`)
    }

    // Failed login stays on login with alert.
    await page.locator('input[name="password"]').fill("wrong-password-not-real")
    await page.getByRole("button", { name: /Sign in/i }).click()
    try {
      await page.getByRole("alert").waitFor({ state: "visible", timeout: 10000 })
    } catch {
      failures.push("wrong password did not show alert")
    }
    if (!page.url().includes("/admin/login")) {
      failures.push("wrong password left the login page")
    }

    // Export without session → 401
    const unauthExport = await page.request.get(`${BASE}/admin/api/export/events`)
    if (unauthExport.status() !== 401) {
      failures.push(`export without session expected 401, got ${unauthExport.status()}`)
    }

    // Successful login → dashboard smoke
    await page.locator('input[name="password"]').fill(TEST_PASSWORD)
    await page.getByRole("button", { name: /Sign in/i }).click()
    try {
      await page.waitForURL(/\/admin\/?$/, { timeout: NAV_TIMEOUT_MS })
    } catch {
      failures.push(`login did not reach /admin (url=${page.url()})`)
    }
    try {
      await page.getByRole("heading", { name: /Website traffic/i }).waitFor({
        state: "visible",
        timeout: 15000,
      })
    } catch {
      failures.push("dashboard missing Website traffic heading")
    }
    if ((await page.getByRole("link", { name: /Open Vercel Analytics/i }).count()) === 0) {
      failures.push("dashboard missing Vercel Analytics CTA")
    }

    // Authenticated export → 200 CSV
    const authExport = await page.request.get(`${BASE}/admin/api/export/events`)
    if (authExport.status() !== 200) {
      failures.push(`export with session expected 200, got ${authExport.status()}`)
    } else {
      const ctype = authExport.headers()["content-type"] ?? ""
      if (!ctype.includes("text/csv")) {
        failures.push(`export content-type expected text/csv, got ${ctype}`)
      }
    }

    if (failures.length > 0) {
      console.error("verify-admin: FAILED")
      for (const f of failures) console.error(`  - ${f}`)
      throw new Error(`verify-admin failed (${failures.length} check(s))`)
    }
    console.log("verify-admin: OK  login gate + dashboard + export auth")
  } finally {
    if (browser) await browser.close().catch(() => {})
    if (server.pid) {
      try {
        process.kill(server.pid, "SIGTERM")
      } catch {
        /* already exited */
      }
      await new Promise((resolve) => server.once("exit", resolve))
    }
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
