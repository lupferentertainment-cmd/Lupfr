"use client"

import dynamic from "next/dynamic"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"

const ScrollProgress = dynamic(
  () => import("@/components/scroll-progress").then((m) => ({ default: m.ScrollProgress })),
  { ssr: false }
)

const Reviews = dynamic(() => import("@/components/reviews").then((m) => ({ default: m.Reviews })), {
  ssr: true,
})

const Events = dynamic(() => import("@/components/events").then((m) => ({ default: m.Events })), {
  ssr: true,
})

const Services = dynamic(() => import("@/components/services").then((m) => ({ default: m.Services })), {
  ssr: true,
})

const Artists = dynamic(() => import("@/components/artists").then((m) => ({ default: m.Artists })), {
  ssr: true,
})

const About = dynamic(() => import("@/components/about").then((m) => ({ default: m.About })), {
  ssr: true,
})

const Contact = dynamic(() => import("@/components/contact").then((m) => ({ default: m.Contact })), {
  ssr: true,
})

const Footer = dynamic(() => import("@/components/footer").then((m) => ({ default: m.Footer })), {
  ssr: true,
})

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
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
