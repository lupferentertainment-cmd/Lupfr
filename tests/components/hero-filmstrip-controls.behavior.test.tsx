/** @vitest-environment happy-dom */

/**
 * Manual prev/next hero controls (owner design-file punch list, 2026-08-29:
 * "make ability for me to scroll through images manually too (both desktop
 * and mobile)"). Covers the shared HeroFilmstripArrows component in
 * isolation plus its wiring into the mobile hero shell, including the touch
 * swipe gesture. See components/hero-shared.tsx and
 * components/hero-mobile-static.tsx.
 */

import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { HeroFilmstripArrows, HERO_FILMSTRIP_PHOTOS } from "@/components/hero-shared"
import { HeroMobileStaticSection } from "@/components/hero-mobile-static"

vi.mock("next/image", () => ({
  default({ src, alt, ...rest }: { src: string; alt: string; fill?: boolean; priority?: boolean; sizes?: string }) {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...img } = rest as Record<string, unknown>
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={typeof src === "string" ? src : ""} alt={alt} {...img} />
  },
}))

describe("HeroFilmstripArrows (shared)", () => {
  it("calls onSelect with the next index, wrapping past the last photo", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<HeroFilmstripArrows activeIndex={HERO_FILMSTRIP_PHOTOS.length - 1} onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: "Show next hero photo" }))
    expect(onSelect).toHaveBeenCalledWith(0)
  })

  it("calls onSelect with the previous index, wrapping before the first photo", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<HeroFilmstripArrows activeIndex={0} onSelect={onSelect} />)
    await user.click(screen.getByRole("button", { name: "Show previous hero photo" }))
    expect(onSelect).toHaveBeenCalledWith(HERO_FILMSTRIP_PHOTOS.length - 1)
  })
})

describe("HeroMobileStaticSection — manual scroll", () => {
  const props = { prefersReducedMotion: true, phraseIndex: 0, reducePhraseMotion: true }

  function photoLayer(): HTMLElement {
    const tablist = screen.getByRole("tablist", { name: "Hero photo" })
    return tablist.parentElement as HTMLElement
  }

  it("renders prev/next arrows alongside the existing dots", () => {
    render(<HeroMobileStaticSection {...props} />)
    expect(screen.getByRole("button", { name: "Show previous hero photo" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Show next hero photo" })).toBeInTheDocument()
  })

  // Owner report, 2026-08-29: "the arrows between slides on hero do not
  // work" — the full-bleed bottom copy block was swallowing clicks meant for
  // the arrows/dots underneath. See the matching source-string check in
  // tests/unit/hero-filmstrip-performance.test.ts for the desktop half.
  it("lets clicks pass through the empty part of the bottom copy block to the controls underneath", () => {
    render(<HeroMobileStaticSection {...props} />)
    const copyBlock = screen.getByRole("link", { name: "Book an Event" }).closest(".pointer-events-none")
    expect(copyBlock).not.toBeNull()
    expect(copyBlock?.className).toContain("absolute inset-0")
    const realContent = copyBlock?.querySelector(".pointer-events-auto")
    expect(realContent).not.toBeNull()
    expect(realContent?.contains(screen.getByRole("link", { name: "Book an Event" }))).toBe(true)
    // sanity: the arrow buttons live outside the pointer-events-none wrapper entirely
    const nextArrow = screen.getByRole("button", { name: "Show next hero photo" })
    expect(copyBlock?.contains(nextArrow)).toBe(false)
  })

  it("advances to the next photo via the next arrow", async () => {
    const user = userEvent.setup()
    render(<HeroMobileStaticSection {...props} />)
    const dotsBefore = screen.getAllByRole("tab")
    expect(dotsBefore[0]).toHaveAttribute("aria-selected", "true")
    await user.click(screen.getByRole("button", { name: "Show next hero photo" }))
    const dotsAfter = screen.getAllByRole("tab")
    expect(dotsAfter[1]).toHaveAttribute("aria-selected", "true")
  })

  it("wraps to the last photo via the previous arrow from the first slide", async () => {
    const user = userEvent.setup()
    render(<HeroMobileStaticSection {...props} />)
    await user.click(screen.getByRole("button", { name: "Show previous hero photo" }))
    const dots = screen.getAllByRole("tab")
    expect(dots[dots.length - 1]).toHaveAttribute("aria-selected", "true")
  })

  it("advances a slide on a leftward swipe", () => {
    render(<HeroMobileStaticSection {...props} />)
    const layer = photoLayer()
    fireEvent.touchStart(layer, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(layer, { changedTouches: [{ clientX: 200 }] })
    const dots = screen.getAllByRole("tab")
    expect(dots[1]).toHaveAttribute("aria-selected", "true")
  })

  it("retreats a slide on a rightward swipe, wrapping to the last photo", () => {
    render(<HeroMobileStaticSection {...props} />)
    const layer = photoLayer()
    fireEvent.touchStart(layer, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(layer, { changedTouches: [{ clientX: 220 }] })
    const dots = screen.getAllByRole("tab")
    expect(dots[dots.length - 1]).toHaveAttribute("aria-selected", "true")
  })

  it("ignores a short drag under the swipe threshold", () => {
    render(<HeroMobileStaticSection {...props} />)
    const layer = photoLayer()
    fireEvent.touchStart(layer, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(layer, { changedTouches: [{ clientX: 285 }] })
    const dots = screen.getAllByRole("tab")
    expect(dots[0]).toHaveAttribute("aria-selected", "true")
  })

  it("ignores a touchend with no matching touchstart", () => {
    render(<HeroMobileStaticSection {...props} />)
    const layer = photoLayer()
    fireEvent.touchEnd(layer, { changedTouches: [{ clientX: 100 }] })
    const dots = screen.getAllByRole("tab")
    expect(dots[0]).toHaveAttribute("aria-selected", "true")
  })

  it("jumps straight to a photo via its dot", async () => {
    const user = userEvent.setup()
    render(<HeroMobileStaticSection {...props} />)
    const dots = screen.getAllByRole("tab")
    await user.click(dots[2])
    expect(dots[2]).toHaveAttribute("aria-selected", "true")
    expect(dots[0]).toHaveAttribute("aria-selected", "false")
  })

  // Owner report, 2026-08-29: "the images on hero go black for a second when
  // flipping between each one." Root cause: selecting a new slide reset
  // `ready` to false, forcing the incoming photo to restart its opacity-0 →
  // opacity-100 fade against the section's black background on every swap.
  // Once the first photo has loaded, later swaps must stay at full opacity
  // the whole time — no dip back to transparent/black.
  it("keeps the photo at full opacity across slide changes once the first one has loaded (no black flash)", () => {
    render(<HeroMobileStaticSection {...props} />)
    const img = screen.getByAltText(HERO_FILMSTRIP_PHOTOS[0].alt)
    fireEvent.load(img)
    expect(img.className).toContain("opacity-100")

    fireEvent.click(screen.getByRole("button", { name: "Show next hero photo" }))
    // Same <img> node updates in place (no remount/key-swap) so the browser
    // holds the outgoing frame instead of blanking to the black background.
    const nextImg = screen.getByAltText(HERO_FILMSTRIP_PHOTOS[1].alt)
    expect(nextImg).toBe(img)
    expect(nextImg.className).toContain("opacity-100")
    expect(nextImg.className).not.toContain("opacity-0")
  })

  it("auto-advances on a timer unless motion is reduced", () => {
    vi.useFakeTimers()
    try {
      render(<HeroMobileStaticSection {...props} prefersReducedMotion={false} />)
      const dotsBefore = screen.getAllByRole("tab")
      expect(dotsBefore[0]).toHaveAttribute("aria-selected", "true")
      act(() => {
        vi.runOnlyPendingTimers()
      })
      const dotsAfter = screen.getAllByRole("tab")
      expect(dotsAfter[1]).toHaveAttribute("aria-selected", "true")
    } finally {
      vi.useRealTimers()
    }
  })

  it("animates the phrase fade-up unless reduced motion is requested", () => {
    const { container } = render(<HeroMobileStaticSection {...props} reducePhraseMotion={false} />)
    const phraseWrap = container.querySelector(".min-h-\\[1\\.75rem\\]")
    const phrase = phraseWrap?.firstElementChild
    expect(phrase?.className).toContain("motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_both]")
  })

  it("skips the phrase fade-up animation when reduced motion is requested", () => {
    const { container } = render(<HeroMobileStaticSection {...props} reducePhraseMotion />)
    const phraseWrap = container.querySelector(".min-h-\\[1\\.75rem\\]")
    const phrase = phraseWrap?.firstElementChild
    expect(phrase?.className).not.toContain("motion-safe:animate-[fade-up_600ms_cubic-bezier(0.22,1,0.36,1)_both]")
  })
})
