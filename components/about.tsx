"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ArrowUpRight, Newspaper } from "lucide-react"

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

  return (
    <section id="about" ref={ref} className="pt-8 sm:pt-9 md:pt-11 pb-14 sm:pb-16 md:pb-20 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
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

            {/* Right - Featured press card (SF Post feature; source data/press.yml) */}
            <motion.article
              initial={{ opacity: 0, x: 32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-sm border bg-card transition-colors duration-200 ease-snap hover:border-accent/40"
            >
              <a
                href={featuredPress.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Read "${featuredPress.title}" on ${featuredPress.outlet}`}
                className="flex h-full flex-col"
              >
                <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
                  <ShimmerImage
                    src={featuredPress.image}
                    alt={`${featuredPress.outlet} feature on LUPFR`}
                    width={PRESS_IMAGE_WIDTH}
                    height={PRESS_IMAGE_HEIGHT}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    loading="lazy"
                    className="relative z-[1] h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/30 to-transparent opacity-60" />
                </div>
                <div className="flex flex-1 flex-col p-5 md:p-6">
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
                </div>
              </a>
            </motion.article>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
