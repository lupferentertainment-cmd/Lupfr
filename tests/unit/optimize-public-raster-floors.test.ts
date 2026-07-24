import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

describe("optimize-public-raster card reencode floors", () => {
  it("steps quality to 40 and width to 800 before giving up on card budget", () => {
    const src = readFileSync(join(process.cwd(), "scripts/optimize-public-raster.mjs"), "utf8")
    expect(src).toMatch(/if \(quality > 40\)/)
    expect(src).toMatch(/if \(maxWidth > 800\)/)
    expect(src).toMatch(/CARD_MAX_BYTES = 450_000/)
    expect(src).toMatch(/CARD_MAX_WIDTH = 1600/)
  })
})
