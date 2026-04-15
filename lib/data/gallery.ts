/**
 * Homepage gallery — source `data/gallery.yml`, build `bun run generate-data` → `generated/gallery.json`.
 */
import galleryJson from "@/lib/data/generated/gallery.json"

export type GalleryPhoto = {
  id: number
  slug: string
  src: string
  alt: string
  title: string
  caption: string
}

type GalleryRow = {
  id: unknown
  image: unknown
  title: unknown
  caption?: unknown
  alt: unknown
}

function isGalleryRow(x: unknown): x is GalleryRow {
  if (typeof x !== "object" || x === null) return false
  const r = x as GalleryRow
  return (
    typeof r.image === "string" &&
    typeof r.title === "string" &&
    typeof r.alt === "string" &&
    Number.isFinite(Number(r.id))
  )
}

function normalizeSrc(path: string): string {
  const s = path.trim()
  if (!s) return s
  return s.startsWith("/") ? s : `/${s}`
}

function slugFromSrc(src: string, id: number): string {
  const base = src.split("/").pop()?.replace(/\.[^.]+$/i, "") ?? ""
  const safe = base.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "")
  return safe.length > 0 ? safe : `slide-${id}`
}

const rows = (Array.isArray(galleryJson) ? galleryJson : []).filter(isGalleryRow)

export const GALLERY_PHOTOS: readonly GalleryPhoto[] = rows.map((r) => {
  const id = Number(r.id)
  const src = normalizeSrc(r.image as string)
  return {
    id,
    slug: slugFromSrc(src, id),
    src,
    title: String(r.title),
    caption: typeof r.caption === "string" ? r.caption : "",
    alt: String(r.alt),
  }
})
