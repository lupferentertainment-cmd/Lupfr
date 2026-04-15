"use client"

import dynamic from "next/dynamic"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { Reviews } from "@/components/reviews"
import { Events } from "@/components/events"
import { Services } from "@/components/services"
import { Artists } from "@/components/artists"
import { About } from "@/components/about"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { Gallery } from "@/components/gallery"

const ScrollProgress = dynamic(
  () => import("@/components/scroll-progress").then((m) => ({ default: m.ScrollProgress })),
  { ssr: false }
)

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
      <Gallery />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
