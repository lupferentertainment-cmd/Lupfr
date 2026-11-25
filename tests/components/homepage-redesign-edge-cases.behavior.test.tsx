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

describe("ClaudeHomeHero's v6 composition", () => {
  // v6 (owner, 2026-11-24): the 01/02/03 picker is gone; the three event videos still rotate on a timer behind the
  // centred mark, over the gold production photo, which is always rendered underneath as the fallback.
  it("has no picker buttons, keeps the gold fallback photo and starts on Bal Masque's video", () => {
    const { container } = render(<ClaudeHomeHero />)
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByTestId("hero-fallback").getAttribute("src")).toContain("hero-gold-fallback")
    expect(container.querySelector("video")?.getAttribute("poster")).toBe("/events/bal_masque_wings.webp")
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

describe("ClaudeHomeBrands without brand data", () => {
  it("still links each card to /brands/<key> when the brand record is missing", async () => {
    vi.doMock("@/lib/data/brands", () => ({
      getBrandBySlug: () => undefined,
      brandPath: (b: { key: string }) => `/brands/${b.key}`,
    }))
    const { ClaudeHomeBrands } = await import("@/components/claude-home-brands")
    const { container } = render(<ClaudeHomeBrands />)
    expect([...container.querySelectorAll("a[href^='/brands/']")].map((a) => a.getAttribute("href"))).toEqual([
      "/brands/seaside",
      "/brands/inside",
      "/brands/outside",
      "/brands/skiside",
    ])
  })
})

// LUPFR Website Design v6 (owner, 2026-11-24): Our Brands is four photo cards.
describe("ClaudeHomeBrands' v6 grid", () => {
  it("lays four cards out 4-up, then 2-up at <=900px, each a 3:4 photo", () => {
    const { container } = render(<ClaudeHomeBrands />)
    expect(screen.getByTestId("brands-grid")).toHaveClass("grid-cols-4", "max-[900px]:grid-cols-2")
    for (const card of screen.getAllByTestId("brand-card")) {
      expect(card.querySelector("div.relative")).toHaveClass("aspect-[3/4]")
    }
    expect(container.querySelectorAll("[data-testid=brand-card]")).toHaveLength(4)
  })
})

// v6 (owner, 2026-11-24): full-screen hero behind the nav, thin low-key "//" dividers, dark fade at the top.
describe("ClaudeHomeHero's v6 layout", () => {
  it("is a full-screen section with a dark top fade for the transparent nav", () => {
    render(<ClaudeHomeHero />)
    const hero = document.getElementById("hero")!
    expect(hero).toHaveClass("h-[100svh]")
    expect(hero.className).not.toContain("pt-[76px]")
    expect(screen.getByTestId("hero-top-fade").className).toContain("rgba(7,6,5,0.85)_0%")
  })

  it("centres the LE mark and keeps an sr-only h1", () => {
    render(<ClaudeHomeHero />)
    expect(screen.getByTestId("hero-logo")).toHaveClass("left-1/2", "top-[42%]", "-translate-x-1/2")
    expect(screen.getByRole("heading", { level: 1, name: "LUPFR Entertainment" })).toHaveClass("sr-only")
  })

  it("renders the tagline dividers thin and low-key", () => {
    render(<ClaudeHomeHero />)
    const dividers = [...screen.getByTestId("hero-tagline").querySelectorAll("span[aria-hidden]")].filter((el) => el.textContent === "//")
    expect(dividers).toHaveLength(2)
    for (const d of dividers) expect(d).toHaveClass("font-light", "opacity-70")
  })
})

// LUPFR Website Design v6 (owner, 2026-11-24): Services is two rows of three slanted tiles with a Services / Platforms toggle.
describe("ClaudeHomeServices' v6 tiles", () => {
  it("renders one tile per service with outlined number, one-line title and description, and no included-items list", () => {
    const services = getServices()
    render(<ClaudeHomeServices />)
    const cards = screen.getAllByTestId("service-card")
    expect(cards).toHaveLength(services.length)
    services.forEach((service, i) => {
      const card = within(cards[i]!)
      expect(card.getByText(String(i + 1).padStart(2, "0"))).toBeInTheDocument()
      const title = card.getByRole("heading", { level: 3, name: service.title })
      expect(title).toHaveClass("whitespace-nowrap")
      expect(card.getByText(service.description)).toBeInTheDocument()
      expect(cards[i]!.querySelector("ul")).toBeNull()
    })
  })

  it("lays the tiles out as two rows of three slanted tiles that stack at <=900px", () => {
    render(<ClaudeHomeServices />)
    const cards = screen.getAllByTestId("service-card")
    expect(cards[0]).toHaveClass("aspect-[2/1]", "[clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)]", "max-[900px]:h-[190px]", "max-[900px]:w-full")
    expect(cards[1]).toHaveClass("-ml-[2.265%]", "max-[900px]:ml-0")
    expect(cards[0]).not.toHaveClass("-ml-[2.265%]")
    const rows = screen.getByTestId("services-grid").children
    expect(rows).toHaveLength(2)
    expect(rows[0]!.children).toHaveLength(3)
    expect(rows[1]!.children).toHaveLength(3)
    expect(rows[0]).toHaveClass("max-[900px]:flex-col")
  })

  it("switches to the five platform tiles (numbered 07-11) and back", async () => {
    const user = userEvent.setup()
    render(<ClaudeHomeServices />)
    const toggle = screen.getByRole("group", { name: "Services or platforms" })
    expect(within(toggle).getByRole("button", { name: /Services/ })).toHaveAttribute("aria-pressed", "true")
    await user.click(within(toggle).getByRole("button", { name: /Platforms/ }))
    expect(screen.getByTestId("services-grid")).toHaveAttribute("data-tab", "platforms")
    const cards = screen.getAllByTestId("service-card")
    expect(cards.map((c) => within(c).getByRole("heading", { level: 3 }).textContent)).toEqual([
      "LUPFR VIP",
      "LP Program",
      "LUPFR Media",
      "LUPFR Hospitality",
      "LUPFR Ventures",
    ])
    for (const n of ["07", "08", "09", "10", "11"]) expect(screen.getByText(n)).toBeInTheDocument()
    expect(screen.getByTestId("services-grid").children[1]!.children).toHaveLength(2)
    await user.click(within(toggle).getByRole("button", { name: /Services/ }))
    expect(screen.getAllByTestId("service-card")).toHaveLength(6)
  })

  it("keeps Plan Your Event in the header and makes Plan Your Full Event a low-key text link under the tiles", () => {
    render(<ClaudeHomeServices />)
    expect(screen.getByTestId("services-header-cta")).toHaveAttribute("href", "/contact")
    const strip = screen.getByTestId("services-footer-cta")
    expect(strip).toHaveAttribute("href", "/contact")
    expect(strip).toHaveTextContent("Plan Your Full Event")
    expect(strip.className).not.toContain("btn-metallic-gold")
    expect(screen.getByText("Full event design & execution")).toBeInTheDocument()
  })

  it("shows the heading 'Idea to execution.' with no subtitle", () => {
    render(<ClaudeHomeServices />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Idea to execution.")
    expect(screen.queryByText("All an event needs in one place.")).not.toBeInTheDocument()
  })

  it("applies the per-tile photo focus from the design (Venue Programming 40%, Production 55%)", () => {
    const { container } = render(<ClaudeHomeServices />)
    const positions = [...container.querySelectorAll("[data-testid=service-card] img")].map((img) => (img as HTMLElement).style.objectPosition)
    expect(positions).toEqual(["50% 45%", "50% 45%", "50% 40%", "50% 40%", "50% 55%", "50% 35%"])
  })

  it("renders an imageless service without a photo", async () => {
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
    expect(cards).toHaveLength(4)
    cards.forEach((card, i) => {
      expect(card).toHaveClass("sticky", "h-[min(80vh,760px)]", "min-h-[540px]", "rounded-[4px]", "max-[900px]:h-[74vh]", "max-[900px]:max-h-[640px]")
      expect(card.style.top).toBe(`${92 + i * 16}px`)
    })
  })

  it("shows '01 / 04' counters and the (03) OUR WORK header with a View Past Events link", () => {
    render(<ClaudeHomeExperiences />)
    for (const counter of ["01 / 04", "02 / 04", "03 / 04", "04 / 04"]) expect(screen.getByText(counter)).toBeInTheDocument()
    expect(screen.getByText("(03)")).toBeInTheDocument()
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

  it("ends with a SKI//SIDE 'Coming 2027' teaser card: clear photo, slash wordmark, pill and one button (owner, 2026-11-20)", () => {
    render(<ClaudeHomeExperiences />)
    const card = screen.getAllByTestId("experience-card")[3]!
    expect(card).toHaveAttribute("data-teaser")
    expect(card.style.top).toBe(`${92 + 3 * 16}px`)
    expect(card.querySelector("img")?.getAttribute("src")).toContain("skiside-summit-set")
    expect(within(card).getByRole("heading", { level: 3 })).toHaveTextContent("SKI//SIDE")
    expect(card.querySelector("[data-brand-slash-image]")).not.toBeNull()
    expect(within(card).getByText("COMING 2027")).toBeInTheDocument()
    expect(within(card).getByText("LAKE TAHOE")).toBeInTheDocument()
    expect(within(card).getByRole("link", { name: "Partner with SKI//SIDE" })).toHaveAttribute("href", "/contact")
    // Nothing delivered yet: no description, service chips, thumbnails, film or video.
    expect(within(card).queryByTestId("experience-thumbs")).toBeNull()
    expect(within(card).queryByRole("link", { name: /Watch Film|Create One Like This|PRODUCTION/ })).toBeNull()
    expect(card.querySelector("video")).toBeNull()
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

// LUPFR Website Design v6 (owner, 2026-11-24) — Our Brands content.
describe("ClaudeHomeBrands' v6 content", () => {
  it("reads '(02) OUR BRANDS', 'Find your side.' and the one-line intro, with no tabs", () => {
    render(<ClaudeHomeBrands />)
    expect(screen.getByText("(02)")).toBeInTheDocument()
    expect(screen.getByText("OUR BRANDS")).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Find your side.")
    expect(screen.getByText(/Four experience brands, one crew/)).toBeInTheDocument()
    expect(screen.queryByRole("button")).toBeNull()
    expect(screen.getByRole("link", { name: "Explore LUPFR →" })).toHaveAttribute("href", "/brands")
  })

  it("orders the cards SEA//SIDE, IN//SIDE, OUT//SIDE, SKI//SIDE with 01-04 numbers, each opening the brand page", () => {
    const { container } = render(<ClaudeHomeBrands />)
    const hrefs = [...container.querySelectorAll("a[href^='/brands/']")].map((a) => a.getAttribute("href"))
    expect(hrefs).toEqual(["/brands/seaside", "/brands/inside", "/brands/outside", "/brands/skiside"])
    for (const n of ["01", "02", "03", "04"]) expect(screen.getByText(n)).toBeInTheDocument()
  })

  it("shows each brand's tagline and no category tag", () => {
    const { container } = render(<ClaudeHomeBrands />)
    for (const line of ["Offshore Music Experiences", "The Night, Reimagined", "An Open Air Series", "Après ski, amplified."]) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
    for (const tag of ["YACHTS", "INDOORS", "OUTDOORS", "COMING 2027"]) expect(container.textContent).not.toContain(tag)
  })

  it("uses the v6 tile photos with a descriptive alt", () => {
    const { container } = render(<ClaudeHomeBrands />)
    const imgs = [...container.querySelectorAll("img")]
    expect(imgs).toHaveLength(4)
    expect(imgs.map((i) => i.getAttribute("alt"))).toEqual([
      "SEA SIDE by LUPFR Entertainment",
      "IN SIDE by LUPFR Entertainment",
      "OUT SIDE by LUPFR Entertainment",
      "SKI SIDE by LUPFR Entertainment",
    ])
  })
})
