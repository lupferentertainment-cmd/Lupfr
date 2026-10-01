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
    expect(homePage).toContain('import { ClaudeHomeMedia as News } from "@/components/claude-home-media"')
    expect(homePage).toContain('import { ClaudeHomeArtists as Artists } from "@/components/claude-home-artists"')
    expect(homePage).toMatch(/import\("@\/components\/claude-home-team"\)/)
    expect(homePage).toContain('resolveDynamicComponent(m, "ClaudeHomeTeam", "@/components/claude-home-team")')
  })

  it("leaves every CURRENT section on its original component", () => {
    expect(homePage).toContain('import { PartnersStrip } from "@/components/partners-strip"')
    expect(homePage).toContain('import { FollowTheMomentum } from "@/components/follow-the-momentum"')
    expect(homePage).toMatch(/import\("@\/components\/about"\)/)
    expect(homePage).toContain('resolveDynamicComponent(m, "About", "@/components/about")')
    expect(homePage).toMatch(/import\("@\/components\/contact"\)/)
    expect(homePage).toMatch(/import\("@\/components\/footer"\)/)
    expect(homePage).toContain("<LayloEmbed />")
  })
})
