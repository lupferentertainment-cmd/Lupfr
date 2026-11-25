"use client"

import { GoldShineText } from "@/components/gold-shine-text"
import Image from "next/image"
import Link from "next/link"
import { brandPath, getBrandBySlug, type BrandItem } from "@/lib/data/brands"

/**
 * LUPFR Website Design v6 (owner, 2026-11-24) — "Find your side.": four photo cards in the order SEA//SIDE,
 * IN//SIDE, OUT//SIDE, SKI//SIDE. Each card is a 3:4 brand banner (the wordmark is part of the picture) with a
 * large outlined number, no category tag, and a tagline row with an accent arrow under it; the whole card opens
 * that brand's page. The Operating / Platform tabs are gone — the platforms live behind the Services toggle,
 * and HIGH//RISE and SOUND//CHECK stay on /brands, reached through the small "Explore LUPFR" link. 2 columns at <=900px.
 */
interface BrandCard {
  key: string
  image: string
  tagline: string
  accent: string
}

const CARDS: readonly BrandCard[] = [
  { key: "seaside", image: "/brands/tile-seaside.webp", tagline: "Offshore Music Experiences", accent: "#5b9bf0" },
  { key: "inside", image: "/brands/tile-inside.webp", tagline: "The Night, Reimagined", accent: "#d8d8d8" },
  { key: "outside", image: "/brands/tile-outside.webp", tagline: "An Open Air Series", accent: "#9fd17a" },
  { key: "skiside", image: "/brands/tile-skiside.webp", tagline: "Après ski, amplified.", accent: "#e8424e" },
] as const

const BRANDS: Array<{ card: BrandCard; brand: BrandItem | undefined }> = CARDS.map((card) => ({ card, brand: getBrandBySlug(card.key) }))

export function ClaudeHomeBrands() {
  return (
    <section id="brands" className="border-b border-white/10 bg-[#070605] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[901px]:px-12 min-[901px]:py-24">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-6 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4">
          <div className="flex flex-col items-start">
            <div className="mb-5 flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(02)</span>
              <span>OUR BRANDS</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(42px,4.8vw,72px)] font-extrabold uppercase leading-[0.88]">
              <GoldShineText>Find your side.</GoldShineText>
            </h2>
          </div>
          <div className="flex max-w-[400px] flex-col gap-3">
            <p className="m-0 text-base leading-[1.55] text-[#e6e0d4]">Four experience brands, one crew. Each one built around a different setting.</p>
            <Link href="/brands" className="w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0] no-underline transition-colors hover:text-[#fdf6e8]">
              Explore LUPFR →
            </Link>
          </div>
        </div>

        <div data-testid="brands-grid" className="grid grid-cols-4 gap-3 max-[900px]:grid-cols-2 max-[900px]:gap-2">
          {BRANDS.map(({ card, brand }, i) => (
            <Link key={card.key} href={brand ? brandPath(brand) : `/brands/${card.key}`} data-testid="brand-card" className="group flex flex-col gap-3.5 no-underline">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0b0d12]">
                <Image
                  src={card.image}
                  alt={brand ? `${brand.title.replace("//", " ")} by LUPFR Entertainment` : ""}
                  fill
                  sizes="(max-width: 900px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span
                  aria-hidden
                  className="absolute left-[22px] top-[18px] font-condensed text-[44px] font-bold leading-none tracking-[0.01em] text-transparent [-webkit-text-stroke:1.5px_rgba(253,246,232,0.9)] [text-shadow:0_2px_12px_rgba(0,0,0,0.25)] max-[560px]:left-3.5 max-[560px]:top-3 max-[560px]:text-[32px]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-condensed text-[22px] font-bold uppercase leading-[1.05] text-[#fdf6e8] max-[560px]:text-lg">{card.tagline}</span>
                <span aria-hidden className="font-mono text-base transition-transform group-hover:translate-x-1" style={{ color: card.accent }}>
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
