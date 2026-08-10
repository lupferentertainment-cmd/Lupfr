/**
 * Artist card layout (owner request 2026-08-09, with a screenshot arrow):
 * "the spotify / apple music / youtube whatever we embed ... should be
 * immediately to the right of the artist name ... horizontally aligned with
 * the artist name ... not below".
 *
 * Previously the name was an `<h3>` followed by a sibling `mt-4` row of link
 * chips, so the chips always stacked underneath.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const artists = fs.readFileSync(path.join(rootDir, "components", "artists.tsx"), "utf8")

describe("artist card puts platform links beside the name", () => {
  it("wraps the name and the link row in one flex row", () => {
    expect(artists).toMatch(
      /<div className="flex flex-wrap items-center gap-x-3 gap-y-2">\s*<h3[^>]*>\s*\{artist\.name\}/
    )
  })

  it("no longer pushes the link row onto its own line with a top margin", () => {
    expect(artists).not.toContain('className="flex items-center gap-3 flex-wrap mt-4"')
  })

  it("keeps the links in document order right after the name", () => {
    // Anchor on the heading itself — `{artist.name}` also appears earlier in an
    // image alt attribute, which made the first draft of this test measure the
    // wrong span entirely.
    const h3Idx = artists.indexOf("<h3 className=\"text-lg md:text-xl font-bold")
    expect(h3Idx).toBeGreaterThan(-1)
    const linksIdx = artists.indexOf('<div className="flex items-center gap-2">', h3Idx)
    expect(linksIdx).toBeGreaterThan(h3Idx)
    // Only the heading and its close sit between the row start and the links.
    const between = artists.slice(h3Idx, linksIdx)
    expect(between).toContain("{artist.name}")
    expect(between).toContain("</h3>")
    expect(between).not.toContain("<div")
  })

  it("still allows wrapping so a long artist name cannot overflow the card", () => {
    // flex-wrap on the row is what keeps "Where's West?" + 3 chips contained.
    expect(artists).toContain("flex flex-wrap items-center gap-x-3 gap-y-2")
  })

  it("leaves the featured-track embed below, where it belongs", () => {
    const rowIdx = artists.indexOf("flex flex-wrap items-center gap-x-3 gap-y-2")
    const embedIdx = artists.indexOf("artist.featuredTrack && featuredTrackEmbedUrl", rowIdx)
    expect(embedIdx).toBeGreaterThan(rowIdx)
  })
})
