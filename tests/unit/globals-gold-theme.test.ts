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
 *
 * Phase 23 (owner directive, 2026-07-17): the previous "cool off-white / pure
 * black ink" :root palette is superseded by the comp's own warm cream/ink
 * palette (`LUPFR Restructure.dc.html`'s `themes.B` object) — owner explicitly
 * and repeatedly directed abandoning the old base surface tones in favor of
 * the comp's exact values, the same kind of authorization that earlier
 * unlocked the hero-tagline and card-radius contracts.
 */
describe("app/globals.css gold theme (canonical tokens)", () => {
  const css = fs.readFileSync(globalsPath, "utf8")

  it("reads globals.css from the repo", () => {
    expect(fs.existsSync(globalsPath), globalsPath).toBe(true)
  })

  it("keeps :root (light) as the comp's warm cream/ink surface with bronzed luxe gold for headings/buttons (phase 23)", () => {
    const rootClose = css.indexOf("\n}\n\n.dark {")
    expect(rootClose).toBeGreaterThan(0)
    const rootBlock = css.slice(0, rootClose)
    // Warm cream background/card, warm ink foreground — matches the comp's themes.B exactly
    expect(rootBlock).toContain("  --background: #faf7f0;")
    expect(rootBlock).toContain("  --foreground: #1c1710;")
    expect(rootBlock).toContain("  --card: #ffffff;")
    expect(rootBlock).toContain("  --card-foreground: #1c1710;")
    expect(rootBlock).toContain("  --popover: #ffffff;")
    expect(rootBlock).toContain("  --popover-foreground: #1c1710;")
    expect(rootBlock).toContain("  --secondary: rgba(20,16,8,0.04);")
    expect(rootBlock).toContain("  --muted: oklch(0.942 0.006 255);")
    expect(rootBlock).toContain("  --muted-foreground: #5a5346;")
    // Comp's translucent ink-on-cream border overlay
    expect(rootBlock).toContain("  --border: rgba(20,16,8,0.10);")
    // Bronzed luxe gold (less bright/glary, keeps shine)
    expect(rootBlock).toContain("  --gold: oklch(0.55 0.13 76);")
    expect(rootBlock).toContain("  --gold-shadow: oklch(0.34 0.08 72);")
    expect(rootBlock).toContain("  --gold-dark: oklch(0.45 0.11 74);")
    expect(rootBlock).toContain("  --gold-bright: oklch(0.7 0.105 80);")
    expect(rootBlock).toContain("  --gold-specular: oklch(0.85 0.05 86);")
    expect(rootBlock).toContain("  --btn-gold: oklch(0.56 0.13 77);")
    expect(rootBlock).toContain("  --btn-gold-shadow: oklch(0.36 0.09 73);")
    expect(rootBlock).toContain("  --btn-gold-dark: oklch(0.46 0.12 75);")
    expect(rootBlock).toContain("  --btn-gold-bright: oklch(0.7 0.105 80);")
    expect(rootBlock).toContain("  --btn-gold-specular: oklch(0.85 0.05 86);")
    expect(rootBlock).toContain("  --gradient-heading-gold: linear-gradient(90deg,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-shadow) 96%, black) 0%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold) 82%, var(--gold-dark)) 27%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-specular) 70%, var(--gold-bright)) 42%,")
    expect(rootBlock).toContain("      color-mix(in oklch, var(--gold-shadow) 96%, black) 100%);")
    expect(rootBlock).toContain("  --lupfr-heading-subline-fg: oklch(0 0 0);")
    // Body uses the --background token directly — no separate gold wash layered on top
    expect(css).toContain("html:not(.dark) body")
    expect(css).toContain("  html:not(.dark) body {\n    background: var(--background);")
    expect(rootBlock).not.toContain("  --background: oklch(0.974 0.005 255);")
    expect(rootBlock).not.toContain("  --background: oklch(1 0 0);")
    expect(rootBlock).not.toContain("  --gold: oklch(0.69 0.14 82);")
    expect(rootBlock).not.toContain("  --gold: oklch(0.64 0.17 82);")
    expect(rootBlock).not.toContain("  --gold: oklch(0.58 0.15 80);")
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

  it("heading subline second line is theme foreground (white) in dark mode", () => {
    const darkMatch = css.match(/\.dark\s*\{[\s\S]*?\n\}\n\n\/\*\n \* Corporate partner/)
    expect(darkMatch![0]).toContain("  --lupfr-heading-subline-fg: var(--foreground);")
  })

  it("keeps hero LUPFR metallic shine (CSS + keyframes)", () => {
    expect(css).toContain("var(--gradient-hero-gold)")
    expect(css).toContain("background: var(--gradient-heading-gold);")
    expect(css).toContain("filter: drop-shadow(0 1px 2px var(--gold-filter-shadow));")
    expect(css).toContain(".lupfr-hero .heading-metallic-gold")
    expect(css).toContain("hero-gold-shine-stable")
    expect(css).not.toContain("@keyframes hero-shine-pass")
    expect(css).not.toContain("hero-gold-shine-periodic")
  })
})
