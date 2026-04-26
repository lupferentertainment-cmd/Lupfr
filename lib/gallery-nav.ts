/**
 * Gallery photo URLs: `/gallery/p/[id]` is the shareable page.
 * Optional `?from=gallery|home` keeps back navigation and prev/next aligned with entry point.
 */
export const GALLERY_FROM_PARAM = "from" as const

export type GalleryFrom = "gallery" | "home"

export function isGalleryFrom(v: string | null | undefined): v is GalleryFrom {
  return v === "gallery" || v === "home"
}

/** Path to a photo page, preserving entry context for back/prev/next links. */
export function galleryPhotoHref(id: number, from?: GalleryFrom): string {
  const base = `/gallery/p/${id}`
  if (from === "gallery" || from === "home") {
    return `${base}?${GALLERY_FROM_PARAM}=${from}`
  }
  return base
}

/**
 * Primary "back" target from `/gallery/p/[id]` (matches `GalleryPhotoBackLink` and Escape).
 * `from=home` ⇒ home page gallery section; otherwise full gallery index.
 */
export function galleryPhotoPageBackHref(from: GalleryFrom | null): string {
  return from === "home" ? "/#gallery" : "/gallery"
}

/**
 * Before client-navigating from the home page to a carousel photo, rewrite the current
 * history entry to `/#gallery` so the browser Back button returns to the gallery section
 * instead of bare `/` (replaceState does not scroll the way `location.hash =` does).
 */
export function homeHistoryReplaceForGalleryBack(pathname: string, hash: string): string | null {
  if (pathname !== "/") return null
  if (hash === "#gallery") return null
  return "/#gallery"
}

/**
 * Where “back / all photos” goes from a photo page (alias for `galleryPhotoPageBackHref`
 * for call sites that receive possibly-undefined `from`).
 */
export function galleryPhotoListBackHref(from: GalleryFrom | null | undefined): string {
  return galleryPhotoPageBackHref(from ?? null)
}

/**
 * How many steps away (prev/next) to warm via hidden `next/image` loads in gallery UIs.
 * 2 ⇒ current ±1 and ±2 (deduped).
 */
export const GALLERY_SLIDING_PRELOAD_RADIUS = 2

/**
 * Preload index list for a **circular** gallery strip (e.g. lightbox wrap).
 * Excludes `index`. Order: ±1, ±2, … by distance.
 */
export function galleryCircularPreloadIndices(
  length: number,
  index: number,
  radius: number
): number[] {
  if (length <= 1 || !Number.isFinite(radius) || radius < 1) return []
  const safeIndex = ((index % length) + length) % length
  const out: number[] = []
  for (let d = 1; d <= Math.floor(radius); d += 1) {
    out.push((safeIndex - d + length) % length, (safeIndex + d) % length)
  }
  return [...new Set(out)]
}

/**
 * Preload index list for **linear** order (e.g. `/gallery/p/[id]` prev/next, no wrap).
 * Excludes `index` (callers also skip out-of-range).
 */
export function galleryLinearPreloadIndices(
  length: number,
  index: number,
  radius: number
): number[] {
  if (length <= 1 || !Number.isFinite(radius) || radius < 1) return []
  if (index < 0 || index >= length) return []
  const out: number[] = []
  for (let d = 1; d <= Math.floor(radius); d += 1) {
    const left = index - d
    const right = index + d
    if (left >= 0) out.push(left)
    if (right < length) out.push(right)
  }
  return [...new Set(out)]
}
