/** Apple Photos–style labels for gallery stills: `Apr 4, 2026` (en-US, UTC calendar date). */

const ISO = /^\d{4}-\d{2}-\d{2}$/
const GALLERY_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const validDateCache = new Map<string, boolean>()
const dateLabelCache = new Map<string, string>()

export function isValidGalleryDateISO(s: string): boolean {
  const cached = validDateCache.get(s)
  if (cached !== undefined) return cached

  let valid = false
  if (!ISO.test(s)) return false
  const y = Number(s.slice(0, 4))
  const m = Number(s.slice(5, 7))
  const d = Number(s.slice(8, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  valid = dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  validDateCache.set(s, valid)
  return valid
}

export function formatGalleryDateLabel(iso: string): string {
  const cached = dateLabelCache.get(iso)
  if (cached !== undefined) return cached

  if (!isValidGalleryDateISO(iso)) return ""
  const y = Number(iso.slice(0, 4))
  const m = Number(iso.slice(5, 7))
  const d = Number(iso.slice(8, 10))
  const dt = new Date(Date.UTC(y, m - 1, d))
  const label = GALLERY_DATE_FORMATTER.format(dt)
  dateLabelCache.set(iso, label)
  return label
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
