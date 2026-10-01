/** @vitest-environment happy-dom */

import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "@/components/theme-provider"

/**
 * Optional-field branches on the new homepage sections (missing image,
 * missing subtitle, missing city, empty news, no quote/stats) that never
 * occur in today's real content — mocked here so they're exercised once
 * instead of only ever running the "every field present" path.
 */

afterEach(() => {
  vi.resetModules()
  vi.doUnmock("@/lib/events")
  vi.doUnmock("@/lib/data/team")
  vi.doUnmock("@/lib/data/services")
  vi.doUnmock("@/lib/data/news")
  vi.doUnmock("@/lib/data/artists")
  vi.doUnmock("@/lib/data/brands")
})

describe("ClaudeHomeExperiences with a bare-minimum event", () => {
  it("falls back to no image, no subtitle, and city 'LUPFR'", async () => {
    vi.doMock("@/lib/events", () => ({
      getUpcomingEvents: () => [{ slug: "bare-event", title: "Bare Event" }],
      getPastEvents: () => [],
      eventDetailPath: (slug: string) => `/events/${slug}`,
    }))
    const { ClaudeHomeExperiences } = await import("@/components/claude-home-experiences")
    render(<ClaudeHomeExperiences />)
    expect(screen.getByText("Bare Event")).toBeInTheDocument()
    expect(screen.getByText("LUPFR")).toBeInTheDocument()
  })
})

describe("ClaudeHomeTeam with a bare-minimum founder", () => {
  it("skips the image, quote, and stats blocks", async () => {
    vi.doMock("@/lib/data/team", () => ({
      getFounders: () => [{ name: "Jane Doe", title: "Founder", location: "LA", bio: "A short bio." }],
    }))
    const { ClaudeHomeTeam } = await import("@/components/claude-home-team")
    const { container } = render(<ClaudeHomeTeam />)
    expect(screen.getByText("Founder")).toBeInTheDocument()
    expect(container.querySelector("blockquote")).toBeNull()
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

describe("ClaudeHomeMedia with no news", () => {
  it("renders nothing", async () => {
    vi.doMock("@/lib/data/news", () => ({
      getNews: () => [],
      newsDateLabel: () => "",
    }))
    const { ClaudeHomeMedia } = await import("@/components/claude-home-media")
    const { container } = render(<ClaudeHomeMedia />)
    expect(container.querySelector("section")).toBeNull()
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
