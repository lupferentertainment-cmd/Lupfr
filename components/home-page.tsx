"use client"

import dynamic from "next/dynamic"
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
  import("@/components/services").then((m) => ({ default: m.Services }))
)
const Artists = dynamic(() =>
  import("@/components/artists").then((m) => ({ default: m.Artists }))
)
const Gallery = dynamic(() =>
  import("@/components/gallery").then((m) => ({ default: m.Gallery }))
)
const About = dynamic(() =>
  import("@/components/about").then((m) => ({ default: m.About }))
)
const Contact = dynamic(() =>
  import("@/components/contact").then((m) => ({ default: m.Contact }))
)
const Footer = dynamic(() =>
  import("@/components/footer").then((m) => ({ default: m.Footer }))
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
