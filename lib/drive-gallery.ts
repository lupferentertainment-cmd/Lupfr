/**
 * Drive-as-CMS gallery: `/gallery` renders media straight from the public Google Drive folder
 * `LUPFR GALLERY/website/<event_folder>/` (anyone-with-link). Listing uses Drive's anonymous
 * `embeddedfolderview` HTML (no API key); assets serve from Google's image CDN
 * (`lh3.googleusercontent.com/d/<fileId>=w<width>`), videos embed via Drive's `/preview` player.
 * Listings are ISR-cached (`DRIVE_GALLERY_REVALIDATE_SECONDS`), so Drive edits appear on the
 * site without a commit or deploy. Contract + operator steps: `docs/ARCHITECTURE.md`,
 * `docs/RUNBOOK.md`. Fetch failures log and fall back to an empty list (section hides).
 */
import { albumBreadcrumbForFolder } from "@/lib/data/gallery"

/** `LUPFR GALLERY/website` — the curated, public Drive folder the site mirrors. */
export const DRIVE_GALLERY_ROOT_FOLDER_ID = "1naOEOuyfaiQ0RIPUVqk-hDZBZeRAGzmr"

/** How long Next caches a Drive folder listing before re-fetching (seconds). */
export const DRIVE_GALLERY_REVALIDATE_SECONDS = 3600

/** Default rendered width for Drive-hosted photos/posters (lh3 resizes server-side). */
export const DRIVE_GALLERY_IMAGE_WIDTH = 1600

/**
 * Drive subfolder name → site album folder (keys of `GALLERY_ALBUM_FOLDER_DEFAULT_DATES`),
 * so headings reuse the matching event title. Unmapped Drive folders still render,
 * titled by `humanizeDriveSlug`.
 */
export const DRIVE_FOLDER_TO_ALBUM_FOLDER: Readonly<Record<string, string>> = {
  boiler_boat_003: "boiler_boat_003",
  boiler_party_marina: "boiler_party_marina",
  "shamrock_&_house": "shamrock_house",
  third_thursdays: "third_thursdays_operator_sf",
  "wheres_west_?": "where_is_west",
}

export type DriveEntryKind = "file" | "folder"

export type DriveEntry = {
  id: string
  name: string
  kind: DriveEntryKind
}

export type DriveMediaItem =
  | { kind: "image"; fileId: string; name: string; src: string }
  | { kind: "video"; fileId: string; name: string; posterSrc: string; embedSrc: string }

export type DriveGalleryAlbum = {
  /** Raw Drive subfolder name, e.g. `shamrock_&_house`. */
  driveSlug: string
  /** Mapped site album folder, e.g. `shamrock_house`. */
  albumFolder: string
  /** Heading: event title for mapped folders, humanized slug otherwise. */
  title: string
  items: readonly DriveMediaItem[]
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "avif"])
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"])

const HTML_ENTITIES: Readonly<Record<string, string>> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
}

function decodeEntities(s: string): string {
  return s
    .replace(/&(amp|lt|gt|quot|#39);/g, (m) => HTML_ENTITIES[m] ?? m)
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
}

export function embeddedFolderViewUrl(folderId: string): string {
  return `https://drive.google.com/embeddedfolderview?id=${folderId}`
}

export function driveImageSrc(fileId: string, width: number = DRIVE_GALLERY_IMAGE_WIDTH): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`
}

export function driveVideoEmbedSrc(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`
}

function entryKindFromSegment(segment: string): DriveEntryKind {
  return segment.includes("drive.google.com/drive/folders/") ? "folder" : "file"
}

/**
 * Parse Drive `embeddedfolderview` HTML into entries. Anchored on the stable
 * `id="entry-<id>"` + `flip-entry-title` markup; returns `[]` for unrecognized HTML.
 */
export function parseDriveFolderEntries(html: string): DriveEntry[] {
  const out: DriveEntry[] = []
  const re = /id="entry-([\w-]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?flip-entry-title">([^<]*)</g
  for (const m of html.matchAll(re)) {
    out.push({ id: m[1], name: decodeEntities(m[3]), kind: entryKindFromSegment(m[2]) })
  }
  return out
}

export function mediaKindForName(name: string): "image" | "video" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? ""
  if (IMAGE_EXTENSIONS.has(ext)) return "image"
  if (VIDEO_EXTENSIONS.has(ext)) return "video"
  return "other"
}

/** `wheres_west_?` → `Wheres West`; used only for Drive folders with no album mapping. */
export function humanizeDriveSlug(slug: string): string {
  return slug
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

export function albumFolderForDriveSlug(driveSlug: string): string {
  return DRIVE_FOLDER_TO_ALBUM_FOLDER[driveSlug] ?? driveSlug
}

export function albumTitleForDriveSlug(driveSlug: string): string {
  const folder = albumFolderForDriveSlug(driveSlug)
  const breadcrumb = albumBreadcrumbForFolder(folder)
  return breadcrumb === folder ? humanizeDriveSlug(driveSlug) : breadcrumb
}

/** Non-media files (PDFs, sidecars) map to no items, so the grid stays photo/video only. */
export function mediaItemsFromEntry(entry: DriveEntry): DriveMediaItem[] {
  const builders: Record<string, () => DriveMediaItem[]> = {
    image: () => [{ kind: "image", fileId: entry.id, name: entry.name, src: driveImageSrc(entry.id) }],
    video: () => [
      {
        kind: "video",
        fileId: entry.id,
        name: entry.name,
        posterSrc: driveImageSrc(entry.id),
        embedSrc: driveVideoEmbedSrc(entry.id),
      },
    ],
    other: () => [],
  }
  return builders[mediaKindForName(entry.name)]()
}

async function fetchFolderEntries(folderId: string): Promise<DriveEntry[]> {
  const res = await fetch(embeddedFolderViewUrl(folderId), {
    next: { revalidate: DRIVE_GALLERY_REVALIDATE_SECONDS },
  })
  if (!res.ok) {
    throw new Error(`Drive folder listing ${folderId} returned HTTP ${res.status}`)
  }
  return parseDriveFolderEntries(await res.text())
}

/** Files in the folder plus files one level down (covers a `PHOTOS/`-style nested drop). */
async function fetchAlbumItems(folderId: string, depth: number): Promise<DriveMediaItem[]> {
  const entries = await fetchFolderEntries(folderId)
  const files = entries.flatMap(mediaItemsFromEntry)
  if (depth <= 0) return files
  const subfolders = entries.filter((e) => e.kind === "folder")
  const nested = await Promise.all(subfolders.map((f) => fetchAlbumItems(f.id, depth - 1)))
  return [...files, ...nested.flat()]
}

async function fetchAlbumForFolder(folder: DriveEntry): Promise<DriveGalleryAlbum> {
  return {
    driveSlug: folder.name,
    albumFolder: albumFolderForDriveSlug(folder.name),
    title: albumTitleForDriveSlug(folder.name),
    items: await fetchAlbumItems(folder.id, 1),
  }
}

/**
 * Albums under the Drive `website` folder, ISR-cached. Returns `[]` (logged) when Drive
 * is unreachable or the markup changes, so `/gallery` degrades to the committed grid.
 */
export async function fetchDriveGalleryAlbums(): Promise<DriveGalleryAlbum[]> {
  try {
    const root = await fetchFolderEntries(DRIVE_GALLERY_ROOT_FOLDER_ID)
    const folders = root.filter((e) => e.kind === "folder")
    const albums = await Promise.all(folders.map(fetchAlbumForFolder))
    return albums.filter((a) => a.items.length > 0)
  } catch (error) {
    console.error("[drive-gallery] falling back to empty album list:", error)
    return []
  }
}
