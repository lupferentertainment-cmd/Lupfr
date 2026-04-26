import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { GalleryEventBreadcrumb } from "@/components/gallery-breadcrumb"
import { GalleryPhotoBackLink } from "@/components/gallery-photo-back-link"
import { Footer } from "@/components/footer"
import { GalleryPhotoHero } from "@/components/gallery-photo-hero"
import { GalleryShareRow } from "@/components/gallery-share-row"
import { Navigation } from "@/components/navigation"
import {
  GALLERY_PHOTOS,
  getGalleryIndexById,
  getGalleryPhotoById,
} from "@/lib/data/gallery"
import { galleryPhotoDateLabel } from "@/lib/gallery-date"
import {
  GALLERY_SLIDING_PRELOAD_RADIUS,
  GALLERY_FROM_PARAM,
  galleryLinearPreloadIndices,
  galleryPhotoHref,
  isGalleryFrom,
} from "@/lib/gallery-nav"
import { LINKS } from "@/lib/links"
import { SITE_URL } from "@/lib/site"

const IMG_W = 1600
const IMG_H = 1000

function parseIdParam(raw: string): number {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : NaN
}

export function generateStaticParams() {
  return GALLERY_PHOTOS.map((p) => ({ id: String(p.id) }))
}

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: raw } = await params
  const id = parseIdParam(raw)
  const photo = getGalleryPhotoById(id)
  if (!photo) {
    return { title: "Gallery" }
  }
  const pageTitle = `LUPFR | ${photo.title}`
  const absolute = `${SITE_URL}${photo.src}`
  const canonical = `${SITE_URL}/gallery/p/${photo.id}`
  return {
    title: pageTitle,
    description: photo.caption || photo.alt,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: photo.caption || photo.alt,
      type: "article",
      url: canonical,
      images: [
        { url: absolute, width: IMG_W, height: IMG_H, alt: photo.alt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: photo.caption || photo.alt,
      images: [absolute],
    },
  }
}

export default async function GalleryPhotoPage({ params, searchParams }: PageProps) {
  const { id: raw } = await params
  const sp = await searchParams
  const fromRaw = sp[GALLERY_FROM_PARAM]
  const fromStr = Array.isArray(fromRaw) ? fromRaw[0] : fromRaw
  const fromNav = isGalleryFrom(fromStr) ? fromStr : undefined

  const id = parseIdParam(raw)
  const photo = getGalleryPhotoById(id)
  if (!photo) notFound()

  const photoHref = (pid: number) => galleryPhotoHref(pid, fromNav)

  const idx = getGalleryIndexById(id)
  const total = GALLERY_PHOTOS.length
  const prev = idx > 0 ? GALLERY_PHOTOS[idx - 1] : null
  const next = idx >= 0 && idx < total - 1 ? GALLERY_PHOTOS[idx + 1] : null
  const preloadIdxs = galleryLinearPreloadIndices(total, idx, GALLERY_SLIDING_PRELOAD_RADIUS)
  const heroPreloadSrcs = preloadIdxs.map((i) => GALLERY_PHOTOS[i]?.src).filter((s): s is string => Boolean(s))
  const shareUrl = `${SITE_URL}/gallery/p/${photo.id}`
  const shareTitle = `LUPFR — ${photo.title}`
  const photoDateLabel = galleryPhotoDateLabel(photo.dateISO)

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-28">
        <div className="mb-3 sm:mb-4">
          <Suspense
            fallback={
              <Link
                href="/gallery"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium tracking-normal transition-colors"
              >
                <ArrowLeft size={16} aria-hidden />
                All photos
              </Link>
            }
          >
            <GalleryPhotoBackLink />
          </Suspense>
        </div>

        <div className="relative overflow-hidden rounded-gallery-squircle border border-border/80 bg-muted shadow-xl shadow-black/[0.08] dark:shadow-black/50">
          {prev ? (
            <Link
              href={photoHref(prev.id)}
              className="text-foreground hover:bg-background/95 absolute left-1.5 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 shadow-lg backdrop-blur-md transition-colors sm:left-3 sm:size-12 md:left-4 md:size-14"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-6 sm:size-7 md:size-8" aria-hidden />
            </Link>
          ) : null}
          {next ? (
            <Link
              href={photoHref(next.id)}
              className="text-foreground hover:bg-background/95 absolute right-1.5 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/80 shadow-lg backdrop-blur-md transition-colors sm:right-3 sm:size-12 md:right-4 md:size-14"
              aria-label="Next photo"
            >
              <ChevronRight className="size-6 sm:size-7 md:size-8" aria-hidden />
            </Link>
          ) : null}
          <div className="relative w-full min-w-0">
            <GalleryPhotoHero
              src={photo.src}
              alt={photo.alt}
              width={IMG_W}
              height={IMG_H}
              sizes="(max-width: 1280px) 100vw, 1280px"
              preloadSrcs={heroPreloadSrcs}
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <GalleryEventBreadcrumb folderSegments={photo.albumPathSegments} className="mb-2" />
          <p className="text-gold-accent text-xs font-semibold tracking-tight">LUPFR</p>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">{photo.title}</h1>
          {photoDateLabel ? (
            <p className="text-muted-foreground mt-1 text-sm font-medium tabular-nums sm:text-base">{photoDateLabel}</p>
          ) : null}
          {photo.caption ? (
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">{photo.caption}</p>
          ) : null}
          <p className="text-muted-foreground/70 mt-2 text-sm">
            Photo {idx + 1} of {total}
          </p>
        </div>

        <div className="mt-8">
          <p className="text-muted-foreground mb-3 text-sm">
            Share the moment — copy the link or use a button, and tag{" "}
            <a href={LINKS.instagram} className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
              @lupfr_
            </a>{" "}
            when you post.
          </p>
          <GalleryShareRow shareUrl={shareUrl} shareTitle={shareTitle} />
        </div>
      </div>
      <Footer />
    </main>
  )
}
