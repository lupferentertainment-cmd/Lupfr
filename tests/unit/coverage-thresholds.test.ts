/**
 * Locks the global Vitest coverage bar at 90% (statements/branches/functions/lines).
 * Owner request 2026-07-22: raise from the prior 80% floor.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const vitestConfig = fs.readFileSync(path.join(rootDir, "vitest.config.ts"), "utf8")

describe("coverage thresholds", () => {
  it("enforces >= 90% on statements, branches, functions, and lines", () => {
    expect(vitestConfig).toMatch(/statements:\s*90/)
    expect(vitestConfig).toMatch(/branches:\s*90/)
    expect(vitestConfig).toMatch(/functions:\s*90/)
    expect(vitestConfig).toMatch(/lines:\s*90/)
  })

  it("excludes the retired seaside landing from the global coverage denominator", () => {
    expect(vitestConfig).toContain("**/components/seaside/**")
  })
})
