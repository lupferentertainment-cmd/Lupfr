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
          {/* Row now sizes to its content (owner report, 2026-10-02: "Make
              the image a bit smaller (but keep the fade) so that there isnt
              any black sapce under the description" — was a stretch-align
              grid whose photo column grew to fill 100% of the stretched
              row's height, a pairing meant for the old multi-slide carousel
              (see the 2026-09-02 note it used to carry here). Once this slot
              became a single static photo (round 6), that combination just
              stretched the row taller than the text column's own natural
              height and left the leftover gap empty beneath the (now
              fixed-ratio, see below) photo instead. Sizing the row to its
              content removes that gap entirely. */}
          <div className="relative grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16 items-start">
            {/* 2026-10-04 fix, round 10 (owner, mobile screenshot: "we need
                to have that image faded behind the text on mobile, not
                below it"). Below `lg` this grid stacks its two children
                (text, then the photo block beneath it) since there's no
                second column to sit beside — the photo used to render as
                its own stacked block there instead of behind the copy.
                This mirrors claude-home-hero.tsx's own background-media
                pattern: an absolutely positioned, masked photo layer behind
                a `relative z-10` text layer, instead of inventing a new
                treatment. Decorative only (`aria-hidden`) — the real photo
                block below (with its real alt text and "The LUPFR Story"
                caption) still renders, just `lg:`-only now, since mobile
                gets this background treatment in its place. */}
            <div className="absolute inset-0 lg:hidden" aria-hidden="true">
              <div className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_78%,transparent)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,#000_30%,#000_78%,transparent)]">
                <ShimmerImage
                  src={STORY_IMAGE.src}
                  alt=""
                  width={1080}
                  height={1350}
                  sizes="100vw"
                  loading="eager"
                  className="h-full w-full object-cover opacity-35"
                />
              </div>
              <div className="absolute inset-0 bg-background/55" />
            </div>
            {/* Left - Story */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10"
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
               above STORY_IMAGE). Round 2 (owner: "the page should be
               designed similar to the our services section in the sense
               that the image is faded into the text"): claude-home-
               services.tsx's own photo panel has no card chrome at all — no
               border, no background box — it's just the photo, masked so
               its edge fades out rather than being cropped by a visible
               frame. Dropped this article's `border`/`bg-card`/`rounded-sm`
               and the boxed footer to match that same bare, bled-to-the-
               edge treatment; the mask gradient now matches Services'
               own values too.
               Round 10 (owner, mobile screenshot: "we need to have that
               image faded behind the text on mobile, not below it"): this
               real photo+caption block is now `lg:`-only (`hidden
               lg:flex`) — below `lg` the new decorative background layer
               above handles the photo instead, matching how Hero shows no
               separate caption over its own background media either. */}
            <motion.article
              initial={{ opacity: 0, x: 32 }}
              animate={hasRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              aria-label="LUPFR story"
              className="relative z-10 hidden flex-col overflow-hidden lg:flex"
            >
              {/* Fixed aspect-[4/5] at every breakpoint (previously switched
                  to an auto aspect ratio + flex-grow at lg, which grew the
                  photo to fill the stretch-aligned row's full height — see
                  the grid's own comment above for why that's gone). The
                  left-edge fade only applies at lg+ — the only breakpoint
                  this block renders at now (round 10, see above) — since
                  that's the only place it sits beside the text column
                  rather than behind it. */}
              <div className="relative aspect-[4/5] w-full overflow-hidden lg:[mask-image:linear-gradient(90deg,transparent,#000_40%)] lg:[-webkit-mask-image:linear-gradient(90deg,transparent,#000_40%)]">
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

              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">The LUPFR Story</p>
            </motion.article>
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
