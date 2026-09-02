import type { Metadata } from "next"
import { Footer } from "@/components/footer"
import { GoldShineText } from "@/components/gold-shine-text"
import { MediaOverview } from "@/components/media-overview"
import { Navigation } from "@/components/navigation"
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
 * sub-page from claude file") — header ported from
 * `LUPFR_Restructure.dc.html`'s `isMediaPage` block; the news feed and
 * follow-each-brand matrix below live in `MediaOverview`.
 *
 * The "N Brands / N Live Channels / Updated ..." stat readout that used to
 * sit under the header was removed (owner punch list, 2026-09-02: "remove
 * teh 6 brands, 6 live channels, updated text" — an iPhone screenshot of
 * this page). `getMediaOverview()`'s own `stats` field is untouched (still
 * covered by its own unit test) — only this page's display of it is gone.
 */
export default function MediaPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip">
      <Navigation />
      <div className="px-4 pb-20 pt-32 sm:px-6 sm:pt-36 md:pt-40 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-10 max-w-[640px] sm:mb-14">
            <p className="lupfr-section-kicker mb-4">News &amp; Channels</p>
            <GoldShineText as="h1" className="mb-5">
              News &amp; Media
            </GoldShineText>
            <p className="text-base leading-7 text-muted-foreground sm:text-[17px]">
              The latest from LUPFR, plus every account across the portfolio —
              follow each brand on Instagram, TikTok, LinkedIn, and YouTube.
            </p>
          </div>
          <MediaOverview />
        </div>
      </div>
      <Footer />
    </main>
  )
}
