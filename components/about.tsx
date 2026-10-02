"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState, useEffect } from "react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { BrandSlashText } from "@/components/brand-slash-text"
import { ShimmerImage } from "@/components/shimmer-image"
import { getBrands } from "@/lib/data/brands"

const brands = getBrands()

/**
 * 2026-10-02 fix (owner: "Built from the Ground up - remove the carousel, it
 * should have the attached image, faded in like we did on the hero"). Was a
 * 6-slide carousel (5 story graphics + a closing press card) with arrows,
 * dots, and a counter badge — replaced with the single boat-DJ night photo
 * (skyline + Ferris wheel) the owner pointed to, using the exact left-edge
 * mask `claude-home-hero.tsx` applies to its own media panel: that section
 * also runs text-left/media-right, so the same fade direction blends this
 * photo into the copy column here too. The other 5 story graphics
 * (public/story/h-02..h-06.webp) and the featured-press card aren't gone
 * from the site — the press mention still runs live on Follow the Momentum
 * and the /media page (lib/data/news.ts) — just out of this one slot.
 */
const STORY_IMAGE = {
  src: "/story/h-01.webp",
  alt: "LUPFR founder DJing aboard a boat at night, city skyline and a lit Ferris wheel behind.",
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

  return (
    <section id="about" ref={ref} className="pt-8 sm:pt-9 md:pt-11 pb-(--lupfr-section-pad) px-4 sm:px-6 lg:px-12 relative overflow-hidden">
      <ScrollReveal variant="up" amountIn={0.2} className="relative">
        <div className="container mx-auto max-w-[1400px] relative z-10">
          {/* items-stretch (was items-start): owner design-file punch list,
              2026-09-02: "ABOUT LUPFR: story carousel stretches to match the
              copy column (no dead space)" — the right column's fixed
              aspect-[4/5] media frame used to leave the carousel shorter
              than the (usually taller) left text column, stranding empty
              space below it at lg+. Stretching both columns to the row's
              height, combined with the media frame switching from a fixed
              aspect ratio to `flex-1` below, lets the carousel grow to fill
              that height instead. */}
          <div className="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16 items-stretch">
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

            {/* Right - a single static photo (owner, 2026-10-02: "remove the
               carousel, it should have the attached image, faded in like we
               did on the hero" — the carousel this replaced is documented
               above STORY_IMAGE). */}
            <motion.article
              initial={{ opacity: 0, x: 32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              aria-label="LUPFR story"
              className="relative flex h-full flex-col overflow-hidden rounded-sm border bg-card transition-colors duration-200 ease-snap hover:border-accent/40"
            >
              {/* aspect-[4/5] below lg (fixed ratio, same reasoning as the
                  old carousel: `flex-1` alone has no height to grow into in
                  the single-column mobile layout), lg:flex-1 fills the
                  stretched column's actual height. The mask is the exact
                  gradient claude-home-hero.tsx uses on its own media panel —
                  Hero also runs copy-left/media-right, so the same left-edge
                  fade blends this photo into the text column the same way. */}
              <div
                className="relative aspect-[4/5] w-full overflow-hidden bg-muted lg:aspect-auto lg:flex-1"
                style={{
                  WebkitMaskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)",
                  maskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)",
                }}
              >
                <ShimmerImage
                  src={STORY_IMAGE.src}
                  alt={STORY_IMAGE.alt}
                  width={1080}
                  height={1350}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="eager"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-none flex-col gap-4 p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">The LUPFR Story</p>
              </div>
            </motion.article>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
