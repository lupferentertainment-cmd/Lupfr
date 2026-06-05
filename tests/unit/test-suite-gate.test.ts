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
const verifyRoutesPath = path.join(rootDir, "scripts", "verify-routes.sh")
const vitestConfigPath = path.join(rootDir, "vitest.config.ts")

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as PackageJson
const ciScript = fs.readFileSync(ciScriptPath, "utf8")
const verifyRoutesScript = fs.readFileSync(verifyRoutesPath, "utf8")
const vitestConfig = fs.readFileSync(vitestConfigPath, "utf8")

describe("canonical test:suite gate", () => {
    it("delegates package test:suite to CI mode", () => {
        expect(packageJson.scripts["test:suite"]).toBe("bash scripts/ci.sh ci")
    })

    it("runs all Vitest tests through coverage", () => {
        expect(ciScript).toContain("bun run coverage")
    })

    it("keeps Vitest pointed at every test file", () => {
        expect(vitestConfig).toContain('include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]')
    })

    it("keeps the dynamic route and link QA inside the suite", () => {
        expect(ciScript).toContain("bun run verify:routes")
    })

    it("keeps browser runtime crawling inside the full suite", () => {
        expect(ciScript).toContain("bun run verify:console")
    })

    it("keeps gallery journey coverage in the focused gallery script", () => {
        expect(packageJson.scripts["test:gallery"]).toContain("tests/behavior/gallery-home-journey.test.ts")
    })

    it("keeps external-link extraction inside route verification", () => {
        expect(verifyRoutesScript).toContain("extract_external_links")
    })

    it("keeps external-link health checks inside route verification", () => {
        expect(verifyRoutesScript).toContain("verify_external_links")
    })
})
