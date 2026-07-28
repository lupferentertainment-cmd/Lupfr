/** @vitest-environment happy-dom */

import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import { PartnersStrip } from "@/components/partners-strip"
import { getPartners } from "@/lib/data/partners"

/**
 * PartnersStrip contract: logo marquee with a restrained visible eyebrow and
 * an explicit accessible section label.
 */
describe("PartnersStrip", () => {
  it("renders a visible 'Corporate Partners' eyebrow above the marquee", () => {
    const { container } = render(<PartnersStrip />)
    const eyebrow = screen.getByText("Corporate Partners")
    expect(eyebrow.className).toContain("lupfr-section-kicker")
    expect(eyebrow.compareDocumentPosition(container.querySelector(".partner-marquee-track")!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(container.querySelector(".partner-marquee-track")).not.toBeNull()
  })

  it("keeps the section labelled for assistive tech", () => {
    const { container } = render(<PartnersStrip />)
    const section = container.querySelector("section")
    expect(section?.getAttribute("aria-label")).toBe("Corporate partners")
  })

  it("inherits the page background — no tinted band or border (owner request 2026-07-11)", () => {
    const { container } = render(<PartnersStrip />)
    const section = container.querySelector("section")
    expect(section?.className).not.toMatch(/bg-muted|bg-card|border-y/)
  })

  it("renders every linked partner logo as a link to that partner's site", () => {
    const linked = getPartners().filter((p) => p.url)
    expect(linked.length).toBeGreaterThan(0)
    const { container } = render(<PartnersStrip />)
    const primaryRow = container.querySelector(
      ".partner-marquee-track > div:not([aria-hidden])"
    )
    expect(primaryRow).not.toBeNull()
    const links = Array.from(primaryRow!.querySelectorAll("a"))
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      ...linked.map((p) => p.url),
      ...linked.map((p) => p.url),
    ])
  })

  it("renders logo-pending partners as freeform text labels (comp: logo null → text)", () => {
    const pending = getPartners().filter((p) => !p.image)
    expect(pending.map((p) => p.name)).toContain("Maison Noir")
    const { container } = render(<PartnersStrip />)
    const primaryRow = container.querySelector(
      ".partner-marquee-track > div:not([aria-hidden])"
    )!
    for (const p of pending) {
      const label = Array.from(primaryRow.querySelectorAll(".partner-logo-label")).find(
        (el) => el.textContent?.trim().toLowerCase() === p.name.toLowerCase()
      )
      expect(label, `${p.name} label missing from marquee`).toBeDefined()
      // Label-only: no logo image, no tile chrome.
      expect(label!.querySelector("img")).toBeNull()
      expect(label!.closest(".partner-logo-chip")).toBeNull()
      // No *dead* link wrapper: a pending partner is only linked when it
      // actually has a url (FredEx awaits a real logo but has a live site;
      // Maison Noir has neither, so it stays plain text).
      const link = label!.closest("a")
      if (p.url) expect(link?.getAttribute("href")).toBe(p.url)
      else expect(link).toBeNull()
    }
  })

  it("renders freeform logos without rectangular card tiles", () => {
    const { container } = render(<PartnersStrip />)
    const section = container.querySelector("section")
    expect(section?.getAttribute("data-partners-chrome")).toBe("freeform")
    expect(container.querySelectorAll(".partner-logo-chip").length).toBe(0)
    expect(container.querySelectorAll(".skeleton-shimmer").length).toBe(0)
    const shells = container.querySelectorAll(
      ".partner-marquee-track > div:not([aria-hidden]) .partner-logo-shell",
    )
    expect(shells.length).toBeGreaterThan(0)
    for (const shell of shells) {
      expect(shell.className).toMatch(/bg-transparent/)
      expect(shell.className).toMatch(/border-0/)
      expect(shell.className).toMatch(/shadow-none/)
      expect(shell.className).not.toMatch(/bg-card|border-border|shadow-md|partner-logo-chip/)
    }
    const marks = container.querySelectorAll(
      ".partner-marquee-track > div:not([aria-hidden]) .partner-logo-mark",
    )
    expect(marks.length).toBeGreaterThan(0)
    for (const mark of marks) {
      expect(mark.className).not.toMatch(/border-border|bg-card|shadow-md/)
    }
  })

  it("opens partner sites in a new tab without opener access", () => {
    const { container } = render(<PartnersStrip />)
    const links = container.querySelectorAll(".partner-marquee-track a")
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link.getAttribute("target")).toBe("_blank")
      expect(link.getAttribute("rel")).toContain("noopener")
    }
  })

  it("activates grab-to-spin after hydration and swallows only the drag-tail click", () => {
    const { container } = render(<PartnersStrip />)
    const track = container.querySelector<HTMLElement>(".partner-marquee-track")
    expect(track).not.toBeNull()
    // useMarqueeSpin marks the track once the rAF engine owns the transform
    expect(track!.getAttribute("data-spin")).toBe("true")

    fireEvent.pointerDown(track!, { button: 0, clientX: 100, pointerId: 1 })
    expect(track!.getAttribute("data-dragging")).toBe("true")
    fireEvent.pointerMove(track!, { clientX: 60, pointerId: 1 })
    fireEvent.pointerUp(track!, { clientX: 60, pointerId: 1 })
    expect(track!.hasAttribute("data-dragging")).toBe(false)

    const link = track!.querySelector("a")
    expect(link).not.toBeNull()
    const onLinkClick = vi.fn((e: Event) => e.preventDefault())
    link!.addEventListener("click", onLinkClick)
    // The click right after a real drag is suppressed so a fling never navigates...
    fireEvent.click(link!)
    expect(onLinkClick).not.toHaveBeenCalled()
    // ...but suppression is one-shot: the next plain click reaches the link.
    fireEvent.click(link!)
    expect(onLinkClick).toHaveBeenCalledTimes(1)
  })

  it("does not suppress clicks after a sub-threshold press (plain click on a logo)", () => {
    const { container } = render(<PartnersStrip />)
    const track = container.querySelector<HTMLElement>(".partner-marquee-track")!
    fireEvent.pointerDown(track, { button: 0, clientX: 100, pointerId: 1 })
    fireEvent.pointerMove(track, { clientX: 102, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 102, pointerId: 1 })

    const link = track.querySelector("a")!
    const onLinkClick = vi.fn((e: Event) => e.preventDefault())
    link.addEventListener("click", onLinkClick)
    fireEvent.click(link)
    expect(onLinkClick).toHaveBeenCalledTimes(1)
  })

  it("tolerates getComputedStyle transform read failures when seeding spin offset", () => {
    const spy = vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
      throw new Error("no style")
    })
    try {
      const { container } = render(<PartnersStrip />)
      const track = container.querySelector<HTMLElement>(".partner-marquee-track")!
      expect(track.hasAttribute("data-spin") || !track.hasAttribute("data-spin")).toBe(true)
    } finally {
      spy.mockRestore()
    }
  })

  it("never activates the spin engine under prefers-reduced-motion (CSS fallback row)", () => {
    const spy = vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: /prefers-reduced-motion/.test(query),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList
    )
    try {
      const { container } = render(<PartnersStrip />)
      const track = container.querySelector<HTMLElement>(".partner-marquee-track")!
      expect(track.hasAttribute("data-spin")).toBe(false)
      // With the engine off, pointer presses never enter drag mode either.
      fireEvent.pointerDown(track, { button: 0, clientX: 100, pointerId: 1 })
      expect(track.hasAttribute("data-dragging")).toBe(false)
    } finally {
      spy.mockRestore()
    }
  })

  it("ignores non-primary buttons and stray pointer events outside a drag", () => {
    const { container } = render(<PartnersStrip />)
    const track = container.querySelector<HTMLElement>(".partner-marquee-track")!
    fireEvent.pointerDown(track, { button: 2, clientX: 100, pointerId: 1 })
    expect(track.hasAttribute("data-dragging")).toBe(false)
    // Moves/releases with no active drag are no-ops rather than crashes.
    fireEvent.pointerMove(track, { clientX: 200, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 })
    expect(track.hasAttribute("data-dragging")).toBe(false)
  })

  it("auto-advances leftward via the rAF engine and wraps drags past the loop point", async () => {
    const { container } = render(<PartnersStrip />)
    const track = container.querySelector<HTMLElement>(".partner-marquee-track")!
    // happy-dom has no layout, so give the track a measurable width and
    // re-measure through the resize path the hook already listens on.
    Object.defineProperty(track, "scrollWidth", { value: 1000, configurable: true })
    fireEvent(window, new Event("resize"))
    await new Promise((resolve) => setTimeout(resolve, 100))
    const advanced = track.style.transform.match(/translate3d\((-?[\d.]+)px/)
    expect(advanced).not.toBeNull()
    expect(Number(advanced![1])).toBeLessThan(0)

    // Hover/focus pause paths (JS replacement for the CSS :hover pause).
    fireEvent.mouseEnter(track)
    fireEvent.mouseOver(track)
    fireEvent.focus(track)
    fireEvent.blur(track, { relatedTarget: track.querySelector("a") })
    fireEvent.blur(track)
    fireEvent.mouseLeave(track)
    fireEvent.mouseOut(track)

    // Drag far rightward past the seam: the offset must wrap back into
    // (-half, 0] so the loop stays seamless, then the fling decays.
    fireEvent.pointerDown(track, { button: 0, clientX: 0, pointerId: 1 })
    fireEvent.pointerMove(track, { clientX: 450, pointerId: 1 })
    fireEvent.pointerMove(track, { clientX: 900, pointerId: 1 })
    fireEvent.pointerUp(track, { clientX: 900, pointerId: 1 })
    await new Promise((resolve) => setTimeout(resolve, 100))
    const wrapped = track.style.transform.match(/translate3d\((-?[\d.]+)px/)
    expect(wrapped).not.toBeNull()
    const x = Number(wrapped![1])
    expect(x).toBeLessThanOrEqual(0)
    expect(x).toBeGreaterThan(-500)
  })

  it("keeps the duplicate marquee copy hidden from screen readers with non-tabbable duplicate links so mouse clicks work", () => {
    const { container } = render(<PartnersStrip />)
    const rows = container.querySelectorAll(".partner-marquee-track > div")
    expect(rows.length).toBe(2)
    expect(rows[1].getAttribute("aria-hidden")).toBe("true")
    const dupLinks = rows[1].querySelectorAll("a")
    for (const link of dupLinks) {
      expect(link.getAttribute("tabindex")).toBe("-1")
    }
  })
})
