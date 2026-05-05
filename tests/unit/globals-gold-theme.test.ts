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
    expect(rootBlock).toContain("  --background: oklch(0.989 0.004 255);")
    expect(rootBlock).toContain("  --foreground: oklch(0.145 0.024 272);")
    expect(rootBlock).toContain("  --gold: oklch(0.635 0.085 82);")
    expect(rootBlock).toContain("  --btn-gold: oklch(0.69 0.12 82);")
    expect(rootBlock).toContain("  --gradient-heading-gold: linear-gradient(90deg,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-shadow) 88%, black) 0%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-specular) 74%, var(--gold-bright)) 42%,")
    expect(rootBlock).toContain("  --entertainment-line-end: oklch(0.66 0.13 68);")
    expect(css).toContain("html:not(.dark) body")
  })

  it("keeps .dark (white gold): locked black-mode metal, not legacy copper-bronze", () => {
    const darkMatch = css.match(/\.dark\s*\{[\s\S]*?\n\}\n\n\/\*\n \* Corporate partner/)
    expect(darkMatch?.[0], "expected .dark { … } before Corporate partner block").toBeDefined()
    const darkBlock = darkMatch![0]
    expect(darkBlock).toMatch(/white gold/i)
    expect(darkBlock).toContain("  --gold-shadow: oklch(0.50 0.06 75);")
    expect(darkBlock).toContain("  --gold-dark: oklch(0.62 0.07 78);")
    expect(darkBlock).toContain("  --gold: oklch(0.68 0.08 80);")
    expect(darkBlock).toContain("  --gold-bright: oklch(0.86 0.06 82);")
    expect(darkBlock).toContain("  --gold-specular: oklch(0.94 0.04 84);")
    expect(darkBlock).toContain("  --btn-gold: oklch(0.65 0.07 72);")
    expect(darkBlock).toContain("  --gradient-heading-gold: linear-gradient(90deg,")
    expect(darkBlock).toContain("      var(--gold-shadow) 0%,")
    expect(darkBlock).toContain("      var(--gold-specular) 42%,")
    expect(darkBlock).not.toContain("  --gold: oklch(0.62 0.12 59);")
  })

  it("keeps hero LUPFR metallic shine (CSS + keyframes)", () => {
    expect(css).toContain("var(--gradient-hero-gold)")
    expect(css).toContain("background: var(--gradient-heading-gold);")
    expect(css).toContain("drop-shadow(0 4px 16px oklch(0.24 0.07 78 / 0.62))")
    expect(css).toContain(".lupfr-hero .heading-metallic-gold")
    expect(css).toContain("@keyframes hero-shine-pass")
    expect(css).toContain("hero-gold-shine-periodic")
  })
})
