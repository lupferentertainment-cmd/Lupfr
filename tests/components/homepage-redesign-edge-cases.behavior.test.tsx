/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@/components/theme-provider"
import { ClaudeHomeHero } from "@/components/claude-home-hero"
import { ClaudeHomeTeam } from "@/components/claude-home-team"

/**
 * Optional-field branches on the new homepage sections (missing image,
 * no quote/stats) that never occur in today's real content — mocked here
 * so they're exercised once instead of only ever running the "every field
 * present" path. ClaudeHomeExperiences (Oct 1 2026 redesign v2: curated
 * case studies, see claude-home-experiences.tsx) has no such optional-field
 * branch of its own — its video/no-video split is already covered by the 3
 * real case studies in homepage-redesign.behavior.test.tsx.
 *
 * ClaudeHomeMedia's "LUPFR in the News" lead card gained an optional
 * `image` field (2026-10-02 fix, round 4) whose real data always has one on
 * the newest/lead item today — covered below with the imageless branch.
 */

afterEach(() => {
  vi.resetModules()
  vi.doUnmock("@/lib/events")
  vi.doUnmock("@/lib/data/team")
  vi.doUnmock("@/lib/data/services")
  vi.doUnmock("@/lib/data/artists")
  vi.doUnmock("@/lib/data/brands")
  vi.doUnmock("@/lib/data/news")
})

describe("ClaudeHomeHero's background picker", () => {
  // 2026-10-02 fix, round 2: the hero's 3-item picker (Bal Masque / SEA//SIDE
  // / Golden Gate) defaults to Bal Masque's real video. 2026-10-03 fix: the
  // Golden Gate tab used to have no real video asset (photo-only fallback
  // branch) — the owner has since supplied a real clip for it
  // (public/events/ggl_main_video.{mp4,webm}), so all 3 tabs now always
  // render a video and that fallback branch no longer exists in the
  // component. This just exercises switching tabs and picking up the new
  // tab's own video source.
  it("switches the video source when the Golden Gate tab is picked", async () => {
    const user = userEvent.setup()
    const { container } = render(<ClaudeHomeHero />)
    await user.click(screen.getByText(/Golden Gate/))
    const video = container.querySelector("video")
    expect(video?.getAttribute("poster")).toBe("/events/ggl_main_dj.webp")
    expect(container.querySelector("source[src='/events/ggl_main_video.mp4']")).toBeInTheDocument()
  })
})

// 2026-10-03 fix (owner: "needs to automatically move thru each hero
// video") — the picker used to be click-only; it now also advances itself
// on a timer, paused under prefers-reduced-motion the same way
// LazyLoopVideo's own playback already is.
describe("ClaudeHomeHero's auto-advance", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it("moves to the next tab on its own after the autoplay interval", () => {
    const { container } = render(<ClaudeHomeHero />)
    expect(container.querySelector("source[src='/events/bal_masque_loop.mp4']")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(7000)
    })
    expect(container.querySelector("source[src='/events/seaside_series.mp4']")).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(7000)
    })
    expect(container.querySelector("source[src='/events/ggl_main_video.mp4']")).toBeInTheDocument()
  })

  it("does not auto-advance for a visitor who prefers reduced motion", () => {
    // Under reduced motion LazyLoopVideo itself also falls back to a plain
    // poster <img> (no <video>/<source> at all — see its own test coverage
    // in homepage-redesign-edge-cases above), so the signal to check here is
    // that the poster image never changes off Bal Masque's, not the
    // <source> element this suite's other Hero tests look for.
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
    const { container } = render(<ClaudeHomeHero />)
    act(() => {
      vi.advanceTimersByTime(20000)
    })
    expect(container.querySelector("img[src='/events/bal_masque_wings.webp']")).toBeInTheDocument()
    expect(container.querySelector("img[src='/events/seaside_series_dj.webp']")).toBeNull()
    mediaSpy.mockRestore()
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
  // The component now picks its 7 cards by name from the design file's own
  // home-wall list (round 4 fix) rather than slicing the roster, so a mock
  // roster entry has to use one of those 7 names (HLWA here) to render.
  it("renders the name without an image", async () => {
    vi.doMock("@/lib/data/artists", () => ({
      getArtists: () => [{ id: "bare", name: "HLWA", genre: "House" }],
      artistSlug: (name: string) => name.toLowerCase().replace(/\s+/g, "-"),
    }))
    const { ClaudeHomeArtists } = await import("@/components/claude-home-artists")
    render(<ClaudeHomeArtists />)
    expect(screen.getByText("HLWA")).toBeInTheDocument()
  })
})

// 2026-10-04 fix, round 10 (owner, mobile screenshot: "We also need PLS&TY
// to be colored until you select another artist") — mobile has no hover,
// so the wall's first/default card needs to render colored without one.
describe("ClaudeHomeArtists' default-active tile", () => {
  it("renders the first card (PLS&TY) in color by default, and swaps which one is colored on hover", async () => {
    const { ClaudeHomeArtists } = await import("@/components/claude-home-artists")
    const { container } = render(<ClaudeHomeArtists />)
    const tiles = container.querySelectorAll("a[href^='https://open.spotify.com'], a[href^='/artists?artist=']")
    expect(tiles.length).toBeGreaterThan(1)
    const firstImg = tiles[0]!.querySelector("img")
    const secondImg = tiles[1]!.querySelector("img")
    expect(firstImg).toHaveClass("grayscale-0")
    expect(firstImg).not.toHaveClass("grayscale")
    expect(secondImg).toHaveClass("grayscale")
    expect(secondImg).not.toHaveClass("grayscale-0")

    fireEvent.mouseEnter(tiles[1]!)
    expect(secondImg).toHaveClass("grayscale-0")
    expect(firstImg).toHaveClass("grayscale")

    // Keyboard/focus users (no mouse at all) get the same swap via onFocus.
    fireEvent.focus(tiles[0]!)
    expect(firstImg).toHaveClass("grayscale-0")
    expect(secondImg).toHaveClass("grayscale")
  })

  it("applies the real bento col/row spans at every breakpoint, not just lg:", async () => {
    const { ClaudeHomeArtists } = await import("@/components/claude-home-artists")
    const { container } = render(<ClaudeHomeArtists />)
    // PLS&TY is WALL_SPAN[0] = { col: 2, row: 2 } — used to only apply
    // col-span-2/row-span-2 at `lg:`, collapsing to a uniform 1x1 box below
    // that (round 10's complaint). Now applies unprefixed too.
    const firstTile = container.querySelectorAll("a[href^='https://open.spotify.com'], a[href^='/artists?artist=']")[0]!
    expect(firstTile).toHaveClass("col-span-2")
    expect(firstTile).toHaveClass("row-span-2")
  })
})

// 2026-10-04 fix, round 10 (owner, mobile screenshot: "We need to have the
// text of title and cities as one row each (instead of two rows per
// text)") — each span now forces a single line instead of being free to
// wrap mid-text.
describe("ClaudeHomeTeam's title/location row", () => {
  it("keeps the title and location each on a single line", () => {
    render(<ClaudeHomeTeam />)
    const title = screen.getByText("CEO & Founder")
    const location = screen.getByText("Los Angeles & San Francisco")
    expect(title).toHaveClass("whitespace-nowrap")
    expect(location).toHaveClass("whitespace-nowrap")
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

// 2026-10-04 fix, round 10 (owner, mobile screenshot: "The brands section
// needs to have the smaller tiles like our current website on mobile" /
// "Platform - the tiles also need to be designed like the screenshot of
// the brands (vertical and less height on mobile)") — both tabs' tiles
// used to share desktop's tall aspect-[3/4] below `lg:` too; now shorter
// (aspect-[4/3]) there, full aspect-[3/4] restored from `lg:`.
describe("ClaudeHomeBrands' mobile tile shape", () => {
  it("gives Operating-tab tiles a shorter aspect ratio below lg, restoring the taller one from lg:", async () => {
    const { ClaudeHomeBrands } = await import("@/components/claude-home-brands")
    const { container } = render(<ClaudeHomeBrands />)
    const tile = container.querySelector("a[href^='/brands/']")!
    expect(tile).toHaveClass("aspect-[4/3]")
    expect(tile).toHaveClass("lg:aspect-[3/4]")
  })

  it("gives Platform-tab tiles the same shorter mobile aspect ratio", async () => {
    const user = userEvent.setup()
    const { ClaudeHomeBrands } = await import("@/components/claude-home-brands")
    const { container } = render(<ClaudeHomeBrands />)
    await user.click(screen.getByRole("button", { name: "platform" }))
    const tile = [...container.querySelectorAll("div")].find((el) => el.className.includes("aspect-[4/3]"))
    expect(tile).toBeTruthy()
    expect(tile).toHaveClass("lg:aspect-[3/4]")
  })
})

describe("ClaudeHomeMedia's 'LUPFR in the News' lead card with no image", () => {
  it("renders the lead card without a background photo", async () => {
    vi.doMock("@/lib/data/news", () => ({
      getNews: () => [
        { id: 1, source: "Bare Source", dateISO: "2026-01-01", title: "Bare Headline", url: "https://example.com/bare" },
      ],
      newsDateLabel: () => "JAN 1, 2026",
    }))
    const { ClaudeHomeMedia } = await import("@/components/claude-home-media")
    render(<ClaudeHomeMedia />)
    expect(screen.getByText("Bare Headline")).toBeInTheDocument()
    // 3 side-clip posters always render (sideClips is fixed, not news data);
    // the lead card's own photo is the only `image` that's conditional, so
    // its absence here means exactly 3 decorative images, not 4.
    expect(screen.getAllByAltText("")).toHaveLength(3)
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
