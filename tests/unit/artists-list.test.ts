import { describe, expect, it } from "vitest"
import { getArtists } from "@/lib/data/artists"

describe("featured artist data", () => {
  it("keeps the requested front artist order", () => {
    expect(getArtists().map((artist) => artist.name)).toEqual([
      "fromclay",
      "Zusebi",
      "Where's West?",
      "thatfranco",
      "HLWA",
      "BAUM",
      "Operator SF",
      "LUPFR",
    ])
  })

  it("removes retired artists from the featured lineup", () => {
    const names = getArtists().map((artist) => artist.name)
    expect(names).not.toContain("Tommy Guala")
    expect(names).not.toContain("Mike Stern")
  })

  it("loads fromclay social links and featured track", () => {
    const fromclay = getArtists().find((artist) => artist.name === "fromclay")

    expect(fromclay).toMatchObject({
      spotify: "https://open.spotify.com/artist/0EwNsbQywFna5Y83fmTwpu",
      appleMusic: "https://share.google/RWil4VXF6rEh8ZTbe",
      instagram: "https://instagram.com/itsfromclay",
      featuredTrack: {
        url: "https://open.spotify.com/track/4675Tp7PNxE8ogRBTzL9Ek?si=582fef0278bf490c",
        platform: "spotify",
      },
    })
  })

  it("loads thatfranco social links and featured track", () => {
    const thatfranco = getArtists().find((artist) => artist.name === "thatfranco")

    expect(thatfranco).toMatchObject({
      spotify: "https://open.spotify.com/artist/7g1wGpkV1xFxx6APTrp7bv",
      appleMusic: "https://share.google/Xy2FL6mawFFMFbOkt",
      instagram: "https://instagram.com/thatfrancomusic",
      featuredTrack: {
        url: "https://open.spotify.com/track/5JJ0eUdq1cIJV9fozbUYE1?si=6e2da29ea4a24e55",
        platform: "spotify",
      },
    })
  })

  it("keeps existing artist social links and tracks", () => {
    const zusebi = getArtists().find((artist) => artist.name === "Zusebi")
    const baum = getArtists().find((artist) => artist.name === "BAUM")

    expect(zusebi?.instagram).toBe("https://www.instagram.com/zusebimusic/")
    expect(zusebi?.youtube).toBe("https://www.youtube.com/@Zusebi")
    expect(zusebi?.featuredTrack).toEqual({
      url: "https://open.spotify.com/track/6tAiVWmsaW50BtiHXSogJt?si=a65f6501dc6f4a6e",
      platform: "spotify",
    })

    expect(baum?.instagram).toBe("https://www.instagram.com/baum_dj/")
    expect(baum?.soundcloud).toBe("https://soundcloud.com/user-999208104/tracks")
    expect(baum?.featuredTrack).toEqual({
      url: "https://soundcloud.com/user-999208104/bunker-pop-up-3-7",
      platform: "soundcloud",
    })
  })
})
