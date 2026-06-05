"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { Reviews } from "@/components/reviews"
import { ScrollProgress } from "@/components/scroll-progress"
import { resolveDynamicComponent } from "@/lib/dynamic-component"

const Events = dynamic(() =>
  import("@/components/events").then((m) =>
    resolveDynamicComponent(m, "Events", "@/components/events")
  )
)
const Services = dynamic(() =>
  import("@/components/services").then((m) =>
    resolveDynamicComponent(m, "Services", "@/components/services")
  ),
  { ssr: false }
)
const Artists = dynamic(() =>
  import("@/components/artists").then((m) =>
    resolveDynamicComponent(m, "Artists", "@/components/artists")
  ),
  { ssr: false }
)
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
const DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "160px 0px"

function deferredSectionRootMargin(): string {
  if (window.matchMedia("(max-width: 767px)").matches) {
    return DEFERRED_SECTION_ROOT_MARGIN_MOBILE
  }
  return DEFERRED_SECTION_ROOT_MARGIN_DESKTOP
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
      <DeferredHomeSection id="events" estimatedHeightClassName="min-h-[720px] sm:min-h-[980px]">
        <Events />
      </DeferredHomeSection>
      <DeferredHomeSection id="services" estimatedHeightClassName="min-h-[640px] sm:min-h-[820px]">
        <Services />
      </DeferredHomeSection>
      <DeferredHomeSection
        id="artists"
        estimatedHeightClassName="min-h-[760px] sm:min-h-[860px] lg:min-h-[760px]"
      >
        <Artists />
      </DeferredHomeSection>
      <DeferredHomeSection id="gallery" estimatedHeightClassName="min-h-[420px] sm:min-h-[700px]">
        <Gallery />
      </DeferredHomeSection>
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[900px] lg:min-h-[780px]">
        <About />
      </DeferredHomeSection>
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[820px]">
        <Contact />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
