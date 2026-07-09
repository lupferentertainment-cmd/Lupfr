import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const artists = fs.readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "components", "artists.tsx"),
  "utf8"
)

describe("mobile artist embed in-view gate", () => {
  it("gates featured-track iframes behind useInView with a generous rootMargin", () => {
    expect(artists).toContain("useInView")
    expect(artists).toMatch(/useInView\([^,]+,\s*\{\s*once:\s*true,\s*margin:\s*"200px"\s*\}/)
  })

  it("keeps the iframe src/lazy/theme substrings for home-performance lock-in", () => {
    expect(artists).toContain("src={featuredTrackEmbedUrl}")
    expect(artists).toContain('loading="lazy"')
    expect(artists).toContain("?theme=0")
    expect(artists).toContain("visual=false")
  })

  it("reserves embed height with a placeholder before the iframe mounts", () => {
    expect(artists).toContain('platform === "spotify" ? "80" : "166"')
    expect(artists).toMatch(/style=\{\{\s*height:\s*`\$\{height\}px`\s*\}\}/)
  })
})
