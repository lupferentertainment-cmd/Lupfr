import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const globalsPath = path.join(rootDir, "app", "globals.css")

/**
 * Guardrail: `app/globals.css` is the single source for LUPFR gold.
 * Intention: avoid regressions (e.g. dark “bronze/copper” vs agreed “white gold” light chroma on black).
 * When the palette is deliberately updated, change this file and `docs/DESIGN.md` together.
 */
describe("app/globals.css gold theme (canonical tokens)", () => {
  const css = fs.readFileSync(globalsPath, "utf8")

  it("reads globals.css from the repo", () => {
    expect(fs.existsSync(globalsPath), globalsPath).toBe(true)
  })

  it("keeps :root (light) main gold in a clean champagne family for headings/buttons", () => {
    const rootClose = css.indexOf("\n}\n\n.dark {")
    expect(rootClose).toBeGreaterThan(0)
    const rootBlock = css.slice(0, rootClose)
    expect(rootBlock).toContain("  --background: oklch(0.985 0.003 270);")
    expect(rootBlock).toContain("  --gold: oklch(0.66 0.10 80);")
    expect(rootBlock).toContain("  --btn-gold: oklch(0.65 0.11 80);")
    expect(rootBlock).toContain("  --entertainment-line-end: oklch(0.68 0.16 55);")
  })

  it("keeps .dark (white gold): cooler chroma, not legacy copper-bronze main --gold", () => {
    const darkMatch = css.match(/\.dark\s*\{[^]*?\n\}\n\n\/\*\n \* Corporate partner/s)
    expect(darkMatch?.[0], "expected .dark { … } before Corporate partner block").toBeDefined()
    const darkBlock = darkMatch![0]
    expect(darkBlock).toMatch(/white gold/i)
    expect(darkBlock).toContain("  --gold: oklch(0.68 0.08 80);")
    expect(darkBlock).not.toContain("  --gold: oklch(0.62 0.12 59);")
  })

  it("keeps hero LUPFR metallic shine (CSS + keyframes)", () => {
    expect(css).toContain("var(--gradient-hero-gold)")
    expect(css).toContain("drop-shadow(0 2px 4px oklch(0.28 0.08 82 / 0.6))")
    expect(css).toContain("@keyframes hero-shine-pass")
    expect(css).toContain("hero-gold-shine-periodic")
  })
})
