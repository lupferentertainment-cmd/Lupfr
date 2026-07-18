import type { Metadata } from "next"
import { EventsDirectory } from "@/components/events-directory"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { Navigation } from "@/components/navigation"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "All Events",
  description:
    "Every LUPFR Entertainment event — upcoming and past — across SEA//SIDE, HIGH//RISE, SOUND//CHECK, IN//SIDE, and OUT//SIDE in Los Angeles and San Francisco.",
  alternates: { canonical: `${SITE_URL}/events` },
}

export default function EventsPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <p className="lupfr-section-kicker mb-4">Upcoming &amp; Past</p>
          <GoldShineText as="h1" className="mb-8 sm:mb-12">
            All Events
          </GoldShineText>
          <EventsDirectory />
        </div>
      </div>
      <Footer />
    </main>
  )
}
