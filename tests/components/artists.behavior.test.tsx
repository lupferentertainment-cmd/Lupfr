/** @vitest-environment happy-dom */

import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Artists, ArtistsDirectory } from "@/components/artists"
import { getArtists } from "@/lib/data/artists"

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
})
