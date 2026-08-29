import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { MediaOverview } from "@/components/media-overview"
import { Navigation } from "@/components/navigation"
import { getMediaOverview } from "@/lib/data/media"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "News & Media",
  description:
    "The latest from LUPFR, plus every account across the portfolio — follow LUPFR and each brand: SEA//SIDE, HIGH//RISE, SOUND//CHECK, IN//SIDE, and OUT//SIDE.",
  alternates: { canonical: `${SITE_URL}/media` },
}

/**
 * News & Media (owner punch list, 2026-08-29: "Pull exact News/Media
 * sub-page from claude file") — header + stats readout ported from
 * `LUPFR_Restructure.dc.html`'s `isMediaPage` block; the news feed and
 * follow-each-brand matrix below live in `MediaOverview`.
 */
export default function MediaPage() {
  const { stats } = getMediaOverview()

  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-8 sm:mb-14">
            <div className="max-w-[640px]">
              <p className="lupfr-section-kicker mb-4">News &amp; Channels</p>
              <GoldShineText as="h1" className="mb-5">
                News &amp; Media
              </GoldShineText>
              <p className="text-base leading-7 text-muted-foreground sm:text-[17px]">
                The latest from LUPFR, plus every account across the portfolio —
                follow each brand on Instagram, TikTok, LinkedIn, and YouTube.
              </p>
            </div>
            <div className="font-mono text-[10px] uppercase leading-[2] tracking-[0.14em] text-muted-foreground">
              <p>{stats.brandCount} Brands</p>
              <p>{stats.liveChannelCount} Live Channels</p>
              {stats.updatedLabel ? <p>Updated {stats.updatedLabel}</p> : null}
            </div>
          </div>
          <MediaOverview />
        </div>
      </div>
      <Footer />
    </main>
  )
}
