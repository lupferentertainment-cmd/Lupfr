"use client"

import dynamic from "next/dynamic"

import { Events } from "@/components/events"
import { Artists } from "@/components/artists"
import { Brands } from "@/components/brands"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { News } from "@/components/news"
import { LayloEmbed } from "@/components/laylo-embed"
import { FollowTheMomentum } from "@/components/follow-the-momentum"
import { PartnersStrip } from "@/components/partners-strip"
import { Services } from "@/components/services"
import { ScrollProgress } from "@/components/scroll-progress"
import { DeferredHomeSection } from "@/components/deferred-home-section"
import { resolveDynamicComponent } from "@/lib/dynamic-component"

// Shared with the matching DeferredHomeSection's estimatedHeightClassName
// below, so the two can never drift apart (see the `loading` option note
// on About/Team just below for why that matters).
const ABOUT_MIN_HEIGHT = "min-h-[1100px] lg:min-h-[640px]"
const TEAM_MIN_HEIGHT = "min-h-[1600px] sm:min-h-[1000px] lg:min-h-[640px]"

/**
 * Owner report (2026-08-29): "there is a delay and black screen" scrolling
 * from About into Team. DeferredHomeSection swaps its own estimated-height
 * placeholder for the real `<About />`/`<Team />` the instant the section
 * should mount — but both are `next/dynamic(..., { ssr: false })` imports
 * with no `loading` fallback, so Next renders literally nothing for however
 * long that JS chunk takes to fetch. The section's height collapsed to zero
 * for that window, the page reflowed under the scroll position, and the
 * viewport showed raw black body background until the chunk painted in. The
 * `loading` option below keeps a same-sized `aria-hidden` placeholder up for
 * that whole gap so the section never collapses to zero height.
 */
const About = dynamic(() =>
  import("@/components/about").then((m) =>
    resolveDynamicComponent(m, "About", "@/components/about")
  ),
  { ssr: false, loading: () => <div className={ABOUT_MIN_HEIGHT} aria-hidden="true" /> }
)
const Team = dynamic(() =>
  import("@/components/team").then((m) =>
    resolveDynamicComponent(m, "Team", "@/components/team")
  ),
  { ssr: false, loading: () => <div className={TEAM_MIN_HEIGHT} aria-hidden="true" /> }
)
const Contact = dynamic(() =>
  import("@/components/contact").then((m) =>
    resolveDynamicComponent(m, "Contact", "@/components/contact")
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
    <main className="relative min-h-screen min-h-[100dvh] overflow-x-clip w-full max-w-full">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <PartnersStrip />
      {/* Owner 2026-08-08: "company news items below the Hero". Placed after the
          partners marquee rather than before it, because an earlier owner
          request (2026-07-11) pins that strip *directly* under the hero — this
          order satisfies both. */}
      <News />
      <Brands />
      <Events />
      <Services />
      <Artists />
      <DeferredHomeSection id="about" estimatedHeightClassName={ABOUT_MIN_HEIGHT}>
        <About />
      </DeferredHomeSection>
      <DeferredHomeSection id="team" estimatedHeightClassName={TEAM_MIN_HEIGHT}>
        <Team />
      </DeferredHomeSection>
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        {/* Owner 2026-08-08 flow: About → Our Team → Follow the Momentum. Rides
            the contact deferred block rather than getting its own, so it stays
            below the fold without adding another placeholder to scroll through. */}
        <FollowTheMomentum />
        <Contact />
        {/* Owner 2026-08-08: Laylo drop signup, above the footer. */}
        <LayloEmbed />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
