import { describe, expect, it } from "vitest"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { getArtists } from "@/lib/data/artists"

const WHERES_WEST_IMAGE_PATH = "/artists/wheres_west.webp"
const WHERES_WEST_IMAGE_HASH = "9327811a59ceb6304d3df33451d086193267417fcc80a0cf4077933898033233"

function getArtistImagePath(name: string): string {
  const artist = getArtists().find((item) => item.name === name)
  if (!artist) throw new Error(`Missing artist: ${name}`)
  return artist.image
}

function getPublicImageHash(imagePath: string): string {
  const publicPath = join(process.cwd(), "public", imagePath)
  const image = readFileSync(publicPath)
  return createHash("sha256").update(image).digest("hex")
}

describe("featured artist data", () => {
  it("keeps the requested front artist order", () => {
    expect(getArtists().map((artist) => artist.name)).toEqual([
      "fromclay",
      "Zusebi",
      "Where's West?",
      "thatfranco",
      "HLWA",
      "BAUM",
      "LUPFR",
    ])
  })

  it("removes retired artists from the featured lineup", () => {
    const names = getArtists().map((artist) => artist.name)
    expect(names).not.toEqual(expect.arrayContaining(["Tommy Guala", "Mike Stern", "Operator SF"]))
  })

  it("keeps Where's West pointed at the requested beach profile image", () => {
    expect(getArtistImagePath("Where's West?")).toBe(WHERES_WEST_IMAGE_PATH)
  })

  it("keeps the Where's West artist image bytes unchanged", () => {
    expect(getPublicImageHash(WHERES_WEST_IMAGE_PATH)).toBe(WHERES_WEST_IMAGE_HASH)
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
