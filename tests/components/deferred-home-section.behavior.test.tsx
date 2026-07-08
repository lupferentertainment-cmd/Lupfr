/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render } from "@testing-library/react"

/**
 * Integration spec for the deferred home sections' hash-mount behavior.
 *
 * The fix: navigating to a deferred section must render every deferred section
 * AT OR ABOVE the target immediately (so the target is positioned against real
 * heights, not placeholder estimates), while sections below the target and the
 * normal scroll path stay lazy. We stub the live rAF realign loop and keep the
 * real mount-decision so this test isolates the wiring, not the animation.
 */

vi.mock("@/lib/hash-scroll", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/hash-scroll")>()
  return { ...actual, realignHashTargetUntilStable: vi.fn(() => () => {}) }
})

import { DeferredHomeSection } from "@/components/deferred-home-section"

type IoEntry = { isIntersecting: boolean }
let ioInstances: Array<{ fire: (entries: IoEntry[]) => void }> = []

beforeEach(() => {
  ioInstances = []
  class MockIntersectionObserver {
    private readonly cb: IntersectionObserverCallback
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb
      ioInstances.push({
        fire: (entries) => this.cb(entries as unknown as IntersectionObserverEntry[], this as unknown as IntersectionObserver),
      })
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }
  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  if (typeof window.matchMedia !== "function") {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }) as unknown as typeof window.matchMedia
  }
})

afterEach(() => {
  window.location.hash = ""
})

function child(id: string) {
  return <div data-testid={`content-${id}`}>{id} content</div>
}

function isMounted(container: HTMLElement, id: string): boolean {
  return container.querySelector(`[data-testid="content-${id}"]`) !== null
}

function isPlaceholder(container: HTMLElement, id: string): boolean {
  return container.querySelector(`#${id}[aria-hidden="true"]`) !== null
}

describe("DeferredHomeSection hash mounting", () => {
  it("mounts the directly targeted section immediately (no placeholder flash)", () => {
    window.location.hash = "#contact"
    const { container } = render(
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        {child("contact")}
      </DeferredHomeSection>
    )
    expect(isMounted(container, "contact")).toBe(true)
    expect(isPlaceholder(container, "contact")).toBe(false)
  })

  it("mounts a section ABOVE the target so the target lands at a stable scroll position", () => {
    window.location.hash = "#contact"
    const { container } = render(
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[900px]">
        {child("about")}
      </DeferredHomeSection>
    )
    // #contact is below #about, so #about must render its real height now.
    expect(isMounted(container, "about")).toBe(true)
  })

  it("keeps a section BELOW the target lazy (placeholder, not mounted)", () => {
    window.location.hash = "#about"
    const { container } = render(
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        {child("contact")}
      </DeferredHomeSection>
    )
    expect(isMounted(container, "contact")).toBe(false)
    expect(isPlaceholder(container, "contact")).toBe(true)
  })

  it("keeps the normal scroll path lazy until the observer intersects", () => {
    window.location.hash = ""
    const { container } = render(
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[900px]">
        {child("about")}
      </DeferredHomeSection>
    )
    expect(isPlaceholder(container, "about")).toBe(true)
    expect(isMounted(container, "about")).toBe(false)

    act(() => {
      ioInstances.at(-1)?.fire([{ isIntersecting: true }])
    })
    expect(isMounted(container, "about")).toBe(true)
  })

  it("mounts on a later hashchange that starts targeting the section", () => {
    window.location.hash = ""
    const { container } = render(
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        {child("contact")}
      </DeferredHomeSection>
    )
    expect(isMounted(container, "contact")).toBe(false)

    act(() => {
      window.location.hash = "#contact"
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    })
    expect(isMounted(container, "contact")).toBe(true)
  })
})
