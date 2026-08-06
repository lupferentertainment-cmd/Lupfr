import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { MediaHub } from "@/components/media-hub"
import { Navigation } from "@/components/navigation"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Media Hub",
  description:
    "LUPFR Entertainment channels, brand websites, and press coverage in one place — cycle through LUPFR and each brand: SEA//SIDE, HIGH//RISE, SOUND//CHECK, IN//SIDE, and OUT//SIDE.",
  alternates: { canonical: `${SITE_URL}/media` },
}

export default function MediaPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <p className="lupfr-section-kicker mb-4">Media Hub</p>
          <GoldShineText as="h1" className="mb-5">
            All Things Media
          </GoldShineText>
          <p className="mb-10 max-w-[640px] text-base leading-7 text-muted-foreground sm:mb-12 sm:text-[17px]">
            Everything about the business — our channels, websites, and press.
            Cycle through LUPFR and each brand below.
          </p>
          <MediaHub />
        </div>
      </div>
      <Footer />
    </main>
  )
}
