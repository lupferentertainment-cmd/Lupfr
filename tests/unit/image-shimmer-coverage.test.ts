import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..")
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")

describe("image skeleton shimmer coverage", () => {
  it("keeps the shared image wrapper on every live surface added after the original shimmer sweep", () => {
    for (const file of [
      "components/services.tsx",
      "app/services/page.tsx",
      "components/brands.tsx",
      "components/drive-gallery-albums.tsx",
    ]) {
      const source = read(file)
      expect(source, file).toContain('import { ShimmerImage } from "@/components/shimmer-image"')
      expect(source, file).toContain("<ShimmerImage")
    }
  })

  it("uses the delayed shared shimmer layer and hides it after image load", () => {
    const source = read("components/shimmer-image.tsx")
    expect(source).toContain("<SkeletonShimmerLayer show={!ready} />")
    expect(source).toContain("onLoad={() => setReady(true)}")
    expect(source).toContain("style={ready ? style : { ...style, opacity: 0 }}")
  })
})
