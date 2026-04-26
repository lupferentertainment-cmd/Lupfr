/** Apple Photos–style labels for gallery stills: `Apr 4, 2026` (en-US, UTC calendar date). */

const ISO = /^\d{4}-\d{2}-\d{2}$/

export function isValidGalleryDateISO(s: string): boolean {
  if (!ISO.test(s)) return false
  const [y, m, d] = s.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
}

export function formatGalleryDateLabel(iso: string): string {
  if (!isValidGalleryDateISO(iso)) return ""
  const [y, m, d] = iso.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt)
}

export function galleryPhotoDateLabel(dateISO: string | null): string | null {
  if (dateISO === null) return null
  const s = formatGalleryDateLabel(dateISO)
  return s.length > 0 ? s : null
}

export type GalleryDateGroup<T> = {
  sortKey: string
  heading: string
  items: readonly T[]
}

/** Newest calendar day first; rows without a valid `dateISO` last under `undatedHeading`. */
export function groupGalleryByDateISO<T extends { dateISO: string | null }>(
  photos: readonly T[],
  undatedHeading = "Undated"
): GalleryDateGroup<T>[] {
  const map = new Map<string, T[]>()
  for (const p of photos) {
    const key =
      p.dateISO !== null && isValidGalleryDateISO(p.dateISO) ? p.dateISO : "__undated__"
    const list = map.get(key)
    if (list) list.push(p)
    else map.set(key, [p])
  }
  const keys = [...map.keys()]
  keys.sort((a, b) => {
    if (a === "__undated__") return 1
    if (b === "__undated__") return -1
    return b.localeCompare(a)
  })
  return keys.map((key) => ({
    sortKey: key,
    heading: key === "__undated__" ? undatedHeading : formatGalleryDateLabel(key),
    items: map.get(key)!,
  }))
}
