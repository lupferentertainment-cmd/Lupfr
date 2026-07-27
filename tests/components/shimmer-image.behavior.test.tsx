/** @vitest-environment happy-dom */

import { fireEvent, render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ShimmerImage } from "@/components/shimmer-image"

vi.mock("next/image", () => ({
  default({ src, alt, fill: _fill, ...props }: { src: string; alt: string; fill?: boolean }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />
  },
}))

/** Simulate a browser-cached image: decoded before React can attach onLoad. */
function withCompleteImages(run: () => void) {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "complete")
  Object.defineProperty(HTMLImageElement.prototype, "complete", {
    configurable: true,
    get: () => true,
  })
  try {
    run()
  } finally {
    if (descriptor) Object.defineProperty(HTMLImageElement.prototype, "complete", descriptor)
    else delete (HTMLImageElement.prototype as unknown as Record<string, unknown>).complete
  }
}

describe("ShimmerImage", () => {
  it("hides the image until load, then restores its requested opacity", () => {
    const { container } = render(
      <div className="relative">
        <ShimmerImage src="/photo.webp" alt="Event" fill style={{ opacity: 0.16 }} />
      </div>
    )
    const image = container.querySelector("img")!

    expect(image.style.opacity).toBe("0")
    expect(container.querySelector(".skeleton-shimmer")).not.toBeNull()

    fireEvent.load(image)
    expect(image.style.opacity).toBe("0.16")
  })

  it("reveals an image that was already decoded on mount (cached: onLoad never fires)", () => {
    // Regression: the deck viewer mounts slides on click, so a CDN-cached slide
    // completes before React attaches onLoad — the image stayed at opacity 0
    // behind the shimmer forever. Seen live on /brands/highrise (2026-07-27).
    withCompleteImages(() => {
      const { container } = render(
        <ShimmerImage src="/cached.webp" alt="Cached" fill style={{ opacity: 0.16 }} />
      )
      const image = container.querySelector("img")!

      expect(image.style.opacity).toBe("0.16")
      // The shimmer layer stays mounted but fades out (its normal behavior).
      expect(container.querySelector(".skeleton-shimmer")?.className).toContain("opacity-0")
    })
  })

  it("returns to normal image opacity when no custom style is supplied", () => {
    const { container } = render(<ShimmerImage src="/photo.webp" alt="Event" width={100} height={100} />)
    const image = container.querySelector("img")!

    fireEvent.load(image)
    expect(image.style.opacity).toBe("")
  })
})
