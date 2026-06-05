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

    it("runs all Vitest tests through coverage", () => {
        expect(ciScript).toContain("bun run _coverage")
    })

    it("keeps Vitest pointed at every test file", () => {
        expect(vitestConfig).toContain('include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]')
    })

    it("keeps the dynamic route and link QA inside the suite", () => {
        expect(ciScript).toContain("bun run _verify:routes")
    })

    it("keeps browser runtime crawling inside the full suite", () => {
        expect(ciScript).toContain("bun run _verify:console")
    })

    it("keeps external-link extraction inside route verification", () => {
        expect(verifyRoutesScript).toContain("extract_external_links")
    })

    it("keeps external-link health checks inside route verification", () => {
        expect(verifyRoutesScript).toContain("verify_external_links")
    })
})
