"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Events } from "@/components/events"
import { Artists } from "@/components/artists"
import { Press } from "@/components/press"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { Reviews } from "@/components/reviews"
import { Services } from "@/components/services"
import { ScrollProgress } from "@/components/scroll-progress"
import { resolveDynamicComponent } from "@/lib/dynamic-component"
const Gallery = dynamic(() =>
  import("@/components/gallery").then((m) =>
    resolveDynamicComponent(m, "Gallery", "@/components/gallery")
  ),
  { ssr: false }
)
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

const DEFERRED_SECTION_ROOT_MARGIN_DESKTOP = "1400px 0px"
const DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "900px 0px"
const HASH_REALIGN_DELAYS_MS = [0, 150, 500, 1200, 2200]

function deferredSectionRootMargin(): string {
  if (window.matchMedia("(max-width: 767px)").matches) {
    return DEFERRED_SECTION_ROOT_MARGIN_MOBILE
  }
  return DEFERRED_SECTION_ROOT_MARGIN_DESKTOP
}

function scrollHashTargetIntoView(id: string): void {
  if (window.location.hash !== `#${id}`) return
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ block: "start" })
  })
}

function scheduleHashTargetRealignment(id: string): number[] {
  return HASH_REALIGN_DELAYS_MS.map((delay) =>
    window.setTimeout(() => scrollHashTargetIntoView(id), delay)
  )
}

function clearHashTargetRealignment(timeoutIds: number[]): void {
  timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId))
}

function DeferredHomeSection({
  id,
  estimatedHeightClassName,
  children,
}: {
  id: string
  estimatedHeightClassName: string
  children: ReactNode
}) {
  const anchorRef = useRef<HTMLDivElement | null>(null)
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    const matchesHash = () => window.location.hash === `#${id}`
    if (matchesHash()) {
      const timeoutId = window.setTimeout(() => setShouldMount(true), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const node = anchorRef.current
    if (!node || !("IntersectionObserver" in window)) {
      const timeoutId = window.setTimeout(() => setShouldMount(true), 0)
      return () => window.clearTimeout(timeoutId)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true)
          observer.disconnect()
        }
      },
      { rootMargin: deferredSectionRootMargin() }
    )

    observer.observe(node)

    const onHashChange = () => {
      if (matchesHash()) {
        setShouldMount(true)
        observer.disconnect()
      }
    }
    window.addEventListener("hashchange", onHashChange)

    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", onHashChange)
    }
  }, [id])

  useEffect(() => {
    if (!shouldMount) return
    const timeoutIds = scheduleHashTargetRealignment(id)
    return () => clearHashTargetRealignment(timeoutIds)
  }, [id, shouldMount])

  if (shouldMount) return <>{children}</>

  return (
    <div
      id={id}
      ref={anchorRef}
      className={estimatedHeightClassName}
      aria-hidden="true"
    />
  )
}

export function HomePage() {
  return (
    <main className="relative min-h-screen min-h-[100dvh] overflow-x-clip w-full max-w-full">
      <ScrollProgress />
      <Navigation />
      <Hero />
      <Reviews />
      <Events />
      <Services />
      <Artists />
      <Press />
      <DeferredHomeSection id="gallery" estimatedHeightClassName="min-h-[420px] sm:min-h-[700px]">
        <Gallery />
      </DeferredHomeSection>
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[900px] lg:min-h-[780px]">
        <About />
      </DeferredHomeSection>
      <DeferredHomeSection id="team" estimatedHeightClassName="min-h-[1200px] md:min-h-[900px]">
        <Team />
      </DeferredHomeSection>
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        <Contact />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
