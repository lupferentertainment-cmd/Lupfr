import { ShimmerImage } from "@/components/shimmer-image"
import type { DriveGalleryAlbum, DriveMediaItem } from "@/lib/drive-gallery"

/**
 * `/gallery` Drive albums: server-rendered sections fed by `lib/drive-gallery.ts`
 * (public `LUPFR GALLERY/website` folder, ISR-cached). Images come from Google's CDN
 * via `next/image`; videos embed Drive's `/preview` player lazily. Renders nothing
 * when there are no albums, so the page degrades to the committed grid.
 */

const TILE_CLASS =
  "relative isolate aspect-square w-full overflow-hidden rounded-gallery-squircle bg-muted " +
  "ring-1 ring-inset ring-border/55 shadow-md shadow-black/[0.07] dark:shadow-black/35 [content-visibility:auto]"

function DriveImageTile({ item, title }: { item: Extract<DriveMediaItem, { kind: "image" }>; title: string }) {
  return (
    <div className={TILE_CLASS}>
      <ShimmerImage
        src={item.src}
        alt={`${title} — ${item.name}`}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="rounded-gallery-squircle object-cover object-center"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

function DriveVideoTile({ item, title }: { item: Extract<DriveMediaItem, { kind: "video" }>; title: string }) {
  return (
    <div className={TILE_CLASS}>
      <iframe
        src={item.embedSrc}
        title={`${title} — ${item.name}`}
        loading="lazy"
        allow="autoplay; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full rounded-gallery-squircle border-0"
      />
    </div>
  )
}

function DriveMediaTile({ item, title }: { item: DriveMediaItem; title: string }) {
  if (item.kind === "video") return <DriveVideoTile item={item} title={title} />
  return <DriveImageTile item={item} title={title} />
}

function DriveAlbumSection({ album }: { album: DriveGalleryAlbum }) {
  return (
    <section className="scroll-mt-28" aria-label={album.title}>
      <h2 className="mb-4 font-sans text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {album.title}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {album.items.map((item) => (
          <DriveMediaTile key={item.fileId} item={item} title={album.title} />
        ))}
      </div>
    </section>
  )
}

export function DriveGalleryAlbums({ albums }: { albums: readonly DriveGalleryAlbum[] }) {
  if (albums.length === 0) return null
  return (
    <div className="mt-16 space-y-12 sm:space-y-14">
      <header>
        <h2 className="font-sans text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Event albums
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Fresh photos and videos from the LUPFR team — updated automatically.
        </p>
      </header>
      {albums.map((album) => (
        <DriveAlbumSection key={album.driveSlug} album={album} />
      ))}
    </div>
  )
}
