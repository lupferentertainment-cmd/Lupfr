/** @vitest-environment happy-dom */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@/components/theme-provider"
import { ClaudeHomeHero } from "@/components/claude-home-hero"
import { ClaudeHomeExperiences } from "@/components/claude-home-experiences"
import { ClaudeHomeBrands } from "@/components/claude-home-brands"
import { ClaudeHomeServices } from "@/components/claude-home-services"
import { getServices } from "@/lib/data/services"

/**
 * Optional-field branches on the new homepage sections (missing image,
 * no quote/stats) that never occur in today's real content — mocked here
 * so they're exercised once instead of only ever running the "every field
 * present" path. ClaudeHomeExperiences (Oct 1 2026 redesign v2: curated
 * case studies, see claude-home-experiences.tsx) has no such optional-field
 * branch of its own — its video/no-video split is already covered by the 3
 * real case studies in homepage-redesign.behavior.test.tsx.
 *
 * MediaNewsFeature's "LUPFR in the News" lead card gained an optional
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

// LUPFR Website Design v5 (owner, 2026-11-17): Our Brands "Reveal" tiles. The
// v10 poster grid (division rules, 4 columns, wide HIGH//RISE/SOUND//CHECK
// tiles, 4:3 mobile tiles) is gone; these pin the v5 responsive classes. The
// compiled cascade order is checked in tests/unit/brands-desktop-breakpoint-css.test.ts.
describe("ClaudeHomeBrands' v5 Reveal responsive grid", () => {
  it("lays Operating tiles out 6-up, then 3 at <=1100px, 2 at <=720px, 1 at <=480px", () => {
    render(<ClaudeHomeBrands />)
    const grid = screen.getByTestId("brands-grid-operating")
    expect(grid).toHaveClass("grid-cols-6", "max-[1100px]:grid-cols-3", "max-[720px]:grid-cols-2", "max-[480px]:grid-cols-1", "gap-[10px]")
  })

  it("gives every tile the 3:4 shape, becoming 5:3 at <=480px", () => {
    const { container } = render(<ClaudeHomeBrands />)
    for (const tile of container.querySelectorAll("a[href^='/brands/']")) {
      expect(tile).toHaveClass("aspect-[3/4]", "max-[480px]:aspect-[5/3]", "rounded-[4px]")
    }
  })

  it("lays Platform tiles out 5-up with the same responsive steps and shape", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeBrands />)
    await user.click(screen.getByRole("button", { name: "platform" }))
    const grid = screen.getByTestId("brands-grid-platform")
    expect(grid).toHaveClass("grid-cols-5", "max-[1100px]:grid-cols-3", "max-[720px]:grid-cols-2", "max-[480px]:grid-cols-1")
    expect(grid.children).toHaveLength(5)
    for (const tile of grid.children) expect(tile).toHaveClass("aspect-[3/4]")
  })

  it("turns the small labels into off-white dark pills at <=900px and drops the brand wash at <=1100px", () => {
    render(<ClaudeHomeBrands />)
    const label = screen.getAllByTestId("brand-label")[0]!
    expect(label).toHaveClass("max-[900px]:text-[#f3efe6]", "max-[900px]:bg-[rgba(8,7,6,0.72)]")
    expect(screen.getAllByTestId("brand-wash")[0]).toHaveClass("opacity-[.22]", "group-hover:opacity-40", "max-[1100px]:hidden")
  })

  it("reveals the description on hover (max-h 90px) and always shows it at <=1100px", () => {
    render(<ClaudeHomeBrands />)
    const description = screen.getByText(/Indoor live music experiences/)
    expect(description).toHaveClass("max-h-0", "group-hover:max-h-[90px]", "max-[1100px]:max-h-[90px]", "max-[1100px]:opacity-100")
    expect(screen.getAllByTestId("brand-bar")[0]).toHaveClass("scale-x-[.18]", "group-hover:scale-x-100")
  })
})

// 2026-10-04 fix, round 11 (owner, Claude design mobile screenshot: "Hero...
// needs to be designed like the screenshot I have from the claude design")
// — the media panel's left-edge mask and heavy dark gradient only ever
// made sense for the `md:`+ two-column layout; content now anchors to the
// bottom on mobile instead of vertically centering.
describe("ClaudeHomeHero's mobile layout", () => {
  it("has no left-edge mask below md:, and restores it from md: up", () => {
    const { container } = render(<ClaudeHomeHero />)
    const mediaPanel = container.querySelector("video")!.closest("div.absolute")!
    // Unprefixed (mobile) class must be absent — only the md:-prefixed one exists.
    expect(mediaPanel.classList.contains("[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.55)_16%,#000_38%)]")).toBe(false)
    expect(mediaPanel).toHaveClass("md:[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.55)_16%,#000_38%)]")
  })

  it("anchors content to the bottom below md:, centered from md: up", () => {
    const { container } = render(<ClaudeHomeHero />)
    const contentRow = container.querySelector("h1")!.closest("div.relative.z-10")!
    expect(contentRow).toHaveClass("items-end")
    expect(contentRow).toHaveClass("md:items-center")
  })
})

// LUPFR Website Design v5 (owner, 2026-11-17): Services is a 3x2 grid of photo
// cards (number, icon, title, description only) with the Plan Your Event
// button in the header; at <=900px it is a swipe row with the button below.
describe("ClaudeHomeServices' v5 card grid", () => {
  it("renders one card per service with number, title and description, and no included-items list", () => {
    const services = getServices()
    render(<ClaudeHomeServices />)
    const cards = screen.getAllByTestId("service-card")
    expect(cards).toHaveLength(services.length)
    services.forEach((service, i) => {
      const card = within(cards[i]!)
      expect(card.getByText(String(i + 1).padStart(2, "0"))).toBeInTheDocument()
      expect(card.getByRole("heading", { level: 3, name: service.title })).toBeInTheDocument()
      expect(card.getByText(service.description)).toBeInTheDocument()
      expect(cards[i]!.querySelector("ul")).toBeNull()
    })
  })

  it("uses the v5 card shape: 16:10, 4:3 from 901 to 1250px, then a vertical tile stack (not a carousel) at <=900px", () => {
    render(<ClaudeHomeServices />)
    expect(screen.getAllByTestId("service-card")[0]).toHaveClass(
      "aspect-[16/10]",
      "max-[1250px]:min-[901px]:aspect-[4/3]",
      "max-[900px]:aspect-[4/3]",
      "max-[560px]:aspect-[5/3]",
      "rounded-[4px]"
    )
    const grid = screen.getByTestId("services-grid")
    expect(grid).toHaveClass("grid-cols-3", "max-[900px]:grid-cols-2", "max-[560px]:grid-cols-1")
    expect(grid.className).not.toMatch(/snap-x|overflow-x-auto/)
  })

  it("puts Plan Your Event in the header (hidden <=900px) and again below the cards", () => {
    render(<ClaudeHomeServices />)
    const header = screen.getByTestId("services-header-cta")
    expect(header).toHaveAttribute("href", "/contact")
    expect(header).toHaveClass("max-[900px]:hidden")
    expect(screen.getByTestId("services-footer-cta")).toHaveAttribute("href", "/contact")
    expect(screen.queryByText(/SWIPE/)).not.toBeInTheDocument()
  })

  it("shows the heading 'Idea to execution.' with the v5 subtitle", () => {
    render(<ClaudeHomeServices />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Idea to execution.")
    expect(screen.getByText("All an event needs in one place.")).toBeInTheDocument()
  })

  it("applies the per-card photo focus from the design (Venue Programming 40%, Production 55%)", () => {
    const { container } = render(<ClaudeHomeServices />)
    const positions = [...container.querySelectorAll("[data-testid=service-card] img")].map((img) => (img as HTMLElement).style.objectPosition)
    expect(positions).toEqual(["50% 45%", "50% 45%", "50% 40%", "50% 40%", "50% 55%", "50% 35%"])
  })

  it("renders an imageless, iconless service without a photo or badge", async () => {
    vi.doMock("@/lib/data/services", () => ({
      getServices: () => [{ title: "Bare Service", description: "A plain service.", features: [] }],
    }))
    const { ClaudeHomeServices: Mocked } = await import("@/components/claude-home-services")
    render(<Mocked />)
    const card = within(screen.getByTestId("service-card"))
    expect(card.getByText("A plain service.")).toBeInTheDocument()
    expect(card.queryByRole("img")).not.toBeInTheDocument()
  })
})

// LUPFR Website Design v5 (owner, 2026-11-17): Featured Experiences "Stack".
describe("ClaudeHomeExperiences' v5 sticky stack", () => {
  it("pins each full-width card at 92px + index x 16px with the v5 height and radius", () => {
    render(<ClaudeHomeExperiences />)
    const cards = screen.getAllByTestId("experience-card")
    expect(cards).toHaveLength(3)
    cards.forEach((card, i) => {
      expect(card).toHaveClass("sticky", "h-[min(80vh,760px)]", "min-h-[540px]", "rounded-[4px]", "max-[900px]:h-[74vh]", "max-[900px]:max-h-[640px]")
      expect(card.style.top).toBe(`${92 + i * 16}px`)
    })
  })

  it("shows '01 / 03' counters and the (02) OUR WORK header with a View Past Events link", () => {
    render(<ClaudeHomeExperiences />)
    for (const counter of ["01 / 03", "02 / 03", "03 / 03"]) expect(screen.getByText(counter)).toBeInTheDocument()
    expect(screen.getByText("(02)")).toBeInTheDocument()
    expect(screen.getByText("OUR WORK")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "Featured Experiences" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "View Past Events →" })).toHaveAttribute("href", "/events")
  })

  it("explains what Featured Experiences are with a one-line subtext under the heading", () => {
    render(<ClaudeHomeExperiences />)
    const heading = screen.getByRole("heading", { level: 2, name: "Featured Experiences" })
    const subtext = heading.nextElementSibling
    expect(subtext?.tagName).toBe("P")
    expect(subtext).toHaveTextContent(/floating concerts, brand activations, and live-music events/)
  })

  it("hides the description, chips, meta line and thumbnails on mobile / below 1100px, keeping title and buttons", () => {
    render(<ClaudeHomeExperiences />)
    const card = within(screen.getAllByTestId("experience-card")[1]!)
    expect(card.getByRole("heading", { level: 3 })).toHaveClass("max-[900px]:text-[40px]")
    expect(card.getByText(/Masquerade evenings with Maison Noir/)).toHaveClass("max-[900px]:hidden")
    expect(card.getByTestId("experience-thumbs")).toHaveClass("max-[1100px]:hidden")
    expect(card.getByRole("link", { name: /Create One Like This/ })).toHaveAttribute("href", "/contact")
  })

  it("links service chips to #services and only shows Watch Film when a film URL exists", () => {
    render(<ClaudeHomeExperiences />)
    const [seaside, bal, golden] = screen.getAllByTestId("experience-card").map((c) => within(c))
    expect(seaside!.getAllByRole("link", { name: /PRODUCTION/ })[0]).toHaveAttribute("href", "#services")
    expect(seaside!.getByRole("link", { name: "Watch Film" })).toHaveAttribute("href", "https://www.instagram.com/p/DdrQLrbpPqr/")
    expect(bal!.getByRole("link", { name: "Watch Film" })).toHaveAttribute("href", "https://www.youtube.com/watch?v=Xt6zGwZ7jKg")
    expect(golden!.queryByRole("link", { name: "Watch Film" })).toBeNull()
  })

  it("keeps the CURRENT Golden Gate loop video on the Zusebi card — no YouTube background or embed (owner, 2026-11-17)", () => {
    const { container } = render(<ClaudeHomeExperiences />)
    const golden = screen.getAllByTestId("experience-card")[2]!
    expect(golden.innerHTML).toContain("ggl_main_video")
    expect(container.querySelector("iframe")).toBeNull()
    expect(container.innerHTML).not.toContain("2w09dEQpz2E")
  })
})

describe("MediaNewsFeature's lead card with no image", () => {
  it("renders the lead card without a background photo", async () => {
    vi.doMock("@/lib/data/news", () => ({
      getHomeNews: () => [
        { id: 1, source: "Bare Source", dateISO: "2026-01-01", title: "Bare Headline", url: "https://example.com/bare" },
      ],
      newsDateLabel: () => "JAN 1, 2026",
    }))
    const { MediaNewsFeature } = await import("@/components/media-news-feature")
    render(<MediaNewsFeature />)
    expect(screen.getByText("Bare Headline")).toBeInTheDocument()
    // The lead card's photo is the only image in this block, so no image
    // renders when the item has none.
    expect(screen.queryAllByAltText("")).toHaveLength(0)
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
    // Two observers: [0] on-screen (play/pause), [1] near-screen (start buffering early).
    expect(ioInstances.length).toBe(2)
    expect(video).toHaveAttribute("preload", "none")
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

  it("starts buffering when the clip is near the viewport, before it is on screen", async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
    const { LazyLoopVideo } = await import("@/components/lazy-loop-video")
    const { container } = render(<LazyLoopVideo srcMp4="/a.mp4" poster="/a.webp" />)
    const video = container.querySelector("video")!
    act(() => {
      ioInstances[1].fire([{ isIntersecting: true, target: video }])
    })
    expect(video).toHaveAttribute("preload", "auto")
    expect(playSpy).not.toHaveBeenCalled()
    playSpy.mockRestore()
  })

  it("retries play() when data arrives after a rejected first attempt", async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockRejectedValue(new Error("no data yet"))
    const { LazyLoopVideo } = await import("@/components/lazy-loop-video")
    const { container } = render(<LazyLoopVideo srcMp4="/a.mp4" poster="/a.webp" />)
    const video = container.querySelector("video")!
    act(() => {
      ioInstances[0].fire([{ isIntersecting: true, target: video }])
    })
    expect(playSpy).toHaveBeenCalledTimes(1)
    act(() => {
      video.dispatchEvent(new Event("canplay"))
    })
    expect(playSpy).toHaveBeenCalledTimes(2)
    playSpy.mockRestore()
  })

  it("stays paused while suspended (covered stack card) and plays again when uncovered", async () => {
    const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue(undefined)
    const pauseSpy = vi.spyOn(window.HTMLMediaElement.prototype, "pause").mockImplementation(() => {})
    const { LazyLoopVideo } = await import("@/components/lazy-loop-video")
    const { container, rerender } = render(<LazyLoopVideo srcMp4="/a.mp4" poster="/a.webp" suspended />)
    const video = container.querySelector("video")!
    act(() => {
      ioInstances[0].fire([{ isIntersecting: true, target: video }])
    })
    expect(playSpy).not.toHaveBeenCalled()
    rerender(<LazyLoopVideo srcMp4="/a.mp4" poster="/a.webp" suspended={false} />)
    expect(playSpy).toHaveBeenCalledTimes(1)
    playSpy.mockRestore()
    pauseSpy.mockRestore()
  })
})

describe("ThemeToggle click sound", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("plays a short Web Audio click with withSound, and stays silent if AudioContext throws", async () => {
    const user = userEvent.setup()
    const { ThemeToggle } = await import("@/components/theme-toggle")
    const param = { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
    const osc = { connect: vi.fn(), frequency: param, type: "", start: vi.fn(), stop: vi.fn() }
    const ctor = vi.fn(function () {
      return { createOscillator: () => osc, createGain: () => ({ connect: vi.fn(), gain: param }), destination: {}, currentTime: 0 }
    })
    vi.stubGlobal("AudioContext", ctor)
    window.AudioContext = ctor as unknown as typeof AudioContext
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ThemeToggle withSound />
      </ThemeProvider>
    )
    await user.click(await screen.findByRole("switch"))
    expect(osc.start).toHaveBeenCalledTimes(1)

    window.AudioContext = vi.fn(function () {
      throw new Error("blocked")
    }) as unknown as typeof AudioContext
    await user.click(await screen.findByRole("switch"))
    expect(osc.start).toHaveBeenCalledTimes(1)
  })
})

describe("ThemeToggle inside a real ThemeProvider", () => {
  it("flips from dark to light and shows the matching icon/label", async () => {
    const user = userEvent.setup()
    const { ThemeToggle } = await import("@/components/theme-toggle")
    render(
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <ThemeToggle />
      </ThemeProvider>
    )
    const switchControl = await screen.findByLabelText("Turn light on")
    await user.click(switchControl)
    expect(await screen.findByLabelText("Turn light off")).toBeInTheDocument()
  })
})

// LUPFR Website Design v5 (owner, 2026-11-17) — Our Brands content.
describe("ClaudeHomeBrands' v5 content", () => {
  it("reads '(03) ELEVEN PLATFORMS. ONE COMPANY.' with the Explore LUPFR link and no division labels", () => {
    const { container } = render(<ClaudeHomeBrands />)
    expect(screen.getByText("ELEVEN PLATFORMS. ONE COMPANY.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Explore LUPFR →" })).toHaveAttribute("href", "/brands")
    expect(container.querySelector("[data-division-label]")).toBeNull()
  })

  it("orders the Operating tiles SEA//SIDE, IN//SIDE, OUT//SIDE, SKI//SIDE, HIGH//RISE, SOUND//CHECK with 01–06 numbers", () => {
    const { container } = render(<ClaudeHomeBrands />)
    const hrefs = [...container.querySelectorAll("a[href^='/brands/']")].map((a) => a.getAttribute("href"))
    expect(hrefs).toEqual(["/brands/seaside", "/brands/inside", "/brands/outside", "/brands/skiside", "/brands/highrise", "/brands/soundcheck"])
    for (const n of ["01", "02", "03", "04", "05", "06"]) expect(screen.getByText(n)).toBeInTheDocument()
  })

  it("uses descriptor-only small labels — the brand name is the title right below, so it is never repeated", () => {
    render(<ClaudeHomeBrands />)
    expect(screen.getAllByTestId("brand-label").map((l) => l.textContent)).toEqual([
      "OFFSHORE EXPERIENCES",
      "INDOOR NIGHTS",
      "OPEN-AIR GATHERINGS",
      "APRÈS-SKI EXPERIENCES",
      "CORPORATE",
      "MEDIA",
    ])
  })

  it("shows the five Platform tiles labelled VIP, PROMOTER, MEDIA, HOSPITALITY, VENTURES with numbers 06–10", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeBrands />)
    await user.click(screen.getByRole("button", { name: "platform" }))
    expect(screen.getAllByTestId("brand-label").map((l) => l.textContent)).toEqual(["VIP", "PROMOTER", "MEDIA", "HOSPITALITY", "VENTURES"])
    for (const n of ["06", "07", "08", "09", "10"]) expect(screen.getByText(n)).toBeInTheDocument()
  })

  it("keeps SKI//SIDE's slash-mark image with an accessible '//', and text '//' for brands without one", () => {
    const { container } = render(<ClaudeHomeBrands />)
    const ski = container.querySelector("a[href='/brands/skiside']") as HTMLElement
    const heading = within(ski).getByRole("heading", { level: 3 })
    expect(heading.textContent).toBe("SKI//SIDE")
    expect(heading.querySelector("[data-brand-slash-image]")).not.toBeNull()
    const seaside = container.querySelector("a[href='/brands/seaside']") as HTMLElement
    expect(seaside.querySelector(".lupfr-brand-slash")).not.toBeNull()
    expect(seaside.querySelector("[data-brand-slash-image]")).toBeNull()
  })
})
