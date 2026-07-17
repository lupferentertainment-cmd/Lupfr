import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "../..")
const artists = fs.readFileSync(path.join(root, "components/artists.tsx"), "utf8")
const page = fs.readFileSync(path.join(root, "app/artists/page.tsx"), "utf8")

describe("artists directory route", () => {
  it("links the home section to the dedicated artist directory", () => {
    expect(artists).toContain('href="/artists"')
    expect(artists).toContain("View all artists →")
  })

  it("reuses artist cards with featured/A-Z ordering and genre filtering", () => {
    expect(page).toContain("<ArtistsDirectory />")
    expect(artists).toContain('useState<"featured" | "az">("featured")')
    expect(artists).toContain('<option value="all">All Genres</option>')
    expect(artists).toContain("items={visibleArtists}")
  })

  it("publishes canonical metadata for /artists", () => {
    expect(page).toContain('title: "Artists"')
    expect(page).toContain('canonical: `${SITE_URL}/artists`')
  })
})
