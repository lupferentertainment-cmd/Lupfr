/**
 * Team and founder portraits must not flicker (owner request 2026-08-05).
 *
 * A hand-rolled `onLoad` fade leaves a browser-cached image stuck at opacity 0
 * behind the shimmer — the bug already fixed once on the /brands deck viewer.
 * `ShimmerImage` reads `complete` on mount, so it is the only allowed path.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const teamSource = fs.readFileSync(path.join(rootDir, "components", "team.tsx"), "utf8")
const shimmerSource = fs.readFileSync(
  path.join(rootDir, "components", "shimmer-image.tsx"),
  "utf8"
)

describe("team portraits reuse the cached-image-safe shimmer", () => {
  it("renders portraits through ShimmerImage", () => {
    expect(teamSource).toContain('from "@/components/shimmer-image"')
    // Founder card only — the roster card/grid was removed 2026-09-02 (owner
    // punch list: Zac/Kylie/Cianna gone, founders-only section).
    expect(teamSource.match(/<ShimmerImage/g) ?? []).toHaveLength(1)
  })

  it("has no hand-rolled onLoad opacity gate left in the team section", () => {
    expect(teamSource).not.toContain("imageReady")
    expect(teamSource).not.toContain("setImageReady")
  })

  it("ShimmerImage still reveals an already-decoded image on mount", () => {
    expect(shimmerSource).toMatch(/node\?\.complete/)
  })
})

describe("founder portraits stay cheap on mobile", () => {
  it("does not eager-load the below-the-fold founders row", () => {
    // `priority` here would fight the hero for LCP on a phone.
    expect(teamSource).not.toMatch(/^\s*priority(=|\s*\/?>)/m)
    // Founder card only — see the ShimmerImage-count note above.
    expect(teamSource.match(/loading="lazy"/g) ?? []).toHaveLength(1)
  })

  it("asks for a phone-sized portrait rather than a full-width one", () => {
    // Founder portrait: the 2026-08-29 design-file split layout switches from
    // a stacked mobile column to a fixed 420px desktop column at `lg` (1024px)
    // — still a conservative phone-width estimate (92vw), not a naive 100vw.
    // (The roster grid's own `sm` (640px)-breakpoint `sizes` hint was removed
    // along with the roster grid itself, 2026-09-02.)
    expect(teamSource).toContain("(min-width: 1024px) 420px, 92vw")
  })

  it("has no tilt-card mechanism left at all", () => {
    // The 2026-08-29 founder-layout rebuild had already moved FounderCard off
    // the shared `GoldCard` tilt-card shell — the design file's founder split
    // is a flat editorial layout, not a hover-tilt card. The roster grid
    // (the only remaining `GoldCard`/tilt consumer) was removed 2026-09-02,
    // so the whole mechanism is gone from this component now.
    expect(teamSource).not.toContain("enableTilt")
    expect(teamSource).not.toContain("GoldCard")
  })
})
