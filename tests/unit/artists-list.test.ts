import { describe, expect, it } from "vitest"
import { getArtists } from "@/lib/data/artists"

describe("featured artist data", () => {
  it("keeps the requested six-card artist order", () => {
    expect(getArtists().map((artist) => artist.name)).toEqual([
      "Zubesi",
      "Where's West?",
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

  it("loads new artist social links and featured tracks", () => {
    const zubesi = getArtists().find((artist) => artist.name === "Zubesi")
    const baum = getArtists().find((artist) => artist.name === "BAUM")

    expect(zubesi?.instagram).toBe("https://www.instagram.com/zusebimusic/")
    expect(zubesi?.youtube).toBe("https://www.youtube.com/@Zusebi")
    expect(zubesi?.featuredTrack).toEqual({
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
