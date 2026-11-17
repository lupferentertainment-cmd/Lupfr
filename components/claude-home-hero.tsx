"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { BrandWordmark } from "@/components/brand-wordmark"
import { GoldShineText } from "@/components/gold-shine-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { getBrandBySlug, type BrandItem } from "@/lib/data/brands"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * 2026-10-02 fix, round 2 (owner report, screenshots of the Claude design
 * file attached: "Still wrong videos. Should be the SEA//SIDE one, Bal
 * Masque, and Golden Gate."). The design file's `#hero` picker is literally
 * the same 3 flagship case studies as "Featured Experiences"
 * (claude-home-experiences.tsx) — "01 · BAL MASQUE / 02 · SEA//SIDE /
 * 03 · GOLDEN GATE" — and each tab swaps the hero's background to that case
 * study's own real media, not a single generic video with cosmetic photo
 * captions (the previous pass here, now corrected).
 *
 * Media is the same already-verified-real assets Experiences uses:
 * - Bal Masque: `/events/bal_masque_loop.{mp4,webm}` (real loop video).
 * - SEA//SIDE: `/events/seaside_series.{mp4,webm}` (real loop video).
 * - Golden Gate (Zusebi 002): `/events/ggl_main_video.{mp4,webm}` (owner-
 *   supplied clip, re-encoded 2026-10-03 — see the matching note in
 *   claude-home-experiences.tsx). Round 7 and earlier had no real video
 *   asset for this case study, so this tab fell back to a static photo; now
 *   every tab has a real video, so that fallback branch is gone.
 *
 * Not importing `caseStudies` from claude-home-experiences.tsx directly:
 * that array's shape (meta/desc/delivered/links) is specific to the case
 * study cards and would drag unrelated content into the hero. Keeping a
 * small hero-only media list here, with the same source paths, is less
 * coupling for the same "no drift" effect — if an asset path ever changes,
 * both files reference the identical real file on disk.
 *
 * Logo: `/images/le-logo.webp` is the same real LE mark already used as a
 * watermark on Team/Brands (see tests/unit/brands-le-watermark.test.ts) —
 * not a new asset.
 */
type HeroTab = {
  id: string
  /** Brand the event belongs to (data/brands.yml key); its wordmark leads the tab. */
  brandKey: string
  /** Event name shown under the brand wordmark (`0N · EVENT`). */
  label: string
  video: { mp4: string; webm: string }
  poster: string
  alt: string
}

const HERO_TABS: readonly HeroTab[] = [
  {
    id: "bal-masque",
    brandKey: "inside",
    label: "Bal Masque",
    video: { mp4: "/events/bal_masque_loop.mp4", webm: "/events/bal_masque_loop.webm" },
    poster: "/events/bal_masque_wings.webp",
    alt: "Bal Masque — feathered wings installation",
  },
  {
    id: "seaside",
    brandKey: "seaside",
    label: "Yacht Series",
    video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" },
    poster: "/events/seaside_series_dj.webp",
    alt: "DJ set aboard a SEA//SIDE Series sailing",
  },
  {
    id: "golden-gate",
    brandKey: "outside",
    label: "Golden Gate",
    video: { mp4: "/events/ggl_main_video.mp4", webm: "/events/ggl_main_video.webm" },
    poster: "/events/ggl_main_dj.webp",
    alt: "Zusebi 002: Golden Gate Live — DJ set in Golden Gate Park",
  },
] as const

const HERO_AUTOPLAY_MS = 7000

/** Resolved once: the three tabs' brands (a missing key would fall back to the plain event label). */
const HERO_TAB_BRANDS: Array<BrandItem | undefined> = HERO_TABS.map((tab) => getBrandBySlug(tab.brandKey))

export function ClaudeHomeHero() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeTab = HERO_TABS[active]
  const reducedMotion = useClientPrefersReducedMotion()

  // 2026-10-03 fix (owner: "needs to automatically move thru each hero
  // video") — the 3-tab picker used to be click-only. Re-keying off `active`
  // (not an empty dep array) means every advance — whether from this timer
  // or a visitor's own click — restarts a fresh HERO_AUTOPLAY_MS window, so
  // manually picking a tab doesn't get immediately overridden by a timer
  // that was already most of the way through its interval. Paused under
  // prefers-reduced-motion, same guard LazyLoopVideo itself already applies
  // to the actual video playback.
  useEffect(() => {
    if (reducedMotion) return
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % HERO_TABS.length)
    }, HERO_AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [active, reducedMotion])

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#070605] pt-[76px] text-[#f3efe6]">
      {/* 2026-10-04 fix, round 11 (owner, mobile screenshot: "Hero... needs
          to be designed like the screenshot I have from the claude
          design"). Two things were only ever right for the `md:`+ two-
          column layout (text left, photo right) and were leaking into
          mobile with no second column for them to make sense against: the
          left-edge mask (fading the photo's own left ~38% down to the flat
          page background instead of the design's full-bleed mobile photo)
          and the heavier top/bottom dark gradient (the design's mobile
          photo reads much brighter). Both now start at `md:`; below that
          there's no mask at all and a lighter gradient, restored to
          today's exact values from `md:` up. */}
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[72%] lg:w-[66%] md:[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.55)_16%,#000_38%)] md:[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.55)_16%,#000_38%)]"
      >
        <LazyLoopVideo
          key={activeTab.id}
          srcMp4={activeTab.video.mp4}
          srcWebm={activeTab.video.webm}
          poster={activeTab.poster}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070605]/30 via-transparent to-[#070605]/55 md:from-[#070605]/60 md:to-[#070605]/75" />
      </div>

      {/* Content anchors to the bottom third on mobile (design reference),
          vertically centered from `md:` up (unchanged). */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] max-w-[1440px] items-end px-6 pb-24 pt-20 sm:px-8 md:items-center md:pb-20 lg:px-12 xl:px-[72px]">
        <div className="max-w-[720px]">
          <div className="flex items-center gap-5 sm:gap-7">
            {/* 2026-10-02 fix, round 4 (owner: "LE logo should be bigger to
             * align with the margins of page"). The source file
             * (public/images/le-logo.webp) is a 1024x1024 canvas with the
             * actual gold mark inked into only its center ~52%x56% — lots of
             * transparent padding on every side. Sizing the <Image> itself
             * bigger (the first pass here) grows that invisible padding
             * along with the glyph, so the visible mark's left edge never
             * actually reaches the container's left edge (where "LUPFR"
             * below it does) — reading as both too small and misaligned.
             * Cropping out that padding (scale the image up, shift it by
             * the measured offset) makes the visible glyph itself fill and
             * left-align with this box, instead of just the invisible
             * canvas around it. A plain <img> is used instead of
             * next/image here since the crop needs direct, pixel-exact
             * width/position control next/image's `fill` mode doesn't
             * allow.
             *
             * Round 5 fix (owner, after seeing the crop live: "much better -
             * logo is too big on hero"). The crop itself was right — just
             * the box it's sized into came in too large relative to the
             * LUPFR wordmark beside it. Scaled the clamp() down (~35-40%
             * smaller at every breakpoint) so the mark reads as a companion
             * to the wordmark instead of competing with/outsizing it. */}
            <div className="relative aspect-[534/578] w-[clamp(64px,7.2vw,112px)] flex-none overflow-hidden drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- precise crop of the source canvas's internal padding; next/image's `fill` can't offset by percentages like this */}
              <img
                src="/images/le-logo.webp"
                alt=""
                className="absolute"
                style={{ width: "191.76%", height: "191.76%", left: "-46.82%", top: "-41.23%", maxWidth: "none" }}
              />
            </div>
            <span aria-hidden className="h-[120px] w-px bg-gradient-to-b from-transparent via-[#e8caa0] to-transparent max-[760px]:hidden" />
            <div>
              <h1 className="font-condensed text-[clamp(70px,9vw,132px)] font-extrabold uppercase leading-[0.78] tracking-[0.01em] text-[#fdf6e8]">LUPFR</h1>
              {/* 2026-10-03 fix (owner, reference image attached: "make the
                  LUPFR Entertainment Look like this (entertainment spread
                  across to fit exactly under LUPFR)"). `justify-between` on
                  a flex container only spreads multiple flex-item children —
                  against a single "ENTERTAINMENT" text node it was a no-op,
                  so the word sat left-aligned under "LUPFR" instead of
                  spanning its full width. Splitting it into one <span> per
                  letter gives justify-between real children to distribute;
                  `w-full` makes the row span exactly as wide as the "LUPFR"
                  h1 above it (its sibling in the same flex column), matching
                  the reference image. Per-letter tracking already comes from
                  the spread itself, so the old `tracking-[0.25em]` (which
                  fought justify-between by adding its own letter-spacing) is
                  dropped. */}
              <div className="mt-4 flex w-full justify-between font-mono text-[clamp(10px,1vw,16px)] uppercase text-[#e8caa0]" aria-hidden="true">
                {"ENTERTAINMENT".split("").map((letter, i) => (
                  <span key={i}>{letter}</span>
                ))}
              </div>
              <span className="sr-only">Entertainment</span>
            </div>
          </div>
          <div aria-hidden className="mt-8 h-[2px] w-[110px] bg-[#c9a869] max-[760px]:hidden" />
          {/* v5 (2026-11-17): the periods become gold skewed "//" dividers; the line may
              wrap on phones (≤760px). */}
          <div data-testid="hero-tagline" className="mt-7 font-condensed text-[clamp(22px,2.1vw,30px)] font-semibold uppercase leading-[1.15] tracking-[0.06em] text-[#fdf6e8] max-[760px]:mt-[18px] max-[760px]:text-[clamp(13px,3.9vw,17px)] min-[761px]:whitespace-nowrap">
            Real Experiences
            <span aria-hidden className="mx-[0.32em] inline-block -skew-x-12 text-[#c9a869]">{"//"}</span>
            Music-Led
            <span aria-hidden className="mx-[0.32em] inline-block -skew-x-12 text-[#c9a869]">{"//"}</span>
            <GoldShineText scrollTargetRef={ref}>Built for You.</GoldShineText>
          </div>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link href={CONTACT_PAGE_PATH} className="rounded-sm btn-metallic-gold px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em]">Plan Your Event</Link>
            <a href="#events" className="rounded-sm border border-[#e8caa0]/55 bg-black/35 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-[#e8caa0] max-[760px]:hidden">Explore Our Work</a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-12 z-20 hidden w-[500px] grid-cols-3 gap-5 lg:grid">
        {HERO_TABS.map((tab, i) => {
          const brand = HERO_TAB_BRANDS[i]
          const on = active === i
          return (
            <button key={tab.id} type="button" onClick={() => setActive(i)} aria-current={on ? "true" : undefined} className="flex min-w-0 flex-col gap-2 text-left">
              <span
                data-testid="hero-tab-brand"
                className={`font-condensed text-[clamp(18px,1.5vw,24px)] font-extrabold uppercase leading-none tracking-[0.02em] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-[0.42]"}`}
              >
                {brand ? <BrandWordmark brand={brand} className="text-[#fdf6e8]" /> : <span className="text-[#fdf6e8]">{tab.label}</span>}
              </span>
              <span className={`block truncate font-mono text-[9px] uppercase tracking-[0.14em] ${on ? "text-[#e8caa0]" : "text-[#f2ede4]/50"}`}>
                0{i + 1} · {tab.label}
              </span>
              <span className="mt-0.5 block h-[2px] bg-white/20">
                <span className={`block h-full bg-[#c9a869] transition-all ${on ? "w-full" : "w-0"}`} />
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
