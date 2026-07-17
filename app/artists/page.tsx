import type { Metadata } from "next"
import { ArtistsDirectory } from "@/components/artists"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Artists",
  description: "Explore the DJs, bands, producers, and musicians featured by LUPFR Entertainment.",
  alternates: { canonical: `${SITE_URL}/artists` },
}

export default function ArtistsPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="lupfr-section-kicker mb-4">The Sound</p>
          <GoldShineText as="h1" className="mb-8 sm:mb-12">
            All Featured Artists
          </GoldShineText>
          <ArtistsDirectory />
        </div>
      </div>
      <Footer />
    </main>
  )
}
