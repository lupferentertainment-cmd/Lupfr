/**
 * Homepage gallery — source `data/gallery.yml`, build `bun run generate-data` → `generated/gallery.json`.
 * Album display names for configured folders use **event `title` from `data/events.yml`** (matched by
 * `GALLERY_ALBUM_FOLDER_DEFAULT_DATES` → `dateISO`); do not hardcode a separate name map.
 */
import galleryJson from "@/lib/data/generated/gallery.json"
import { EVENTS } from "@/lib/events"
import { isValidGalleryDateISO } from "@/lib/gallery-date"

export type GalleryPhoto = {
  id: number
  slug: string
  src: string
  alt: string
  title: string
  caption: string
  /** Calendar date for captions and grouping (`YYYY-MM-DD`). From YAML `date` or folder default in this file. */
  dateISO: string | null
  /** When false, photo appears on `/gallery` but not the home carousel. Omitted in YAML = true. */
  showOnHome: boolean
  /** First path segment under `/gallery/…` (e.g. `boiler_boat_003`), from the image URL. */
  albumFolder: string
  /**
   * Directory path under `public/gallery/` (each segment) for breadcrumb trail; from `src`.
   */
  albumPathSegments: readonly string[]
  /**
   * Human label for jump bars, headings, and non-path UI (event title or YAML `album` override).
   * Defaults: optional YAML `album`, else event `title` for the folder’s default `dateISO`, else row `title`.
   */
  albumBreadcrumb: string
}

type GalleryRow = {
  id: unknown
  image: unknown
  title: unknown
  caption?: unknown
  alt: unknown
  showOnHome?: unknown
  /** Optional `YYYY-MM-DD`; must match a real calendar day. Overrides folder default when valid. */
  date?: unknown
  /** Optional override for the album segment (breadcrumbs, jump bar). */
  album?: unknown
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

/** Home page: album grids under the carousel, in this order (must match `public/gallery/<folder>/`). */
export const GALLERY_HOME_ALBUM_FOLDERS = ["boiler_boat_003", "where_is_west"] as const

export type GalleryHomeAlbumFolder = (typeof GALLERY_HOME_ALBUM_FOLDERS)[number]

/**
 * Default `dateISO` per gallery folder when YAML omits `date`. Must match `data/events.yml` (single event
 * per date) so `albumBreadcrumb` resolves to the event `title`. Legacy keys (e.g. `boiler_boat`) are kept
 * so old image paths / bookmarks still resolve.
 */
export const GALLERY_ALBUM_FOLDER_DEFAULT_DATES: Readonly<Record<string, string>> = {
  boiler_boat: "2026-04-04",
  boiler_boat_003: "2026-04-04",
  shamrock_house: "2025-03-14",
  third_thursdays_operator_sf: "2026-05-21",
  where_is_west: "2026-04-18",
  where_is_west_004: "2026-04-18",
}

function eventTitleForDateISO(dateISO: string): string | undefined {
  return EVENTS.find((e) => e.dateISO === dateISO)?.title
}

function albumBreadcrumbForFolderName(albumFolder: string, r: GalleryRow): string {
  const albumOverride = typeof r.album === "string" && r.album.trim().length > 0 ? r.album.trim() : null
  if (albumOverride) return albumOverride
  const d = GALLERY_ALBUM_FOLDER_DEFAULT_DATES[albumFolder]
  if (d) {
    const t = eventTitleForDateISO(d)
    if (t) return t
  }
  return String(r.title)
}

function resolvedDateISOForRow(r: GalleryRow, albumFolder: string): string | null {
  if (typeof r.date === "string") {
    const t = r.date.trim()
    if (isValidGalleryDateISO(t)) return t
  }
  const fallback = GALLERY_ALBUM_FOLDER_DEFAULT_DATES[albumFolder]
  if (fallback !== undefined && isValidGalleryDateISO(fallback)) return fallback
  return null
}

function albumFolderFromSrc(src: string): string {
  const parts = src.split("/").filter((p) => p.length > 0)
  if (parts[0] === "gallery" && parts[1]) return parts[1]
  if (parts.length >= 1) {
    const i = parts.indexOf("gallery")
    if (i >= 0 && parts[i + 1]) return parts[i + 1]
  }
  return "gallery"
}

/**
 * Every directory segment under `public/gallery/…` for this asset (excludes the filename).
 * e.g. `/gallery/boiler_boat_003/x.webp` → `["boiler_boat_003"]`;
 * `/gallery/a/b/c/x.webp` → `["a","b","c"]`.
 */
export function galleryPathFolderSegmentsFromSrc(src: string): string[] {
  const parts = src.split("/").filter((p) => p.length > 0)
  const i = parts.indexOf("gallery")
  if (i < 0 || parts.length <= i + 1) return []
  const under = parts.slice(i + 1)
  if (under.length <= 1) return []
  return under.slice(0, -1)
}

function slugFromSrc(src: string, id: number): string {
  const base = src.split("/").pop()?.replace(/\.[^.]+$/i, "") ?? ""
  const safe = base.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "")
  return safe.length > 0 ? safe : `slide-${id}`
}

const rows = (Array.isArray(galleryJson) ? galleryJson : []).filter(isGalleryRow)

function rowShowOnHome(r: GalleryRow): boolean {
  if (r.showOnHome === undefined) return true
  return r.showOnHome === true
}

export const GALLERY_PHOTOS: readonly GalleryPhoto[] = rows.map((r) => {
  const id = Number(r.id)
  const src = normalizeSrc(r.image as string)
  const albumFolder = albumFolderFromSrc(src)
  const pathSegs = galleryPathFolderSegmentsFromSrc(src)
  const albumPathSegments: readonly string[] = pathSegs.length > 0 ? pathSegs : [albumFolder]
  const albumBreadcrumb = albumBreadcrumbForFolderName(albumFolder, r)
  return {
    id,
    slug: slugFromSrc(src, id),
    src,
    title: String(r.title),
    caption: typeof r.caption === "string" ? r.caption : "",
    alt: String(r.alt),
    dateISO: resolvedDateISOForRow(r, albumFolder),
    showOnHome: rowShowOnHome(r),
    albumFolder,
    albumPathSegments,
    albumBreadcrumb,
  }
})

/** Home #gallery carousel: YAML rows with `showOnHome` not false. */
export const GALLERY_CAROUSEL_PHOTOS: readonly GalleryPhoto[] = GALLERY_PHOTOS.filter((p) => p.showOnHome)

export function albumBreadcrumbForFolder(folder: string): string {
  const d = GALLERY_ALBUM_FOLDER_DEFAULT_DATES[folder]
  if (d) {
    const t = eventTitleForDateISO(d)
    if (t) return t
  }
  return folder
}

/** Photos for one `public/gallery/<folder>/` album, in YAML order. */
export function getGalleryPhotosByAlbumFolder(folder: string): readonly GalleryPhoto[] {
  return GALLERY_PHOTOS.filter((p) => p.albumFolder === folder)
}

export function getGalleryPhotoById(id: number): GalleryPhoto | undefined {
  return GALLERY_PHOTOS.find((p) => p.id === id)
}

export function getGalleryIndexById(id: number): number {
  return GALLERY_PHOTOS.findIndex((p) => p.id === id)
}
