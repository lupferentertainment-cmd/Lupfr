"use client"

import { m, useInView } from "framer-motion"
import { useRef } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { TextReveal } from "@/components/text-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { getBrands, type BrandItem } from "@/lib/data/brands"

const brands = getBrands()

function BrandCard({ brand, index, isInView }: { brand: BrandItem; index: number; isInView: boolean }) {
  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-sm sm:rounded-md bg-card border border-border hover:border-accent/50 transition-colors duration-150 ease-out p-6 sm:p-7 min-h-[260px]"
    >
      <div
        className="absolute top-2 left-2 h-2.5 w-2.5 border-t border-l"
        style={{ borderColor: brand.accent }}
        aria-hidden
      />
      <div
        className="absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r"
        style={{ borderColor: brand.accent }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between mb-4">
        <span
          className="font-mono text-[9px] tracking-wider uppercase rounded-xs border px-2 py-1 whitespace-nowrap"
          style={{ borderColor: brand.accent, color: brand.accent }}
        >
          {brand.tag}
        </span>
        <span className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ backgroundColor: brand.accent }} aria-hidden />
      </div>

      <h3 className="relative font-condensed font-extrabold uppercase tracking-tight text-xl sm:text-2xl leading-tight mb-3 text-foreground">
        <BrandSlashText text={brand.title} />
      </h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
        {brand.description}
      </p>

      <div className="relative flex items-center gap-3 text-xs">
        <span className="text-muted-foreground/80">{brand.format}</span>
        {brand.externalUrl ? (
          <a
            href={brand.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {brand.externalUrl.replace(/^https?:\/\//, "")} ↗
          </a>
        ) : null}
      </div>
    </m.article>
  )
}

export function Brands() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })

  return (
    <section id="brands" ref={ref} className="py-14 sm:py-16 md:py-20 lg:py-24 xl:py-28 px-4 sm:px-6 lg:px-12">
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-[1400px]">
        <div className="mb-10 sm:mb-12 md:mb-14">
          <p className="lupfr-section-kicker mb-4">The Portfolio · Five Series</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2>
              <GoldShineText scrollTargetRef={ref}>Our Brands</GoldShineText>
            </h2>
            <TextReveal
              text="Five brands, one company — LUPFR Entertainment spans live music events and private corporate programming."
              className="text-muted-foreground max-w-md leading-relaxed"
              delay={0.2}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {brands.map((brand, i) => (
            <BrandCard key={brand.key} brand={brand} index={i} isInView={isInView} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
