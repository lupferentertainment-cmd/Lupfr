import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const rootDir = path.resolve(__dirname, "../..")
const read = (...p: string[]) => fs.readFileSync(path.join(rootDir, ...p), "utf8")

describe("/media page (owner 2026-11-18: Media moved off the home page, Follow the Momentum at the bottom)", () => {
  it("ends with Follow the Momentum, then the Footer", () => {
    const page = read("app", "media", "page.tsx")
    expect(page).toContain("<MediaOverview />")
    expect(page.indexOf("<FollowTheMomentum />")).toBeGreaterThan(page.indexOf("<MediaOverview />"))
    expect(page.indexOf("<Footer />")).toBeGreaterThan(page.indexOf("<FollowTheMomentum />"))
  })

  it("carries the 'LUPFR in the News' photo block and the home page no longer mounts a Media section", () => {
    expect(read("components", "media-overview.tsx")).toContain("<MediaNewsFeature />")
    expect(read("components", "home-page.tsx")).not.toContain("claude-home-media")
  })

  it("points the Media tab of both navs at /media", () => {
    expect(read("components", "claude-home-navigation.tsx")).toContain('["Media", "/media"]')
    expect(read("components", "navigation.tsx")).toContain('{ name: "Media", href: "/media" }')
  })
})

describe("home section headings (owner 2026-11-18: every header has the gold look)", () => {
  it("wraps the h2 of Services, Experiences, Brands and Start Planning in GoldShineText", () => {
    for (const f of ["claude-home-services", "claude-home-experiences", "claude-home-brands", "start-planning"]) {
      const src = read("components", `${f}.tsx`)
      expect(src, f).toContain('import { GoldShineText } from "@/components/gold-shine-text"')
      expect(src, f).toMatch(/<h2[^>]*>\s*<GoldShineText>/)
    }
  })
})
