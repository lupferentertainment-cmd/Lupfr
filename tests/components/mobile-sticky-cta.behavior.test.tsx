/** @vitest-environment happy-dom */

/**
 * 2026-10-04 addition, round 11 (owner: "Across website on mobile - the
 * 'Plan your event' button should be on the bottom of the screen at all
 * times (change it to continue button when in the plan your event section
 * at the bottom)"). See components/mobile-sticky-cta.tsx's own doc comment
 * for the full design — this covers the generic sitewide bar's own
 * show/hide-near-Contact behavior. The Contact-page half (its own portaled
 * Continue/Back/Send Brief bar) is covered in contact-wizard.behavior.test.tsx.
 */

import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { MobileStickyCta } from "@/components/mobile-sticky-cta"

// Reuses the same #contact node across calls within a test — creating a
// fresh one each time would leave stale duplicates in the DOM (document.
// getElementById returns the first match in document order), which would
// mask a second mockContactRect() call's updated position entirely.
function mockContactRect(rect: Partial<DOMRect>) {
  let el = document.getElementById("contact")
  if (!el) {
    el = document.createElement("div")
    el.id = "contact"
    document.body.appendChild(el)
  }
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON() {
      return this
    },
    ...rect,
  } as DOMRect)
  return el
}

afterEach(() => {
  document.getElementById("contact")?.remove()
  vi.restoreAllMocks()
})

describe("MobileStickyCta", () => {
  it("shows 'Plan Your Event' linking to /contact when no #contact section exists on the page", () => {
    render(<MobileStickyCta />)
    const link = screen.getByRole("link", { name: /Plan Your Event/ })
    expect(link).toHaveAttribute("href", "/contact")
  })

  it("hides once the #contact section scrolls into meaningful view", async () => {
    // Well below the viewport (not in view yet) — bar shows.
    mockContactRect({ top: window.innerHeight * 2, bottom: window.innerHeight * 2 + 400 })
    render(<MobileStickyCta />)
    expect(screen.getByRole("link", { name: /Plan Your Event/ })).toBeInTheDocument()

    // Squarely filling the viewport — bar hides. The component's
    // scroll handler defers the actual recheck to requestAnimationFrame, so
    // the test has to await a frame too — act() alone only flushes sync/
    // microtask updates, not a pending rAF callback.
    mockContactRect({ top: 0, bottom: window.innerHeight })
    await act(async () => {
      fireEvent.scroll(window)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    expect(screen.queryByRole("link", { name: /Plan Your Event/ })).not.toBeInTheDocument()
  })

  it("shows again once scrolled back away from #contact", async () => {
    mockContactRect({ top: window.innerHeight * 2, bottom: window.innerHeight * 2 + 400 })
    render(<MobileStickyCta />)
    expect(screen.getByRole("link", { name: /Plan Your Event/ })).toBeInTheDocument()

    mockContactRect({ top: 0, bottom: window.innerHeight })
    await act(async () => {
      fireEvent.scroll(window)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    expect(screen.queryByRole("link", { name: /Plan Your Event/ })).not.toBeInTheDocument()

    mockContactRect({ top: window.innerHeight * 2 + 500, bottom: window.innerHeight * 2 + 900 })
    await act(async () => {
      fireEvent.scroll(window)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    expect(screen.getByRole("link", { name: /Plan Your Event/ })).toBeInTheDocument()
  })

  it("coalesces rapid scroll/resize bursts into a single pending frame", async () => {
    mockContactRect({ top: window.innerHeight * 2, bottom: window.innerHeight * 2 + 400 })
    render(<MobileStickyCta />)

    mockContactRect({ top: 0, bottom: window.innerHeight })
    await act(async () => {
      // Firing scroll and resize back-to-back, before the first's rAF has
      // run, exercises the `if (frame) return` dedupe guard — only the
      // first call schedules a frame; the rest are no-ops.
      fireEvent.scroll(window)
      fireEvent.resize(window)
      fireEvent.scroll(window)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    })
    expect(screen.queryByRole("link", { name: /Plan Your Event/ })).not.toBeInTheDocument()
  })

  it("cancels a pending frame on unmount without throwing", async () => {
    mockContactRect({ top: window.innerHeight * 2, bottom: window.innerHeight * 2 + 400 })
    const { unmount } = render(<MobileStickyCta />)

    // Schedule a frame, then unmount before it fires — exercises the
    // cleanup's `if (frame) cancelAnimationFrame(frame)` branch.
    fireEvent.scroll(window)
    expect(() => unmount()).not.toThrow()
  })
})
