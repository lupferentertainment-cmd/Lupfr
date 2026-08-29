"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect, type KeyboardEvent } from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { ShimmerImage } from "@/components/shimmer-image"
import { getBrands } from "@/lib/data/brands"
import { getPress } from "@/lib/data/press"

const PRESS_IMAGE_WIDTH = 1200
const PRESS_IMAGE_HEIGHT = 600

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const

/** "2026-06-10" -> "Jun 10, 2026" (deterministic, no locale/timezone drift). */
function fmtDate(dateISO: string): string {
  const [year, month, day] = dateISO.split("-").map(Number)
  return `${MONTH_NAMES[(month ?? 1) - 1]} ${day}, ${year}`
}

const brands = getBrands()
const featuredPress = getPress()[0]

/**
 * "SF Post" card carousel (owner request, 2026-08-29: 5 supplied story
 * graphics + the existing press card, as one carousel with arrows/dots/
 * counter instead of a standalone card). Native 1080x1350 story exports
 * under public/story/ — order is the owner's own numbering (h-02..h-06).
 */
const STORY_SLIDES = [
  {
    image: "/story/h-02.webp",
    alt: "LUPFR story graphic: Redefining the Music Experience — The Mission, a DJ booth aboard a LUPFR yacht set.",
  },
  {
    image: "/story/h-03.webp",
    alt: "LUPFR story graphic: Unique Sets, Unique Places — Live Sets // 001.",
  },
  {
    image: "/story/h-04.webp",
    alt: "LUPFR story graphic: Two Cities, One Night — San Francisco and Los Angeles.",
  },
  {
    image: "/story/h-05.webp",
    alt: "LUPFR story graphic: Community Built on Music — The Room, inside a LUPFR masquerade night.",
  },
  {
    image: "/story/h-06.webp",
    alt: "LUPFR story graphic: the SEA//SIDE series, on deck and on the dance floor.",
  },
] as const

const STORY_CAROUSEL_SLIDE_COUNT = STORY_SLIDES.length + 1 // + the featured press slide
const PRESS_SLIDE_INDEX = STORY_CAROUSEL_SLIDE_COUNT - 1

/** "3" -> "03" (matches the corporate mono numeral treatment used elsewhere). */
function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/** "SEA//SIDE, HIGH//RISE, SOUND//CHECK, IN//SIDE, and OUT//SIDE" with per-brand "//" accents. */
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
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const [hasRevealed, setHasRevealed] = useState(false)
  useEffect(() => {
    if (!isInView) return
    setHasRevealed(true)
  }, [isInView])

  const [activeSlide, setActiveSlide] = useState(0)
  function goToSlide(index: number) {
    setActiveSlide(((index % STORY_CAROUSEL_SLIDE_COUNT) + STORY_CAROUSEL_SLIDE_COUNT) % STORY_CAROUSEL_SLIDE_COUNT)
  }
  function goRelative(delta: number) {
    goToSlide(activeSlide + delta)
  }
  function handleCarouselKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      goRelative(-1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      goRelative(1)
    }
  }

  return (
    <section id="about" ref={ref} className="pt-8 sm:pt-9 md:pt-11 pb-(--lupfr-section-pad) px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <ScrollReveal variant="up" amountIn={0.2} className="relative">
        <div className="container mx-auto max-w-[1400px] relative z-10">
          <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16 items-start">
            {/* Left - Story */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="lupfr-section-kicker mb-4">About LUPFR</p>
              <h2 className="lupfr-heading--compact mb-6">
                <GoldShineText scrollTargetRef={ref}>Built From the Ground Up</GoldShineText>
              </h2>
              {/* Condensed: no founder portrait here — his face lives in the Team section below (owner request, 2026-07-02). */}
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Will Lupfer founded <GoldShineText scrollTargetRef={ref}>LUPFR Entertainment</GoldShineText> in 2025 with a simple idea: California deserves music experiences that match its energy and creativity. What began as a single yacht event on the Bay has grown into five distinct brands — <BrandRollCall /> - spanning across live music, corporate programming, and media.
                </p>
                <p>
                  Today, <GoldShineText scrollTargetRef={ref}>LUPFR</GoldShineText> produces unique events across Los Angeles and San Francisco - floating concerts, corporate events infused with live music, and everything in between.
                </p>
                <p>
                  That momentum is backed by an exclusive partnership with Partiful, pairing their community platform with LUPFR&apos;s on-the-ground production.
                </p>
              </div>

              <blockquote className="mt-8 border-l-2 border-accent pl-5">
                <p className="italic leading-relaxed text-foreground">
                  &quot;We&apos;re not just planning events - we&apos;re building the infrastructure for how California experiences music on the water, in venues, and in the boardroom.&quot;
                </p>
                <footer className="mt-3 font-mono text-xs tracking-[0.08em] text-muted-foreground">
                  — Will Lupfer, Founder &amp; CEO
                </footer>
              </blockquote>
            </motion.div>

            {/* Right - Story carousel: 5 owner-supplied story graphics, then the
               SF Post featured press card as the closing slide (owner request,
               2026-08-29 — replaces the standalone press card). */}
            <motion.article
              initial={{ opacity: 0, x: 32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              onKeyDown={handleCarouselKeyDown}
              aria-roledescription="carousel"
              aria-label="LUPFR story"
              className="group relative flex h-full flex-col overflow-hidden rounded-sm border bg-card transition-colors duration-200 ease-snap hover:border-accent/40"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                {STORY_SLIDES.map((slide, i) => (
                  <div
                    key={slide.image}
                    aria-hidden={i !== activeSlide}
                    className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                      i === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"
                    }`}
                  >
                    <ShimmerImage
                      src={slide.image}
                      alt={slide.alt}
                      width={1080}
                      height={1350}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      loading={i === 0 ? "eager" : "lazy"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
                <a
                  href={featuredPress.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Read "${featuredPress.title}" on ${featuredPress.outlet}`}
                  aria-hidden={activeSlide !== PRESS_SLIDE_INDEX}
                  tabIndex={activeSlide === PRESS_SLIDE_INDEX ? 0 : -1}
                  className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                    activeSlide === PRESS_SLIDE_INDEX ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  <ShimmerImage
                    src={featuredPress.image}
                    alt={`${featuredPress.outlet} feature on LUPFR`}
                    width={PRESS_IMAGE_WIDTH}
                    height={PRESS_IMAGE_HEIGHT}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-60" />
                </a>

                <button
                  type="button"
                  onClick={() => goRelative(-1)}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background/90 hover:text-accent"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => goRelative(1)}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-sm transition-colors hover:bg-background/90 hover:text-accent"
                >
                  <ChevronRight size={18} aria-hidden />
                </button>

                <span
                  role="status"
                  aria-live="polite"
                  className="absolute right-3 top-3 z-10 rounded-full bg-background/70 px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-foreground backdrop-blur-sm"
                >
                  {pad2(activeSlide + 1)} / {pad2(STORY_CAROUSEL_SLIDE_COUNT)}
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between gap-4 p-5 md:p-6">
                {activeSlide === PRESS_SLIDE_INDEX ? (
                  <a
                    href={featuredPress.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <Newspaper size={14} className="shrink-0 text-accent" aria-hidden />
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {featuredPress.outlet} · {fmtDate(featuredPress.dateISO)}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground text-balance">
                      {featuredPress.title}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight text-accent">
                      Read the article
                      <ArrowUpRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                  </a>
                ) : (
                  <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    The LUPFR Story
                  </p>
                )}

                <div role="tablist" aria-label="Story slides" className="flex items-center gap-2">
                  {Array.from({ length: STORY_CAROUSEL_SLIDE_COUNT }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === activeSlide}
                      aria-label={`Show slide ${i + 1} of ${STORY_CAROUSEL_SLIDE_COUNT}`}
                      onClick={() => goToSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === activeSlide ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
