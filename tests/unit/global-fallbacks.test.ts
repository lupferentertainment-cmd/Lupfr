import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const globalErrorPath = path.join(rootDir, "app", "global-error.tsx")
const globalNotFoundPath = path.join(rootDir, "app", "global-not-found.tsx")
const globalError = fs.readFileSync(globalErrorPath, "utf8")
const globalNotFound = fs.readFileSync(globalNotFoundPath, "utf8")

describe("global document fallbacks", () => {
  it("keeps global 404 as a complete document", () => {
    expect(globalNotFound).toContain('<html lang="en" className="dark">')
  })

  it("keeps global 404 off next link", () => {
    expect(globalNotFound).not.toContain("next/link")
  })

  it("keeps global 404 from re-exporting routed not found", () => {
    expect(globalNotFound).not.toContain('export { default } from "./not-found"')
  })

  it("keeps global error off next link", () => {
    expect(globalError).not.toContain("next/link")
  })
})
