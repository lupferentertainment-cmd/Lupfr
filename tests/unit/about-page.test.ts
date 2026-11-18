import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const rootDir = path.resolve(__dirname, "../..")
const read = (...p: string[]) => fs.readFileSync(path.join(rootDir, ...p), "utf8")

describe("/about page (owner 2026-11-17: About + Team moved off the home page)", () => {
  it("has its own metadata and canonical URL", () => {
    // Read as source (not imported) so the page's whole component graph is not pulled into coverage.
    const page = read("app", "about", "page.tsx")
    expect(page).toContain('title: "About & Team"')
    expect(page).toContain("canonical: `${SITE_URL}/about`")
  })

  it("renders an h1, the home nav, About, Team and the Footer", () => {
    const page = read("app", "about", "page.tsx")
    expect(page).toContain("<h1")
    for (const tag of ["<ClaudeHomeNavigation />", "<About />", "<ClaudeHomeCrew />", "<Footer />"]) expect(page).toContain(tag)
    // Round 16: Past Artists lives here, after the Partiful band and before the Footer.
    expect(page.indexOf("<ClaudeHomeArtists />")).toBeGreaterThan(page.indexOf("<ClaudeHomePartifulBand />"))
    expect(page.indexOf("<Footer />")).toBeGreaterThan(page.indexOf("<ClaudeHomeArtists />"))
  })

  it("is linked from the footer and the subpage nav, and the Team anchor still exists", () => {
    expect(read("components", "footer.tsx")).toContain('{ name: "About", href: "/about" }')
    expect(read("components", "navigation.tsx")).toContain('{ name: "About", href: "/about" }')
    expect(read("components", "claude-home-crew.tsx")).toContain('id="team"')
  })

  it("keeps Start Planning at the bottom of the home page", () => {
    const home = read("components", "home-page.tsx")
    expect(home.indexOf("<StartPlanning />")).toBeGreaterThan(home.indexOf("<Brands />"))
  })
})
