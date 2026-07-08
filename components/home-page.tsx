"use client"

import dynamic from "next/dynamic"

import { Events } from "@/components/events"
import { Artists } from "@/components/artists"
import { Press } from "@/components/press"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { PartnersStrip } from "@/components/partners-strip"
import { Services } from "@/components/services"
import { ScrollProgress } from "@/components/scroll-progress"
import { DeferredHomeSection } from "@/components/deferred-home-section"
import { resolveDynamicComponent } from "@/lib/dynamic-component"
const About = dynamic(() =>
  import("@/components/about").then((m) =>
    resolveDynamicComponent(m, "About", "@/components/about")
  ),
  { ssr: false }
)
const Team = dynamic(() =>
  import("@/components/team").then((m) =>
    resolveDynamicComponent(m, "Team", "@/components/team")
  ),
  { ssr: false }
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
      <Events />
      <Services />
      <Artists />
      <Press />
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[900px] lg:min-h-[780px]">
        <About />
      </DeferredHomeSection>
      <DeferredHomeSection id="team" estimatedHeightClassName="min-h-[1600px] sm:min-h-[1000px] lg:min-h-[640px]">
        <Team />
      </DeferredHomeSection>
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        <Contact />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
