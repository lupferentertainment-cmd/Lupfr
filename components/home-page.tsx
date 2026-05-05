"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { ScrollProgress } from "@/components/scroll-progress"

const Reviews = dynamic(() =>
  import("@/components/reviews").then((m) => ({ default: m.Reviews }))
)
const Events = dynamic(() =>
  import("@/components/events").then((m) => ({ default: m.Events }))
)
const Services = dynamic(() =>
  import("@/components/services").then((m) => ({ default: m.Services })),
  { ssr: false }
)
const Artists = dynamic(() =>
  import("@/components/artists").then((m) => ({ default: m.Artists })),
  { ssr: false }
)
const Gallery = dynamic(() =>
  import("@/components/gallery").then((m) => ({ default: m.Gallery })),
  { ssr: false }
)
const About = dynamic(() =>
  import("@/components/about").then((m) => ({ default: m.About })),
  { ssr: false }
)
const Contact = dynamic(() =>
  import("@/components/contact").then((m) => ({ default: m.Contact })),
  { ssr: false }
)
const Footer = dynamic(() =>
  import("@/components/footer").then((m) => ({ default: m.Footer })),
  { ssr: false }
)

const DEFERRED_SECTION_ROOT_MARGIN_DESKTOP = "1400px 0px"
const DEFERRED_SECTION_ROOT_MARGIN_MOBILE = "80px 0px"

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
      setShouldMount(true)
      return
    }

    const node = anchorRef.current
    if (!node || !("IntersectionObserver" in window)) {
      setShouldMount(true)
      return
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
      <DeferredHomeSection id="events" estimatedHeightClassName="min-h-[980px] sm:min-h-[1120px]">
        <Events />
      </DeferredHomeSection>
      <DeferredHomeSection id="services" estimatedHeightClassName="min-h-[900px] sm:min-h-[980px]">
        <Services />
      </DeferredHomeSection>
      <DeferredHomeSection
        id="artists"
        estimatedHeightClassName="min-h-[1300px] sm:min-h-[980px] lg:min-h-[860px]"
      >
        <Artists />
      </DeferredHomeSection>
      <DeferredHomeSection id="gallery" estimatedHeightClassName="min-h-[760px] sm:min-h-[820px]">
        <Gallery />
      </DeferredHomeSection>
      <DeferredHomeSection id="about" estimatedHeightClassName="min-h-[1300px] lg:min-h-[900px]">
        <About />
      </DeferredHomeSection>
      <DeferredHomeSection id="contact" estimatedHeightClassName="min-h-[980px]">
        <Contact />
        <Footer />
      </DeferredHomeSection>
    </main>
  )
}
