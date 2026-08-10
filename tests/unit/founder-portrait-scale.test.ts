/**
 * Founder portrait scale (owner report 2026-08-10: "make sure that heads are
 * fitting in properly and are not overtaking the whole space").
 *
 * The founder card is deliberately larger than a roster card, but its portrait
 * was `aspect-[5/4]` with no ceiling. Aspect ratio derives height from width,
 * so on a wide two-up desktop row an ~800px card produced a ~640px-tall image
 * that swallowed the card and pushed the bio below the fold.
 *
 * The aspect still governs narrow screens; a `max-h` caps it once the card is
 * wide. Because a capped box crops via `object-cover`, the crop is anchored to
 * the top so faces survive rather than being sliced at the forehead.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const team = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")

/** The FounderCard portrait frame — the one carrying `shrink-0`. */
const frame =
  /<div className="relative aspect-\[5\/4\][^"]*shrink-0[^"]*">/.exec(team)?.[0] ?? ""

describe("founder portrait does not swallow the card", () => {
  it("caps the portrait height so it cannot scale with card width", () => {
    expect(frame, "founder portrait frame not found").not.toBe("")
    expect(frame).toMatch(/max-h-\[\d+px\]/)
  })

  it("keeps the cap within a sane header height", () => {
    const caps = [...frame.matchAll(/max-h-\[(\d+)px\]/g)].map((m) => Number(m[1]))
    expect(caps.length).toBeGreaterThan(0)
    for (const cap of caps) {
      // Taller than this and the portrait is the card again.
      expect(cap, `max-h-[${cap}px] is too tall for a card header`).toBeLessThanOrEqual(420)
      expect(cap).toBeGreaterThanOrEqual(240)
    }
  })

  it("anchors the crop to the top so a capped frame never cuts heads off", () => {
    // With a cap in play the frame crops; object-center would trim foreheads.
    const founderImg =
      /aspect-\[5\/4\][\s\S]{0,900}?className="relative z-\[1\][^"]*"/.exec(team)?.[0] ?? ""
    expect(founderImg).toContain("object-top")
    expect(founderImg).not.toContain("object-center")
  })

  it("leaves the roster card's portrait uncapped — it is already small", () => {
    // Roster cards render 2–4 up, so their 5:4 frame never gets wide enough to
    // need a ceiling. Capping them too would letterbox those portraits.
    const rosterFrame = /<div className="relative aspect-\[5\/4\] w-full overflow-hidden bg-muted">/.exec(team)
    expect(rosterFrame, "roster portrait frame should stay uncapped").not.toBeNull()
  })
})
