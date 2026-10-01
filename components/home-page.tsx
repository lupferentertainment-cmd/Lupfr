"use client"

import dynamic from "next/dynamic"
import { PartnersStrip } from "@/components/partners-strip"
import { ScrollProgress } from "@/components/scroll-progress"
import { DeferredHomeSection } from "@/components/deferred-home-section"
import { FollowTheMomentum } from "@/components/follow-the-momentum"
import { LayloEmbed } from "@/components/laylo-embed"
import { resolveDynamicComponent } from "@/lib/dynamic-component"

// Oct 1 2026 homepage redesign (owner table): Navbar/Hero/News/Brands/Events/
// Services/Artists/Team swap to the new claude-home-*.tsx sibling components
// below. Partners/About/Follow the Momentum/Contact/Footer stay on their
// original components untouched — see tests/components/
// homepage-redesign.behavior.test.tsx's "scope lock" for the locked contract.
import { ClaudeHomeNavigation as Navigation } from "@/components/claude-home-navigation"
import { ClaudeHomeHero as Hero } from "@/components/claude-home-hero"
import { ClaudeHomeServices as Services } from "@/components/claude-home-services"
import { ClaudeHomeExperiences as Events } from "@/components/claude-home-experiences"
import { ClaudeHomeBrands as Brands } from "@/components/claude-home-brands"
import { ClaudeHomeMedia as News } from "@/components/claude-home-media"
import { ClaudeHomeArtists as Artists } from "@/components/claude-home-artists"

// Shared with the matching DeferredHomeSection's estimatedHeightClassName
// below, so the two can never drift apart (see the `loading` option note
// on About/Team just below for why that matters). A placeholder shorter than
// the real section causes the page to grow when the real component swaps
// in — the layout shift IS the CLS score; a placeholder much taller does the
// opposite (a jarring collapse). ABOUT_MIN_HEIGHT is unchanged because About
// itself is unchanged by this redesign. TEAM_MIN_HEIGHT is carried over
// as-is from the old, much taller FounderCard layout — claude-home-team.tsx
// is visibly more compact, so this number is almost certainly oversized now
// and needs a real re-measurement (Playwright across widths, as the
// 2026-09-02 pass did) before shipping; flagged rather than guessed.
const ABOUT_MIN_HEIGHT = "min-h-[1150px] lg:min-h-[920px]"
const TEAM_MIN_HEIGHT = "min-h-[3100px] sm:min-h-[3700px] lg:min-h-[1950px]"

const About = dynamic(() =>
  import("@/components/about").then((m) =>
    resolveDynamicComponent(m, "About", "@/components/about")
  ),
  { ssr: false, loading: () => <div className={ABOUT_MIN_HEIGHT} aria-hidden="true" /> }
)

const Team = dynamic(() =>
  import("@/components/claude-home-team").then((m) =>
    resolveDynamicComponent(m, "ClaudeHomeTeam", "@/components/claude-home-team")
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
    <main className="relative min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-clip bg-[#070605]">
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
