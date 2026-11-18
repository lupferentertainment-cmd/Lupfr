import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

/**
 * Oct 1 2026 homepage redesign (owner table: "The changes I want are ...").
 * Source-string lock on home-page.tsx so a future edit can't silently widen
 * or narrow the redesign's scope: Navbar/Hero/News/Brands/Events/Services/
 * Artists/Team must stay on the new claude-home-*.tsx sibling components;
 * Partners/About/Follow the Momentum/Contact/Footer must stay untouched.
 *
 * Plain .test.ts (not .test.tsx) on purpose: vitest.config.ts's
 * environmentMatchGlobs forces happy-dom on every *.test.tsx file, and the
 * node:fs read below crashes under happy-dom on Vercel's build machine
 * ("No such built-in module: node:") even though it's fine under Node. See
 * tests/components/homepage-redesign.behavior.test.tsx (the render/
 * interaction contracts for these same sections) for why this split exists,
 * and tests/unit/home-performance.test.ts / tests/unit/look-and-feel.test.ts
 * for the same fs-read pattern already in use here.
 */
describe("home-page.tsx scope lock (owner table, 2026-10-01)", () => {
  const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
  const homePage = fs.readFileSync(path.join(rootDir, "components", "home-page.tsx"), "utf8")

  it("swaps in the new design for every NEW section", () => {
    expect(homePage).toContain('import { ClaudeHomeNavigation as Navigation } from "@/components/claude-home-navigation"')
    expect(homePage).toContain('import { ClaudeHomeHero as Hero } from "@/components/claude-home-hero"')
    expect(homePage).toContain('import { ClaudeHomeServices as Services } from "@/components/claude-home-services"')
    expect(homePage).toContain('import { ClaudeHomeExperiences as Events } from "@/components/claude-home-experiences"')
    expect(homePage).toContain('import { ClaudeHomeBrands as Brands } from "@/components/claude-home-brands"')
    // Round 16: Media & News moved to /media.
    expect(homePage).not.toContain("claude-home-media")
    // Round 16: Past Artists moved to /about.
    expect(homePage).not.toContain("claude-home-artists")
    // 2026-11-17: Our Team + the Partiful band moved to /about (see the next test).
    expect(homePage).not.toContain("claude-home-crew")
    expect(homePage).not.toContain("claude-home-partiful-band")
  })

  it("no longer mounts the standalone Founders section", () => {
    expect(homePage).not.toContain("claude-home-team")
    expect(homePage).not.toContain("ClaudeHomeTeam")
    expect(homePage).not.toContain('id="crew"')
  })

  it("mounts About, Our Team and the Partiful band on /about (in that order), not on the home page", () => {
    const aboutPage = fs.readFileSync(path.join(rootDir, "app", "about", "page.tsx"), "utf8")
    const about = aboutPage.indexOf("<About />")
    const team = aboutPage.indexOf("<ClaudeHomeCrew />")
    const band = aboutPage.indexOf("<ClaudeHomePartifulBand />")
    const footer = aboutPage.indexOf("<Footer />")
    expect(about).toBeGreaterThan(-1)
    expect(team).toBeGreaterThan(about)
    expect(band).toBeGreaterThan(team)
    expect(footer).toBeGreaterThan(band)
    expect(homePage).not.toContain("<Team />")
    expect(homePage).not.toContain("<PartifulBand />")
    expect(homePage).toContain('<DeferredHomeSection id="contact"')
  })

  it("leaves every CURRENT section on its original component", () => {
    expect(homePage).toContain('import { PartnersStrip } from "@/components/partners-strip"')
    expect(homePage).toContain('import { FollowTheMomentum } from "@/components/follow-the-momentum"')
    expect(homePage).not.toContain("@/components/about")
    // v5 (2026-11-17): the Contact wizard was replaced by the Start Planning intake on #contact.
    expect(homePage).toMatch(/import\("@\/components\/start-planning"\)/)
    expect(homePage).not.toMatch(/components\/contact"/)
    expect(homePage).toMatch(/import\("@\/components\/footer"\)/)
    expect(homePage).toContain("<LayloEmbed />")
  })
})
