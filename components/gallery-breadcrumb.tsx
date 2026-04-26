/**
 * Path under the site’s gallery: **Event pics** (section) + each directory in `public/gallery/…` (URL path), not the filename.
 */
export function GalleryEventBreadcrumb({
  folderSegments,
  className,
}: {
  folderSegments: readonly string[]
  className?: string
}) {
  return (
    <nav aria-label="Photo context" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
        <li className="text-gold-accent font-semibold tracking-tight">Event pics</li>
        {folderSegments.map((seg, i) => (
          <li key={`${i}-${seg}`} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
            <span
              className={
                i < folderSegments.length - 1
                  ? "text-muted-foreground font-medium tracking-tight"
                  : "text-foreground/95 font-medium tracking-tight"
              }
            >
              {seg}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
