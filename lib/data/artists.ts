/**
 * Artist data from data/artists.yml (build-time generated to generated/artists.json).
 */
import artistsJson from "@/lib/data/generated/artists.json"

export interface FeaturedTrack {
  url: string
  platform: "spotify" | "soundcloud"
}

export interface ArtistItem {
  id: number
  name: string
  genre: string
  image: string
  bio: string
  spotify?: string
  appleMusic?: string
  youtube?: string
  soundcloud?: string
  instagram: string
  featuredTrack?: FeaturedTrack
}

function normalizeImage(path: string): string {
  return String(path).startsWith("/") ? path : `/${path}`
}

export const ARTISTS: ArtistItem[] = (artistsJson as ArtistItem[]).map((a) => ({
  ...a,
  image: normalizeImage(a.image),
}))

export function getArtists(): ArtistItem[] {
  return ARTISTS
}
