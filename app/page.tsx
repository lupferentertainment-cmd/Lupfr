"use client"

import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { Events } from "@/components/events"
import { Services } from "@/components/services"
import { About } from "@/components/about"
import { Artists } from "@/components/artists"
import { Contact } from "@/components/contact"
import { Footer } from "@/components/footer"
import { ScrollProgress } from "@/components/scroll-progress"
import { CustomCursor } from "@/components/custom-cursor"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <CustomCursor />
      <ScrollProgress />
      <Navigation />
      <Hero />
      <Events />
      <Services />
      <Artists />
      <About />
      <Contact />
      <Footer />
    </main>
  )
}
