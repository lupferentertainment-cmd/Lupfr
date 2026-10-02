/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@/components/theme-provider"
import { ClaudeHomeHero } from "@/components/claude-home-hero"

/**
 * Optional-field branches on the new homepage sections (missing image,
 * no quote/stats) that never occur in today's real content — mocked here
 * so they're exercised once instead of only ever running the "every field
 * present" path. ClaudeHomeExperiences/ClaudeHomeMedia (Oct 1 2026 redesign
 * v2: curated case studies / video reel, see claude-home-experiences.tsx and
 * claude-home-media.tsx) have no such optional-field branches of their own —
 * their video/no-video split is already covered by the 3 real case studies
 * in homepage-redesign.behavior.test.tsx.
 */

afterEach(() => {
  vi.resetModules()
  vi.doUnmock("@/lib/events")
  vi.doUnmock("@/lib/data/team")
  vi.doUnmock("@/lib/data/services")
  vi.doUnmock("@/lib/data/artists")
  vi.doUnmock("@/lib/data/brands")
})

describe("ClaudeHomeHero's background picker", () => {
  // 2026-10-02 fix, round 2: the hero's 3-item picker (Bal Masque / SEA//SIDE
  // / Golden Gate) defaults to Bal Masque's real video; this exercises the
  // no-video branch (Golden Gate has no real video asset, only a photo — see
  // the file's own doc comment) by switching to it.
  it("switches to the real photo when the Golden Gate tab (no video asset) is picked", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeHero />)
    await user.click(screen.getByText(/Golden Gate/))
    expect(screen.getByAltText(/Golden Gate Live/)).toBeInTheDocument()
  })
})

describe("claude-home-experiences' requireEvent guard", () => {
  it("throws loudly instead of silently rendering placeholder copy when a hardcoded slug goes missing", async () => {
    vi.doMock("@/lib/events", () => ({
      getEventBySlug: () => undefined,
      eventDetailPath: (slug: string) => `/events/${slug}`,
    }))
    await expect(import("@/components/claude-home-experiences")).rejects.toThrow(
      /expected event .* to exist in data\/events\.yml/
    )
  })
})

describe("ClaudeHomeTeam with a bare-minimum founder", () => {
  it("skips the image, quote, badge, and stats blocks, and a single-word name renders with no last-name span", async () => {
    // Single-word name ("Jane", not "Jane Doe") exercises FounderCard's
    // spaceIndex === -1 branches — every real founder has a "First Last"
    // name, so that split path otherwise never runs.
    vi.doMock("@/lib/data/team", () => ({
      getFounders: () => [{ name: "Jane", title: "Founder", location: "LA", bio: "A short bio." }],
    }))
    const { ClaudeHomeTeam } = await import("@/components/claude-home-team")
    const { container } = render(<ClaudeHomeTeam />)
    expect(screen.getByText("Founder")).toBeInTheDocument()
    expect(screen.getByText("Jane")).toBeInTheDocument()
    expect(container.querySelector("blockquote")).toBeNull()
  })
})

describe("ClaudeHomeBrands' entrance animation", () => {
  /** Same MockIntersectionObserver pattern as the LazyLoopVideo describe
   * below — framer-motion's useInView needs a real IntersectionObserver,
   * which happy-dom doesn't implement. Exercises the `isInView` branch of
   * BrandPosterTile's `animate={isInView ? {...} : {}}` that a plain render
   * (never intersecting) never takes. */
  type IoEntry = { isIntersecting: boolean; target: Element }
  let ioInstances: Array<{ fire: (entries: IoEntry[]) => void }> = []

  beforeEach(() => {
    ioInstances = []
    class MockIntersectionObserver {
      private readonly cb: IntersectionObserverCallback
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb
      }
      observe(target: Element) {
        ioInstances.push({
          fire: (entries) => this.cb(entries as unknown as IntersectionObserverEntry[], this as unknown as IntersectionObserver),
        })
      }
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  it("animates the poster tiles in once the section scrolls into view", async () => {
    const { ClaudeHomeBrands } = await import("@/components/claude-home-brands")
    const { container } = render(<ClaudeHomeBrands />)
    expect(ioInstances.length).toBeGreaterThan(0)
    act(() => {
      ioInstances[0]!.fire([{ isIntersecting: true, target: container }])
    })
    expect(container.querySelectorAll("a[href^='/brands/']").length).toBeGreaterThan(0)
  })
})

describe("ClaudeHomeServices with an imageless service", () => {
  it("renders the tab and detail panel without an image", async () => {
    vi.doMock("@/lib/data/services", () => ({
      getServices: () => [{ title: "Bare Service", description: "A plain service." }],
      servicePath: (s: { title: string }) => `/services/${s.title.toLowerCase()}`,
    }))
    const { ClaudeHomeServices } = await import("@/components/claude-home-services")
    render(<ClaudeHomeServices />)
    expect(screen.getByRole("heading", { level: 3, name: "Bare Service" })).toBeInTheDocument()
  })
})

describe("ClaudeHomeArtists with an imageless artist", () => {
  it("renders the name without an image", async () => {
    vi.doMock("@/lib/data/artists", () => ({
      getArtists: () => [{ id: "bare", name: "Bare Artist", genre: "House" }],
      artistSlug: (name: string) => name.toLowerCase().replace(/\s+/g, "-"),
    }))
    const { ClaudeHomeArtists } = await import("@/components/claude-home-artists")
    render(<ClaudeHomeArtists />)
    expect(screen.getByText("Bare Artist")).toBeInTheDocument()
  })
})

describe("ClaudeHomeBrands with an imageless brand", () => {
  it("renders the card without an image", async () => {
    vi.doMock("@/lib/data/brands", () => ({
      getBrandsByDivision: () => ({
        liveEvents: [{ key: "bare", tag: "BARE", title: "BARE", accent: "#fff" }],
        corporateMedia: [],
      }),
      brandPath: (b: { key: string }) => `/brands/${b.key}`,
      brandPlainTitle: (b: { title: string }) => b.title,
      PLATFORM_PROGRAMS: [],
    }))
    const { ClaudeHomeBrands } = await import("@/components/claude-home-brands")
    render(<ClaudeHomeBrands />)
    expect(screen.getAllByText("BARE").length).toBeGreaterThan(0)
  })
})

describe("LazyLoopVideo under prefers-reduced-motion", () => {
  it("renders the poster image only, no <video> element", async () => {
    const mql = {
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList
    const mediaSpy = vi.spyOn(window, "matchMedia").mockReturnValue(mql)
    const { LazyLoopVideo } = await import("@/components/lazy-loop-video")
    const { container } = render(
      <LazyLoopVideo srcMp4="/events/seaside_series.mp4" srcWebm="/events/seaside_series.webm" poster="/events/seaside_series_dj.webp" />
    )
    expect(container.querySelector("video")).toBeNull()
    expect(container.querySelector("img")).toHaveAttribute("src", "/events/seaside_series_dj.webp")
    mediaSpy.mockRestore()
  })
})

describe("LazyLoopVideo's play/pause wiring to its on-screen state", () => {
  /**
   * Mirrors the MockIntersectionObserver pattern in
   * deferred-home-section.behavior.test.tsx: framer-motion's useInView (see
   * node_modules/framer-motion/.../viewport/index.mjs) talks to a real
   * IntersectionObserver, which happy-dom doesn't implement, so tests need a
   * fake one they can fire entries through by hand to drive isInView.
   */
  type IoEntry = { isIntersecting: boolean; target: Element }
  let ioInstances: Array<{ fire: (entries: IoEntry[]) => void; target: Element | null }> = []

  beforeEach(() => {
    ioInstances = []
    class MockIntersectionObserver {
      private readonly cb: IntersectionObserverCallback
      private target: Element | null = null
      constructor(cb: IntersectionObserverCallback) {
        this.cb = cb
      }
      observe(target: Element) {
        this.target = target
        ioInstances.push({
          target,
          fire: (entries) => this.cb(entries as unknown as IntersectionObserverEntry[], this as unknown as IntersectionObserver),
        })
      }
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
    }
    globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  it("plays the video once it scrolls into view, and pauses it again once it scrolls out", async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
    const { LazyLoopVideo } = await import("@/components/lazy-loop-video")
    const { container } = render(
      <LazyLoopVideo srcMp4="/events/seaside_series.mp4" srcWebm="/events/seaside_series.webm" poster="/events/seaside_series_dj.webp" />
    )
    const video = container.querySelector("video")
    expect(video).not.toBeNull()
    expect(ioInstances.length).toBe(1)
    // Mounts out-of-view (isInView starts false), so the effect's initial
    // run already takes the el.pause() branch once before any IO entry fires.
    const pauseCallsBeforeEntering = pauseSpy.mock.calls.length

    act(() => {
      ioInstances[0].fire([{ isIntersecting: true, target: video! }])
    })
    expect(playSpy).toHaveBeenCalledTimes(1)
    expect(pauseSpy.mock.calls.length).toBe(pauseCallsBeforeEntering)

    act(() => {
      ioInstances[0].fire([{ isIntersecting: false, target: video! }])
    })
    expect(pauseSpy.mock.calls.length).toBe(pauseCallsBeforeEntering + 1)

    playSpy.mockRestore()
    pauseSpy.mockRestore()
  })
})

describe("ThemeToggle inside a real ThemeProvider", () => {
  it("flips from dark to light and shows the matching icon/label", async () => {
    const user = userEvent.setup()
    const { ClaudeHomeNavigation } = await import("@/components/claude-home-navigation")
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ClaudeHomeNavigation />
      </ThemeProvider>
    )
    const switchControl = await screen.findByLabelText("Turn light on")
    await user.click(switchControl)
    expect(await screen.findByLabelText("Turn light off")).toBeInTheDocument()
  })
})
