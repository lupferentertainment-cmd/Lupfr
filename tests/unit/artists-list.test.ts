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
      "Auguste",
      "Devvy Dub",
      "fromclay",
      "Zusebi",
      "Where's West?",
      "thatfranco",
      "HLWA",
      "BAUM",
      "Nick Rosen",
      "Admiral",
      "LUPFR",
      "MALEK",
      "Alex Rayne",
      "Midfield Avenue",
    ])
  })

  it("loads the phase 20 roster completion with copy sourced verbatim from the comp's embedded artist data", () => {
    const malek = getArtists().find((artist) => artist.name === "MALEK")
    expect(malek).toMatchObject({
      genre: "House",
      image: "/artists/malek.webp",
      bio: "House selector and LUPFR team member bringing his own sound to the decks.",
      soundcloud: "https://on.soundcloud.com/Wc5yFC4vYqzCLu2Zl6",
    })
    expect(malek?.spotify).toBeUndefined()

    const alexRayne = getArtists().find((artist) => artist.name === "Alex Rayne")
    expect(alexRayne).toMatchObject({
      genre: "Electronic",
      image: "/artists/alex_rayne.webp",
      bio: "Electronic duo bringing atmospheric, festival-scale energy to the LUPFR lineup.",
    })
    // The comp's own spotifyUrl for this artist is a '#' placeholder — no real link, so none was added.
    expect(alexRayne?.spotify).toBeUndefined()

    const midfieldAvenue = getArtists().find((artist) => artist.name === "Midfield Avenue")
    expect(midfieldAvenue).toMatchObject({
      genre: "Indie Rock",
      image: "/artists/midfield_avenue.webp",
      bio: "Indie rock band bringing live, atmospheric energy to the LUPFR lineup.",
      spotify: "https://open.spotify.com/artist/4QzticMQIsDTn6hWvesWsv",
    })
  })

  it("loads the 2026-07-06 owner additions with their streaming links", () => {
    const auguste = getArtists().find((artist) => artist.name === "Auguste")
    expect(auguste).toMatchObject({
      genre: "Afro House",
      image: "/artists/auguste.webp",
      spotify: "https://open.spotify.com/artist/4iS5S3n4kI5QvnYV2dNziq",
      appleMusic: "https://music.apple.com/us/artist/auguste/368789993",
      featuredTrack: {
        url: "https://open.spotify.com/track/6i6qKFqRA3ZBYtAWAv4Ikf?si=72786a1b0ae54b62",
        platform: "spotify",
      },
    })

    const devvyDub = getArtists().find((artist) => artist.name === "Devvy Dub")
    expect(devvyDub).toMatchObject({
      genre: "Alternative Rock",
      image: "/artists/devvy_dub.webp",
      spotify: "https://open.spotify.com/artist/4UndKhphjAjPRF7e6j95V0",
      appleMusic: "https://music.apple.com/us/artist/devvy-dub/1257899389",
      featuredTrack: {
        url: "https://open.spotify.com/track/1q2LCuh76IM9pLWfYfGGZP?si=3c16c996413b45a9",
        platform: "spotify",
      },
    })

    const nickRosen = getArtists().find((artist) => artist.name === "Nick Rosen")
    expect(nickRosen).toMatchObject({ genre: "House", image: "/artists/nick_rosen.webp" })
    expect(nickRosen?.spotify).toBeUndefined()

    const admiral = getArtists().find((artist) => artist.name === "Admiral")
    expect(admiral).toMatchObject({
      genre: "Afro House",
      image: "/artists/admiral.webp",
      spotify: "https://open.spotify.com/artist/6Ua0zshzKHjw9gyYftjNeD",
    })
    expect(admiral?.appleMusic).toBeUndefined()
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
      url: "https://open.spotify.com/track/5pKW3ZTKNXovP0q8huEO9z",
      platform: "spotify",
    })

    expect(baum?.instagram).toBe("https://www.instagram.com/baum_dj/")
    expect(baum?.soundcloud).toBe("https://soundcloud.com/user-999208104/tracks")
    expect(baum?.featuredTrack).toEqual({
      url: "https://soundcloud.com/user-999208104/baum-live-brackish-petaluma",
      platform: "soundcloud",
    })
  })

  it("loads the 2026-07-17 owner featured-track delivery", () => {
    const byName = (name: string) => getArtists().find((artist) => artist.name === name)

    expect(byName("Admiral")?.featuredTrack).toEqual({
      url: "https://open.spotify.com/track/1YG74nIEwH4USJlwdcjpva",
      platform: "spotify",
    })
    expect(byName("Alex Rayne")?.featuredTrack).toEqual({
      url: "https://open.spotify.com/track/5MtTgUg2fOkUdrJn4I7VKp",
      platform: "spotify",
    })
    // Owner delivered an on.soundcloud.com short link; stored as the resolved canonical track page.
    expect(byName("MALEK")?.featuredTrack).toEqual({
      url: "https://soundcloud.com/user-106497389/mainstage-mix",
      platform: "soundcloud",
    })
    expect(byName("Midfield Avenue")?.featuredTrack).toEqual({
      url: "https://open.spotify.com/track/4UJtVs2l4vszbUoVjrLEA5",
      platform: "spotify",
    })
    expect(byName("Nick Rosen")?.featuredTrack).toEqual({
      url: "https://soundcloud.com/nick-440042267/edm-house-set-all-the-bangers",
      platform: "soundcloud",
    })
    expect(byName("Where's West?")?.featuredTrack).toEqual({
      url: "https://open.spotify.com/track/2Ov0AaJT7TBHtOv6VB5Gim",
      platform: "spotify",
    })
  })
})
