"use client"

import Link from "next/link"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { PosterTile } from "@/components/poster-tile"
import { PartifulBand } from "@/components/partiful-band"
import { brandPath, brandPlainTitle, getBrands } from "@/lib/data/brands"

const brands = getBrands()

export function Brands() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })

  return (
    <section id="brands" ref={ref} className="lupfr-section-pad px-4 sm:px-6 lg:px-12">
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-[1400px]">
        <div className="mb-10 sm:mb-12 md:mb-14">
          <p className="lupfr-section-kicker mb-4">The Portfolio · Five Series</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2>
              <GoldShineText scrollTargetRef={ref}>Our Brands</GoldShineText>
            </h2>
            <Link
              href="/brands"
              className="inline-block border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-foreground"
            >
              View all brands →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-5">
          {brands.map((brand, i) => (
            <PosterTile
              key={brand.key}
              href={brandPath(brand)}
              ariaLabel={`View ${brandPlainTitle(brand)} brand`}
              image={brand.image}
              accent={brand.accent}
              tagLabel={brand.tag}
              index={i}
              title={<BrandSlashText text={brand.title} color={brand.accent} />}
              description={brand.description}
              ctaLabel="Explore"
              isInView={isInView}
            />
          ))}
        </div>

        <PartifulBand />
      </ScrollReveal>
    </section>
  )
}
