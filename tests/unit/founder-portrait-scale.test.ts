/**
 * Founder portrait scale (owner report 2026-08-10: "make sure that heads are
 * fitting in properly and are not overtaking the whole space").
 *
 * Originally fixed by capping a card-header portrait's height with `max-h`,
 * since an `aspect-[5/4]` frame with no ceiling scaled its height off the
 * card's own (unbounded) width on a wide two-up desktop row.
 *
 * The 2026-08-29 founder-layout rebuild ("rebuild to match design file
 * exactly") replaced that whole mechanism: founders no longer sit in
 * variable-width cards at all — the portrait is now a column in a shared
 * grid with a *fixed* pixel width at desktop (`420px`, the design file's own
 * value), so its height can never scale up with viewport/container width the
 * way the original bug required. The mobile portrait is a plain square, also
 * incapable of the original tall-crop failure mode. This file now guards the
 * replacement invariant instead of the retired `max-h` mechanism.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const team = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")

describe("founder portrait does not swallow the layout", () => {
  it("gives the founder portrait a fixed-width desktop column instead of letting it scale with container width", () => {
    // The founders grid's desktop track is a literal 420px, not a fraction —
    // the portrait's rendered width (and therefore its aspect-derived height)
    // is bounded regardless of how wide the section gets.
    expect(team).toContain("lg:grid-cols-[420px_minmax(0,1fr)]")
  })

  it("keeps the founder portrait's own aspect bounded (square on mobile, 3/4 at desktop — never open-ended)", () => {
    expect(team).toMatch(/aspect-square[^"]*"[\s\S]{0,40}lg:aspect-\[3\/4\]/)
  })

  it("anchors the crop to the top so a capped frame never cuts heads off", () => {
    const founderImg =
      /aspect-square[\s\S]{0,1800}?className="relative z-\[1\][^"]*"/.exec(team)?.[0] ?? ""
    expect(founderImg).toContain("object-top")
    expect(founderImg).not.toContain("object-center")
  })

  it("leaves the roster card's portrait uncapped and unaffected — it is already small", () => {
    // Roster cards render 2–4 up, so their 5:4 frame never gets wide enough to
    // need a ceiling. This mechanism is untouched by the founder rebuild.
    const rosterFrame = /<div className="relative aspect-\[5\/4\] w-full overflow-hidden bg-muted">/.exec(team)
    expect(rosterFrame, "roster portrait frame should stay uncapped").not.toBeNull()
  })
})
