import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const globalsPath = path.join(rootDir, "app", "globals.css")

/**
 * Guardrail: `app/globals.css` is the single source for LUPFR gold.
 * Intention: avoid regressions (e.g. dark “bronze/copper” vs agreed “white gold” light chroma on black).
 * When the palette is deliberately updated, change this file, `docs/DESIGN.md`, and `docs/TESTING.md` together.
 */
describe("app/globals.css gold theme (canonical tokens)", () => {
  const css = fs.readFileSync(globalsPath, "utf8")

  it("reads globals.css from the repo", () => {
    expect(fs.existsSync(globalsPath), globalsPath).toBe(true)
  })

  it("keeps :root (light) main gold in a pristine white luxury family for headings/buttons", () => {
    const rootClose = css.indexOf("\n}\n\n.dark {")
    expect(rootClose).toBeGreaterThan(0)
    const rootBlock = css.slice(0, rootClose)
    expect(rootBlock).toContain("  --background: oklch(1 0 0);")
    expect(rootBlock).toContain("  --foreground: oklch(0.11 0.016 265);")
    expect(rootBlock).toContain("  --card: oklch(1 0 0);")
    expect(rootBlock).toContain("  --card-foreground: oklch(0.11 0.016 265);")
    expect(rootBlock).toContain("  --popover: oklch(1 0 0);")
    expect(rootBlock).toContain("  --secondary: oklch(0.972 0.004 98);")
    expect(rootBlock).toContain("  --muted: oklch(0.952 0.006 96);")
    expect(rootBlock).toContain("  --muted-foreground: oklch(0.34 0.02 262);")
    expect(rootBlock).toContain("  --border: oklch(0.875 0.014 95);")
    expect(rootBlock).toContain("  --gold: oklch(0.64 0.17 82);")
    expect(rootBlock).toContain("  --gold-shadow: oklch(0.36 0.085 74);")
    expect(rootBlock).toContain("  --gold-dark: oklch(0.5 0.13 77);")
    expect(rootBlock).toContain("  --gold-bright: oklch(0.84 0.13 88);")
    expect(rootBlock).toContain("  --gold-specular: oklch(0.985 0.026 96);")
    expect(rootBlock).toContain("  --btn-gold: oklch(0.62 0.17 82);")
    expect(rootBlock).toContain("  --btn-gold-shadow: oklch(0.38 0.1 75);")
    expect(rootBlock).toContain("  --btn-gold-dark: oklch(0.51 0.14 78);")
    expect(rootBlock).toContain("  --btn-gold-bright: oklch(0.82 0.13 88);")
    expect(rootBlock).toContain("  --btn-gold-specular: oklch(0.985 0.026 96);")
    expect(rootBlock).toContain("  --gradient-heading-gold: linear-gradient(90deg,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-shadow) 96%, black) 0%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold) 82%, var(--gold-dark)) 27%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-specular) 70%, var(--gold-bright)) 42%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-shadow) 96%, black) 100%);")
    expect(rootBlock).toContain("  --lupfr-heading-subline-fg: oklch(0.31 0.02 262);")
    expect(rootBlock).toContain("  --entertainment-line-start: oklch(0.985 0.018 95);")
    expect(rootBlock).toContain("  --entertainment-line-mid: oklch(0.84 0.14 84);")
    expect(rootBlock).toContain("  --entertainment-line-end: oklch(0.58 0.17 70);")
    expect(css).toContain("html:not(.dark) body")
    expect(css).toContain("oklch(1 0 0) 0%")
    expect(rootBlock).not.toContain("  --background: oklch(0.996 0.001 95);")
    expect(rootBlock).not.toContain("  --gold: oklch(0.69 0.14 82);")
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
