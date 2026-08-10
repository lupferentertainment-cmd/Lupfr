/**
 * Navigation contrast on subpages (found 2026-08-08 while fixing the Media Hub
 * pills; visible as a washed-out nav on /media in light mode).
 *
 * The transparent white-on-video nav treatment is only correct while the bar
 * sits over the home hero. The old rule keyed purely off scroll position:
 *
 *     isScrolled ? "text-foreground/90" : "text-white/90"
 *
 * On any subpage the top of the document is `--background` — `#f0f0ed` in light
 * mode — so an unscrolled /media, /events, /artists … rendered white links on a
 * near-white page. Dark mode hid the bug entirely, which is why it survived.
 *
 * The treatment is now gated on `overHero = isHome && !isScrolled && !isOpen`.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const nav = fs.readFileSync(path.join(rootDir, "components", "navigation.tsx"), "utf8")
const css = fs.readFileSync(path.join(rootDir, "app", "globals.css"), "utf8")

describe("nav hero treatment is scoped to the home hero", () => {
  it("derives an explicit overHero flag from isHome, not scroll alone", () => {
    expect(nav).toMatch(/const overHero = isHome && !isScrolled && !isOpen/)
  })

  it("never keys a white text colour off isScrolled alone", () => {
    // The exact shape of the original defect.
    expect(nav).not.toMatch(/isScrolled\s*\n?\s*\?\s*"text-foreground\/90[^"]*"\s*\n?\s*:\s*"text-white/)
    expect(nav).not.toMatch(/\$\{isScrolled\s*\n?\s*\?\s*"text-foreground"\s*\n?\s*:\s*"text-white"/)
  })

  it("gates every white-on-hero affordance on overHero", () => {
    // Desktop links, the mobile menu trigger, and the schedule CTA tone all
    // flip together — a partial fix leaves one element invisible.
    //
    // Comments are stripped first: this file documents the original
    // `!isScrolled → text-white` defect in prose, and scanning raw source
    // matches that explanation as if it were live code.
    const code = nav.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")

    const whiteUses = [...code.matchAll(/text-white/g)]
    expect(whiteUses.length).toBeGreaterThan(0)
    for (const m of whiteUses) {
      const window = code.slice(Math.max(0, m.index - 220), m.index)
      expect(
        /overHero/.test(window),
        `a "text-white" at index ${m.index} is not gated on overHero — ` +
          `it will render white text on a light subpage background`
      ).toBe(true)
    }
  })

  it("marks the header settled whenever it is not over the hero", () => {
    expect(nav).toContain('data-lupfr-nav-state={overHero ? "hero" : "settled"}')
  })

  it("still styles the settled header with a real surface, so links have something to sit on", () => {
    expect(css).toMatch(/\[data-lupfr-nav-state="settled"\]/)
  })
})
