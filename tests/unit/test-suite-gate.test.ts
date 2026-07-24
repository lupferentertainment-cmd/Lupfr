import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

type PackageJson = {
    scripts: Record<string, string>
}

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const packageJsonPath = path.join(rootDir, "package.json")
const ciScriptPath = path.join(rootDir, "scripts", "ci.sh")
const shipDevPath = path.join(rootDir, "scripts", "ship-dev.sh")
const promoteProdPath = path.join(rootDir, "scripts", "promote-prod.sh")
const verifyRoutesPath = path.join(rootDir, "scripts", "verify-routes.sh")
const verifyConsolePath = path.join(rootDir, "scripts", "verify-console.mjs")
const mobileBudgetsPath = path.join(rootDir, "tests", "performance", "mobile-budgets.json")
const vercelConfigPath = path.join(rootDir, "vercel.json")
const vitestConfigPath = path.join(rootDir, "vitest.config.ts")

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson
const ciScript = fs.readFileSync(ciScriptPath, "utf8")
const shipDevScript = fs.readFileSync(shipDevPath, "utf8")
const promoteProdScript = fs.readFileSync(promoteProdPath, "utf8")
const verifyRoutesScript = fs.readFileSync(verifyRoutesPath, "utf8")
const verifyConsoleScript = fs.readFileSync(verifyConsolePath, "utf8")
const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8")) as {
    buildCommand: string
    installCommand: string
}
const vitestConfig = fs.readFileSync(vitestConfigPath, "utf8")

describe("canonical package workflow gate", () => {
    it("keeps package test as the full CI gate", () => {
        expect(packageJson.scripts.test).toBe("bash scripts/ci.sh ci")
    })

    it("keeps package smoke as the fast gate", () => {
        expect(packageJson.scripts.smoke).toBe("bash scripts/ci.sh verify")
    })

    it("keeps the production server command build-first", () => {
        expect(packageJson.scripts.start).toBe("bun run _build && bun run _serve")
    })

    it("keeps CI delegated to the same test command", () => {
        expect(packageJson.scripts.ci).toBe("bun run test")
    })

    it("keeps smoke tests as an explicit fast-fail subset", () => {
        expect(packageJson.scripts["_test:smoke"]).toContain("tests/unit/test-suite-gate.test.ts")
    })

    it("keeps staging shipment gated by the full suite", () => {
        expect(shipDevScript).toContain("bun run test")
    })

    it("keeps production promotion gated by the full suite", () => {
        expect(promoteProdScript).toContain("bun run test")
    })

    it("pins the production gate to the exact origin/dev commit", () => {
        expect(promoteProdScript).toContain('"$(git rev-parse HEAD)" != "$(git rev-parse origin/dev)"')
    })

    it("warns that protected previews are not public SEO audit targets", () => {
        expect(shipDevScript).toContain("SEO/Lighthouse audits on protected previews")
    })

    it("runs the Vitest + route/asset gate on Vercel before the deploy build", () => {
        // Vercel cannot install Chromium OS libs (libnspr4) — skip Playwright there only.
        // Local / pre-commit / GitHub Actions still run the full browser suite.
        expect(vercelConfig.buildCommand).toBe("LUPFR_SKIP_BROWSER_CHECK=1 bun run test && bun run _build")
        expect(vercelConfig.buildCommand).toContain("LUPFR_SKIP_BROWSER_CHECK=1")
        expect(vercelConfig.buildCommand).not.toContain("LUPFR_SKIP_ROUTE_CHECK")
        expect(vercelConfig.installCommand).toBe("bun install")
        expect(fs.existsSync(path.join(rootDir, "scripts", "install-playwright-chromium.sh"))).toBe(true)
    })

    it("runs all Vitest tests through coverage", () => {
        expect(ciScript).toContain("bun run _coverage")
    })

    it("runs the smoke subset before the full coverage pass", () => {
        expect(ciScript).toContain("bun run _test:smoke\nrun_static_quality")
    })

    it("runs lint before the full coverage pass", () => {
        expect(ciScript).toContain("bun run _lint\n  if [[ \"$MODE\" == \"ci\" ]]")
    })

    it("keeps Vitest workers configurable from the CI shell", () => {
        expect(ciScript).toContain('VITEST_MAX_WORKERS="${VITEST_MAX_WORKERS:-50%}"')
    })

    it("keeps Vitest pointed at every test file", () => {
        expect(vitestConfig).toContain('include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]')
    })

    it("keeps Vitest worker count environment-driven", () => {
        expect(vitestConfig).toContain("process.env.VITEST_MAX_WORKERS")
    })

    it("keeps the dynamic route and link QA inside the suite", () => {
        expect(ciScript).toContain("bun run _verify:routes")
    })

    it("keeps the asset crawl inside the full suite", () => {
        expect(ciScript).toContain("tests/integration/asset-crawl.test.ts")
    })

    it("keeps browser runtime crawling inside the full suite", () => {
        expect(ciScript).toContain("bun run _verify:console")
    })

    it("keeps the First Load JS bundle-budget gate inside the build checks", () => {
        expect(ciScript).toContain("bun run _verify:bundle-budget")
        expect(packageJson.scripts["_verify:bundle-budget"]).toBe(
            "bun scripts/verify-bundle-budget.mjs"
        )
    })

    it("keeps the mobile runtime performance gate inside the browser checks", () => {
        expect(ciScript).toContain("bun run _verify:mobile-perf")
        expect(packageJson.scripts["_verify:mobile-perf"]).toBe(
            "bun scripts/verify-mobile-perf.mjs"
        )
    })

    it("keeps the Will homepage Playwright edge-case gate inside browser checks", () => {
        expect(ciScript).toContain("bun run _verify:will-home")
        expect(packageJson.scripts["_verify:will-home"]).toBe(
            "bun scripts/verify-will-home.mjs"
        )
        const willHome = fs.readFileSync(
            path.join(rootDir, "scripts", "verify-will-home.mjs"),
            "utf8",
        )
        // Canonical freeform partners contract — no card tiles on the marquee.
        expect(willHome).toContain('data-partners-chrome')
        expect(willHome).toContain("partner-logo-chip")
        expect(willHome).toContain("partner-logo-shell")
        expect(willHome).toContain("bgAlpha")
    })

    it("keeps the admin portal Playwright edge-case gate inside browser checks", () => {
        expect(ciScript).toContain("bun run _verify:admin")
        expect(packageJson.scripts["_verify:admin"]).toBe("bun scripts/verify-admin.mjs")
        const adminGate = fs.readFileSync(
            path.join(rootDir, "scripts", "verify-admin.mjs"),
            "utf8",
        )
        expect(adminGate).toContain("admin-login-form")
        expect(adminGate).toContain("/admin/api/export/events")
        expect(adminGate).toContain("TEST_SESSION_SECRET")
        expect(adminGate).toContain("ADMIN_PASSWORD")
        expect(ciScript).toContain("VERIFY_ADMIN_PORT")
    })

    it("enforces 90% Vitest coverage thresholds", () => {
        expect(vitestConfig).toMatch(/statements:\s*90/)
        expect(vitestConfig).toMatch(/branches:\s*90/)
        expect(vitestConfig).toMatch(/functions:\s*90/)
        expect(vitestConfig).toMatch(/lines:\s*90/)
    })

    it("keeps mobile performance budgets on disk", () => {
        expect(fs.existsSync(mobileBudgetsPath)).toBe(true)
    })

    it("keeps external-link extraction inside route verification", () => {
        expect(verifyRoutesScript).toContain("extract_external_links")
    })

    it("keeps external-link health checks inside route verification", () => {
        expect(verifyRoutesScript).toContain("verify_external_links")
    })
    it("keeps blocked heavy assets from failing browser console crawl", () => {
        expect(verifyConsoleScript).toContain("_is_resource_console_noise")
    })
})
