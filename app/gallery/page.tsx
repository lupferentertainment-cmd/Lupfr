import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { GalleryPhotoGrid } from "@/components/gallery-photo-grid"
import { Navigation } from "@/components/navigation"
import { GALLERY_PHOTOS } from "@/lib/data/gallery"
import { SITE_URL } from "@/lib/site"

const title = "Photo gallery"
const description = "LUPFR photo gallery."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  openGraph: { title, description },
  alternates: { canonical: `${SITE_URL}/gallery` },
}

export default function GalleryIndexPage() {
  const list = [...GALLERY_PHOTOS]

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="pt-28 sm:pt-32 md:pt-36">
        <header className="container mx-auto flex max-w-7xl flex-col items-stretch px-4 pb-6 sm:px-6">
          <Link
            href="/#gallery"
            prefetch
            className="text-muted-foreground hover:text-foreground mb-6 flex w-fit items-center gap-2 text-sm font-medium tracking-normal transition-colors"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to home
          </Link>
          <GoldShineText as="h1">Gallery</GoldShineText>
        </header>
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20 sm:pb-28">
          <GalleryPhotoGrid photos={list} className="mt-8" />
        </div>
      </div>
      <Footer />
    </main>
  )
}
