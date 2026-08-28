/** @vitest-environment happy-dom */

// The live roster currently has no artist with a `soundcloud` field set (BAUM,
// the only one who did, was removed in the 2026-08-28 owner restructure — see
// data/artists.yml). That leaves the SoundCloud-icon branch in ArtistCard
// (components/artists.tsx) permanently unreached by tests/components/artists.behavior.test.tsx,
// which always renders the real roster. This file mocks @/lib/data/artists with a
// synthetic fixture so that branch stays covered independent of who is on the
// live roster.

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/data/artists", () => {
  const artists = [
    {
      id: 1,
      name: "Fixture Artist",
      genre: "House",
      image: "/artists/fixture.webp",
      bio: "A fixture artist with every platform link set.",
      spotify: "https://open.spotify.com/artist/fixture",
      appleMusic: "https://music.apple.com/artist/fixture",
      youtube: "https://youtube.com/@fixture",
      soundcloud: "https://soundcloud.com/fixture-artist",
      instagram: "https://instagram.com/fixture",
    },
  ]
  return {
    ARTISTS: artists,
    getArtists: () => artists,
    artistSlug: (name: string) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
  }
})

describe("ArtistCard SoundCloud link", () => {
  it("renders a SoundCloud icon link when the artist has a soundcloud URL", async () => {
    const { ArtistsDirectory } = await import("@/components/artists")
    render(<ArtistsDirectory />)

    const link = screen.getByRole("link", { name: "SoundCloud" })
    expect(link).toHaveAttribute("href", "https://soundcloud.com/fixture-artist")
    expect(link).toHaveAttribute("target", "_blank")
  })
})
