/**
 * Team "Backed by Partiful" band artwork.
 *
 * History: the left panel was a baked raster — first a recycled fromclay event
 * flyer, then `partiful-announcement.webp`, a Partiful P on a dark gold stage
 * (owner 2026-07-23). Both were images, and an image cannot follow the theme:
 * in light mode the panel sat as a near-black slab against a near-white page,
 * which the owner flagged on 2026-08-10.
 *
 * The lockup is now COMPOSED from the two real marks over a themed surface, so
 * it reads correctly in both modes. These tests pin that composition — the old
 * "is the raster dark enough" check is obsolete, because there is no raster.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const teamSource = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")
/**
 * Comments stripped: team.tsx documents the retired raster by name to explain
 * why it went away, and scanning raw source flags that explanation as if the
 * file were still referenced.
 */
const teamCode = teamSource.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")

/** The band's left panel, from the themed wrapper to its closing tag. */
const panel =
  /min-h-\[200px\][\s\S]*?partiful\.webp[\s\S]{0,400}?<\/div>/.exec(teamCode)?.[0] ?? ""

describe("Partiful announcement band", () => {
  it("still reads as a partnership", () => {
    expect(teamSource).toContain("Backed by Partiful")
    expect(teamSource).toContain("Exclusive Partner")
  })

  it("no longer renders a baked raster that cannot follow the theme", () => {
    expect(teamCode).not.toContain("partiful-announcement.webp")
    expect(
      fs.existsSync(path.join(rootDir, "public", "images", "partiful-announcement.webp")),
      "the retired lockup raster should not linger in public/ — it is recoverable from git history"
    ).toBe(false)
  })

  it("composes the lockup from both real marks", () => {
    expect(panel).toContain("/images/le-logo.webp")
    expect(panel).toContain("/corporate_partners/partiful.webp")
  })

  it("sits on a themed surface rather than a hardcoded dark colour", () => {
    expect(panel).toMatch(/bg-muted/)
    // A literal black/near-black is what produced the light-mode slab.
    expect(panel).not.toMatch(/bg-black|bg-\[#0|#000/)
  })

  it("keeps an accessible name on the Partiful mark for the home browser gate", () => {
    // scripts/verify-will-home.mjs locates this via img[alt*="Partiful" i].
    expect(panel).toContain('alt="Partiful"')
  })

  it("marks the × separator decorative", () => {
    expect(teamSource).toMatch(/aria-hidden[\s\S]{0,60}×|×[\s\S]{0,60}aria-hidden/)
  })
})
