/**
 * Media Hub brand pills (owner report 2026-08-08: "make sure the // is themed
 * properly and all the pills are themed properly").
 *
 * Two defects this locks down, both visible on the OUT // SIDE tab:
 *
 *   1. The selected pill paints the brand accent as its background, but
 *      `BrandSlashText` defaults its "//" to `var(--gold)`. Gold on a light
 *      pastel accent is nearly invisible.
 *   2. The selected pill used `text-background` for its label. In DARK mode
 *      that reads as near-black and looks fine, but `--background` in LIGHT
 *      mode is `#f0f0ed` — near-white text on a near-white pill.
 *
 * Both are fixed by painting the selected pill with a fixed dark ink and
 * letting the divider inherit it via `currentColor`.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { getBrands } from "@/lib/data/brands"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const mediaHub = fs.readFileSync(path.join(rootDir, "components", "media-hub.tsx"), "utf8")

/** WCAG relative luminance, 0 (black) → 1 (white). */
function luminance(hex: string): number {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = Number.parseInt(full.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const ON_ACCENT_INK =
  /ON_ACCENT_INK\s*=\s*"(#[0-9a-fA-F]{3,6})"/.exec(mediaHub)?.[1] ?? ""

describe("selected media-hub pill stays legible", () => {
  it("defines a fixed on-accent ink rather than a theme token", () => {
    expect(ON_ACCENT_INK).toMatch(/^#[0-9a-fA-F]{6}$/)
    // `text-background` flips with the theme and broke light mode.
    expect(mediaHub).not.toMatch(/selected\s*\?\s*"text-background"/)
  })

  it("uses that ink for the selected pill label", () => {
    expect(mediaHub).toContain("color: ON_ACCENT_INK")
  })

  /**
   * The real guard: the fixed ink is only correct because every brand accent is
   * a light pastel. If a dark accent is ever added, this fails loudly instead of
   * shipping an unreadable pill.
   */
  it("keeps every brand accent light enough for the dark ink (WCAG AA, 4.5:1)", () => {
    for (const brand of getBrands()) {
      const ratio = contrastRatio(brand.accent, ON_ACCENT_INK)
      expect(
        ratio,
        `${brand.title} accent ${brand.accent} only reaches ${ratio.toFixed(2)}:1 ` +
          `against the pill ink ${ON_ACCENT_INK}. Either lighten the accent or ` +
          `switch the selected pill to a per-brand computed ink.`
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  it("passes currentColor to the divider on the selected pill so it is not gold", () => {
    // Gold on a light accent is the exact defect the owner reported.
    expect(mediaHub).toMatch(
      /<BrandSlashText[^>]*color=\{selected \? "currentColor" : undefined\}/
    )
  })

  it("leaves the unselected pills on the standard gold divider", () => {
    // Unselected pills sit on `bg-card`, where the themed gold token is correct
    // in both light and dark mode — only the selected pill needed overriding.
    expect(mediaHub).toContain('border-border bg-card text-muted-foreground')
  })
})
