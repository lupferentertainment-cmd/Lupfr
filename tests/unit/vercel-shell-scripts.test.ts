import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const scriptsDir = path.join(rootDir, "scripts")

const VERCEL_SCRIPTS = [
  "vercel-env-check.sh",
  "vercel-preview-deploy.sh",
  "vercel-deploy-prod-from-tag.sh",
] as const

describe("Vercel helper shell scripts", () => {
  it("exist and are valid bash (bash -n)", () => {
    for (const name of VERCEL_SCRIPTS) {
      const filePath = path.join(scriptsDir, name)
      expect(fs.existsSync(filePath), `${name} should exist`).toBe(true)
      expect(() => {
        execFileSync("bash", ["-n", filePath], { stdio: "pipe" })
      }, `${name} should parse with bash -n`).not.toThrow()
    }
  })
})
