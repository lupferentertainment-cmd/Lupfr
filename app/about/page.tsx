import type { Metadata } from "next"
import { About } from "@/components/about"
import { ClaudeHomeArtists } from "@/components/claude-home-artists"
import { ClaudeHomeCrew } from "@/components/claude-home-crew"
import { ClaudeHomeNavigation } from "@/components/claude-home-navigation"
import { ClaudeHomePartifulBand } from "@/components/claude-home-partiful-band"
import { Footer } from "@/components/footer"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "About & Team",
  description:
    "The story behind LUPFR Entertainment and the team that produces floating concerts, corporate events, and live music across California.",
  alternates: { canonical: `${SITE_URL}/about` },
}

// 2026-11-17: About + Our Team moved off the home page onto their own route. The top nav keeps the
// About and Team tabs (About -> /about, Team -> /about#team). Start Planning stays on the home page.
// Round 16 (2026-11-18): Past Artists moved here from the home page (after the Partiful band, before the Footer).
export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#070605]">
      <ClaudeHomeNavigation />
      <h1 className="sr-only">About LUPFR Entertainment</h1>
      <div className="bg-background pt-[76px]">
        <About />
      </div>
      <ClaudeHomeCrew />
      <ClaudeHomePartifulBand />
      <ClaudeHomeArtists />
      <Footer />
    </main>
  )
}
