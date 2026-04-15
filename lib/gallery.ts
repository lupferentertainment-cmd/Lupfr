/**
 * Home gallery carousel. Build-time data from data/gallery.yml → lib/data/generated/gallery.json.
 */
import galleryJson from "@/lib/data/generated/gallery.json"

export interface GalleryPhoto {
  id: number
  image: string
  title: string
  caption: string
  alt: string
}

function normalizeImagePath(image: string): string {
  const s = String(image).trim()
  return s.startsWith("/") ? s : `/${s}`
}

const PHOTOS: GalleryPhoto[] = (galleryJson as GalleryPhoto[]).map((row) => ({
  id: Number(row.id),
  image: normalizeImagePath(row.image),
  title: String(row.title),
  caption: String(row.caption),
  alt: String(row.alt),
}))

export function getGalleryPhotos(): GalleryPhoto[] {
  return PHOTOS
}
