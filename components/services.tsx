"use client"

import Link from "next/link"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { PosterTile } from "@/components/poster-tile"
import { getServices, servicePath } from "@/lib/data/services"

// Home tease shows the first three services as open, full-bleed poster tiles
// (owner restructure note, 2026-08-28: "the tiles are more open on
// homepage" + design-canvas screenshot showing exactly Owned Events, Talent
// Booking, Event Programming). The full six-service grid lives on /services.
const HOME_FEATURED_SERVICE_COUNT = 3
const services = getServices()
const featuredServices = services.slice(0, HOME_FEATURED_SERVICE_COUNT)

export function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })

  return (
    <section id="services" ref={ref} className="lupfr-section-pad px-4 sm:px-6 lg:px-12">
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-[1400px]">
        <div className="mb-10 sm:mb-12 md:mb-14">
          <p className="lupfr-section-kicker mb-4">What We Do</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2>
              <GoldShineText scrollTargetRef={ref}>Our Services</GoldShineText>
            </h2>
            <Link
              href="/services"
              className="inline-block border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-foreground"
            >
              Explore all services →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px]">
          {featuredServices.map((service, i) => (
            <PosterTile
              key={service.title}
              href={servicePath(service)}
              ariaLabel={`View ${service.title} service`}
              image={service.image}
              accent="var(--accent)"
              tagLabel="Service"
              index={i}
              title={service.title}
              description={service.description}
              ctaLabel="Learn more"
              isInView={isInView}
            />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
