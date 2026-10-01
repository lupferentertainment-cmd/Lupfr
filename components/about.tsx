"use client"

import Image from "next/image"
import { useRef, useState, type KeyboardEvent } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { BrandSlashText } from "@/components/brand-slash-text"
import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ShimmerImage } from "@/components/shimmer-image"
import { getBrands } from "@/lib/data/brands"

const brands = getBrands()

const STORY_SLIDES = [
  { image: "/story/h-02.webp", alt: "LUPFR story graphic: Redefining the Music Experience — The Mission." },
  { image: "/story/h-03.webp", alt: "LUPFR story graphic: Unique Sets, Unique Places." },
  { image: "/story/h-04.webp", alt: "LUPFR story graphic: Two Cities, One Night." },
  { image: "/story/h-05.webp", alt: "LUPFR story graphic: Community Built on Music." },
  { image: "/story/h-06.webp", alt: "LUPFR story graphic: the SEA//SIDE series." },
] as const

function BrandRollCall() {
  return (
    <>
      {brands.map((brand, i) => (
        <span key={brand.key}>
          {i > 0 && ", "}
          {i === brands.length - 1 && "and "}
          <BrandSlashText text={brand.title} color={brand.accent} />
        </span>
      ))}
    </>
  )
}

export function About() {
  const ref = useRef<HTMLElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)

  function goRelative(delta: number) {
    setActiveSlide((current) => (current + delta + STORY_SLIDES.length) % STORY_SLIDES.length)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") goRelative(-1)
    if (event.key === "ArrowRight") goRelative(1)
  }

  return (
    <section
      id="about"
      ref={ref}
      className="relative overflow-hidden border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container relative mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-10 xl:gap-16">
          <div className="relative z-20 max-w-[700px]">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              About LUPFR
            </p>

            <h2 className="mb-7 font-[family-name:var(--font-barlow-condensed)] text-[clamp(42px,5vw,68px)] font-extrabold uppercase leading-[0.92] tracking-[-0.025em]">
              <GoldShineText scrollTargetRef={ref}>Built From the Ground Up</GoldShineText>
            </h2>

            <div className="space-y-4 text-[16px] leading-[1.7] text-muted-foreground">
              <p>
                Will Lupfer founded <GoldShineText scrollTargetRef={ref}>LUPFR Entertainment</GoldShineText> in 2025 with a simple idea: California deserves music experiences that match its energy and creativity. What began as a single yacht event on the Bay has grown into five distinct brands — <BrandRollCall /> — spanning live music, corporate programming, and media.
              </p>
              <p>
                Today, <GoldShineText scrollTargetRef={ref}>LUPFR</GoldShineText> produces unique events across Los Angeles and San Francisco — floating concerts, corporate events infused with live music, and everything in between.
              </p>
              <p>
                Our headquarters sits in the heart of <strong className="font-medium text-foreground">Old Town Pasadena, CA</strong> — a space where we host guests, artists, and business partners as the company continues to grow.
              </p>
            </div>

            <blockquote className="mt-8 border-l-2 border-accent pl-5">
              <p className="text-[16px] italic leading-[1.6] text-foreground">
                &quot;We&apos;re not just planning events - we&apos;re building the infrastructure for how California experiences music on the water, in venues, and in the boardroom.&quot;
              </p>
              <footer className="mt-3 font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
                — Will Lupfer, Founder &amp; CEO
              </footer>
            </blockquote>
          </div>

          <div className="relative hidden min-h-[610px] lg:block">
            <div
              className="absolute inset-y-[-8%] right-[-8vw] w-[64vw] max-w-[960px] overflow-hidden"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,.26) 10%, #000 31%, #000 78%, rgba(0,0,0,.55) 91%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, rgba(0,0,0,.26) 10%, #000 31%, #000 78%, rgba(0,0,0,.55) 91%, transparent 100%)",
              }}
            >
              <Image
                src="/story/built-from-ground-up.webp"
                alt="LUPFR outdoor music event"
                fill
                sizes="(min-width: 1024px) 58vw, 0px"
                className="object-cover object-center"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/10 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/70 to-transparent" />
          </div>

          <article
            className="relative overflow-hidden rounded-sm border border-border bg-card lg:hidden"
            onKeyDown={handleKeyDown}
            aria-roledescription="carousel"
            aria-label="LUPFR story"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              {STORY_SLIDES.map((slide, i) => (
                <div
                  key={slide.image}
                  aria-hidden={i !== activeSlide}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <ShimmerImage
                    src={slide.image}
                    alt={slide.alt}
                    width={1080}
                    height={1350}
                    sizes="100vw"
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => goRelative(-1)}
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/75 text-foreground backdrop-blur-sm"
              >
                <ChevronLeft size={18} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => goRelative(1)}
                aria-label="Next slide"
                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/75 text-foreground backdrop-blur-sm"
              >
                <ChevronRight size={18} aria-hidden />
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                The LUPFR Story
              </span>
              <div className="flex items-center gap-2">
                {STORY_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Show story slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === activeSlide ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/40"}`}
                  />
                ))}
              </div>
            </div>
          </article>
        </div>
      </ScrollReveal>
    </section>
  )
}
