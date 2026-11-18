"use client"

import dynamic from "next/dynamic"
import { PartnersStrip } from "@/components/partners-strip"
import { ScrollProgress } from "@/components/scroll-progress"
import { DeferredHomeSection } from "@/components/deferred-home-section"
import { FollowTheMomentum } from "@/components/follow-the-momentum"
import { LayloEmbed } from "@/components/laylo-embed"
import { resolveDynamicComponent } from "@/lib/dynamic-component"

// Oct 1 2026 homepage redesign (owner table): Navbar/Hero/News/Brands/Events/
// Services/Artists swap to the new claude-home-*.tsx sibling components
// below. Partners/Follow the Momentum/Start Planning/Footer stay on their
// original components untouched — see tests/components/
// homepage-redesign.behavior.test.tsx's "scope lock" for the locked contract.
import { ClaudeHomeNavigation as Navigation } from "@/components/claude-home-navigation"
import { ClaudeHomeHero as Hero } from "@/components/claude-home-hero"
import { ClaudeHomeServices as Services } from "@/components/claude-home-services"
import { ClaudeHomeExperiences as Events } from "@/components/claude-home-experiences"
import { ClaudeHomeBrands as Brands } from "@/components/claude-home-brands"
import { ClaudeHomeMedia as News } from "@/components/claude-home-media"
import { ClaudeHomeArtists as Artists } from "@/components/claude-home-artists"

const StartPlanning = dynamic(() =>
  import("@/components/start-planning").then((m) =>
    resolveDynamicComponent(m, "StartPlanning", "@/components/start-planning")
  ),
  { ssr: false }
)

const Footer = dynamic(() =>
  import("@/components/footer").then((m) =>
    resolveDynamicComponent(m, "Footer", "@/components/footer")
  ),
  { ssr: false }
)

export function HomePage() {
  return (
    <main className="relative min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-clip bg-[#070605]">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <PartnersStrip />
      {/* Section order below Partners follows the real design file (LUPFR
          Website v3.dc.html / claude-redesign-reference.html) section-marker
          outline verbatim: Services -> Featured Experiences (Events) ->
          Our Brands (Brands) -> Media & News (News) -> Past Artists (Artists).
          The previous order here (News/Brands/Events/Services) carried over a
          stale "company news items below the Hero" comment from the OLD,
          since-retired components/news.tsx home strip (owner 2026-08-08) —
          that component is no longer rendered on home at all (News here is
          ClaudeHomeMedia, a different, later-positioned section in the real
          design), so that ordering rationale no longer applies and the
          sections are restored to the design's actual sequence (owner report
          2026-10-01, "didnt come out in right order... still well off from
          the claude design"). */}
      <Services />
      <Events />
      <Brands />
      <News />
      <Artists />
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        {/* 2026-11-17: About + Our Team live on /about now; the page ends with Follow the Momentum. Rides
            the contact deferred block rather than getting its own, so it stays
            below the fold without adding another placeholder to scroll through. */}
        <FollowTheMomentum />
        <StartPlanning />
        {/* Owner 2026-08-08: Laylo drop signup, above the footer. */}
        <LayloEmbed />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
