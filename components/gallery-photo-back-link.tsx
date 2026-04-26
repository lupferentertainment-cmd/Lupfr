"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { GALLERY_FROM_PARAM, galleryPhotoListBackHref, isGalleryFrom } from "@/lib/gallery-nav"

/**
 * Client: reads `?from=` so “back” matches entry (`/gallery` vs home `#gallery` carousel).
 */
export function GalleryPhotoBackLink() {
  const searchParams = useSearchParams()
  const raw = searchParams.get(GALLERY_FROM_PARAM)
  const from = isGalleryFrom(raw) ? raw : null

  const href = galleryPhotoListBackHref(from)
  const label = from === "home" ? "Back to home" : "All photos"

  return (
    <Link
      href={href}
      prefetch
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium tracking-normal transition-colors"
    >
      <ArrowLeft size={16} aria-hidden />
      {label}
    </Link>
  )
}
