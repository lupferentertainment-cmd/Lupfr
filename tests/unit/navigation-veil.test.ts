import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const globalsPath = path.join(rootDir, "app", "globals.css")
const navigationPath = path.join(rootDir, "components", "navigation.tsx")

describe("navigation header gradient veil", () => {
  const css = fs.readFileSync(globalsPath, "utf8")
  const navigation = fs.readFileSync(navigationPath, "utf8")

  it("uses a gradient veil state instead of a flat header background", () => {
    expect(navigation).toContain("lupfr-site-header")
    expect(navigation).toContain("data-lupfr-nav-state")
    expect(navigation).not.toContain("bg-background/60 dark:bg-background/50")
  })

  it("softens the fixed header edge with a masked gradient without backdrop blur", () => {
    expect(css).toContain(".lupfr-site-header::before")
    expect(css).toContain("mask-image: linear-gradient")
    expect(css).toContain("radial-gradient")
    expect(css).toContain("color-mix(in oklch, var(--background)")
    expect(css).not.toContain("backdrop-filter: blur")
    expect(css).toContain('[data-lupfr-nav-state="settled"]')
  })
})
