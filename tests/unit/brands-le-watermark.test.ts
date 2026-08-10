/**
 * LE monogram watermark on /brands (owner note 2026-08-08: "dont miss the LE
 * logo in background of the corp structure").
 *
 * Ported from the design file's corporate-tree treatment: centred, ~4.5%
 * opacity, faintly blurred, sitting behind the portfolio.
 *
 * It is purely decorative, so the guardrails here are about it staying INERT —
 * a full-bleed absolutely-positioned image is exactly the kind of element that
 * silently swallows clicks or announces itself to screen readers.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const page = fs.readFileSync(path.join(rootDir, "app", "brands", "page.tsx"), "utf8")

describe("LE watermark behind the brands portfolio", () => {
  it("ships the optimized WebP asset", () => {
    expect(fs.existsSync(path.join(rootDir, "public", "images", "le-logo.webp"))).toBe(true)
    // The pipeline enforces WebP; a stray PNG would fail public-raster in CI.
    expect(fs.existsSync(path.join(rootDir, "public", "images", "le-logo.png"))).toBe(false)
  })

  it("renders the watermark on the brands page", () => {
    expect(page).toContain('src="/images/le-logo.webp"')
  })

  it("keeps it decorative — empty alt and hidden from assistive tech", () => {
    const img = /<Image[\s\S]*?le-logo\.webp[\s\S]*?\/>/.exec(page)?.[0] ?? ""
    expect(img).toContain('alt=""')
    expect(img).toContain("aria-hidden")
  })

  it("never intercepts clicks or text selection", () => {
    const img = /<Image[\s\S]*?le-logo\.webp[\s\S]*?\/>/.exec(page)?.[0] ?? ""
    expect(img).toContain("pointer-events-none")
    expect(img).toContain("select-none")
  })

  it("stays a background wash, not a visible logo", () => {
    const img = /<Image[\s\S]*?le-logo\.webp[\s\S]*?\/>/.exec(page)?.[0] ?? ""
    expect(img).toMatch(/opacity-\[0\.0\d+\]/)
  })

  it("does not compete with the hero for load priority", () => {
    const img = /<Image[\s\S]*?le-logo\.webp[\s\S]*?\/>/.exec(page)?.[0] ?? ""
    expect(img).toContain("priority={false}")
  })

  it("sits behind the content, which is explicitly stacked above it", () => {
    // The watermark is absolute inside a `relative` wrapper; the content column
    // must also be positioned, or it would render underneath the image.
    expect(page).toMatch(/className="relative px-4 pb-20 pt-32/)
    expect(page).toMatch(/className="relative mx-auto max-w-\[1400px\]"/)
  })
})
