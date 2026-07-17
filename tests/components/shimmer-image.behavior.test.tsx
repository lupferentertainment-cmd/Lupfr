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

  it("returns to normal image opacity when no custom style is supplied", () => {
    const { container } = render(<ShimmerImage src="/photo.webp" alt="Event" width={100} height={100} />)
    const image = container.querySelector("img")!

    fireEvent.load(image)
    expect(image.style.opacity).toBe("")
  })
})
