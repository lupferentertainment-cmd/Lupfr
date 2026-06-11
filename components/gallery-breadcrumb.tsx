/**
 * Path under the site’s gallery: **Event pics** (section) + each directory in `public/gallery/…` (URL path), not the filename.
 * `onMedia` renders white segment text for overlays on photos (scrims are dark in both themes).
 */
export function GalleryEventBreadcrumb({
  folderSegments,
  className,
  onMedia = false,
}: {
  folderSegments: readonly string[]
  className?: string
  onMedia?: boolean
}) {
  const sepClass = onMedia ? "text-white/60" : "text-muted-foreground"
  const midClass = onMedia
    ? "text-white/70 font-medium tracking-tight"
    : "text-muted-foreground font-medium tracking-tight"
  const lastClass = onMedia
    ? "text-white/95 font-medium tracking-tight"
    : "text-foreground/95 font-medium tracking-tight"

  return (
    <nav aria-label="Photo context" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
        <li className="text-gold-accent font-semibold tracking-tight">Event pics</li>
        {folderSegments.map((seg, i) => (
          <li key={`${i}-${seg}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span aria-hidden className={sepClass}>
              /
            </span>
            <span className={i < folderSegments.length - 1 ? midClass : lastClass}>
              {seg}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
