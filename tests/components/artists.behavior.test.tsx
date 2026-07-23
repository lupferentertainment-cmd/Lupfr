/** @vitest-environment happy-dom */

import { fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Artists, ArtistsDirectory } from "@/components/artists"
import { artistSlug, getArtists } from "@/lib/data/artists"

describe("Artists home section", () => {
  it("shows six featured cards and keeps every artist in the aligned name roster", () => {
    const artists = getArtists()
    const { container } = render(<Artists />)

    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(artists.slice(0, 6).map((artist) => artist.name))

    const roster = screen.getByRole("list", { name: "Artist roster" })
    expect(within(roster).getAllByRole("listitem")).toHaveLength(artists.length)
    for (const artist of artists) {
      expect(within(roster).getByText(artist.name)).toBeInTheDocument()
    }

    expect(roster.querySelectorAll(".heading-metallic-gold")).toHaveLength(6)
    expect(roster.querySelector(".bg-accent")).toBeNull()
    expect(container.querySelector('a[href="/artists"]')).toHaveTextContent("View all artists")
  })

  it("links every roster name to its artist in the /artists directory", () => {
    const artists = getArtists()
    render(<Artists />)

    const roster = screen.getByRole("list", { name: "Artist roster" })
    const links = within(roster).getAllByRole("link")
    expect(links).toHaveLength(artists.length)
    for (const artist of artists) {
      expect(
        within(roster).getByRole("link", { name: `View ${artist.name} in the artists directory` }),
      ).toHaveAttribute("href", `/artists?artist=${artistSlug(artist.name)}`)
    }
  })

  it("keeps the full directory sortable and filterable with an empty-state fallback", () => {
    const artists = getArtists()
    render(<ArtistsDirectory />)

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(artists.length)

    fireEvent.click(screen.getByRole("button", { name: "A–Z" }))
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(artists.map((artist) => artist.name).sort((a, b) => a.localeCompare(b)))

    const genre = screen.getByLabelText("Filter artists by genre")
    fireEvent.change(genre, { target: { value: "Tech House" } })
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 3, name: "BAUM" })).toBeInTheDocument()

    fireEvent.change(genre, { target: { value: "missing" } })
    expect(screen.getByText("No artists match this genre.")).toBeInTheDocument()
  })

  describe("roster deep link", () => {
    afterEach(() => {
      window.history.replaceState(null, "", "/artists")
    })

    it("highlights the artist named by ?artist=<slug>", () => {
      const slug = artistSlug("BAUM")
      window.history.replaceState(null, "", `/artists?artist=${slug}`)
      render(<ArtistsDirectory />)

      const anchor = document.getElementById(`artist-${slug}`)
      expect(anchor).toHaveAttribute("aria-current", "true")
      expect(document.querySelectorAll('[aria-current="true"]')).toHaveLength(1)
    })

    it("ignores unknown slugs", () => {
      window.history.replaceState(null, "", "/artists?artist=not-a-real-artist")
      render(<ArtistsDirectory />)
      expect(document.querySelector('[aria-current="true"]')).toBeNull()
    })

    it("uses auto scroll behavior under prefers-reduced-motion", () => {
      const slug = artistSlug("BAUM")
      window.history.replaceState(null, "", `/artists?artist=${slug}`)
      const scrollIntoView = vi.fn()
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
      const { container } = render(<ArtistsDirectory />)
      const el = container.querySelector(`#artist-${slug}`) as HTMLElement | null
      if (el) el.scrollIntoView = scrollIntoView
      // Allow the requestAnimationFrame callback to run.
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          expect(scrollIntoView).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: "auto" }),
          )
          mediaSpy.mockRestore()
          resolve()
        })
      })
    })
  })
})
