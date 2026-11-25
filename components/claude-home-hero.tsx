"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { useClientPrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * LUPFR Website Design v6 (owner, 2026-11-24) hero: full-screen, extending behind the top bar (the
 * nav is transparent at the top of the page and turns solid on scroll — see claude-home-navigation.tsx).
 * Background is the rotating event videos (Bal Masque, SEA//SIDE Series, Golden Gate), with the gold
 * production photo as the always-present fallback underneath. The LE mark is centred; the tagline and
 * the two buttons sit at the bottom. The dark fade at the top keeps the nav readable; the
 * "//" dividers are thin and low-key. The old left-aligned lockup (LUPFR wordmark + 01/02/03 picker) is retired.
 *
 * Media is the same already-verified-real assets Featured Experiences uses (see the notes in
 * claude-home-experiences.tsx); a small hero-only list keeps the coupling low. Autoplay advances every
 * HERO_AUTOPLAY_MS and is paused under prefers-reduced-motion, like LazyLoopVideo itself.
 */
type HeroTab = {
  id: string
  video: { mp4: string; webm: string }
  poster: string
}

const HERO_TABS: readonly HeroTab[] = [
  { id: "bal-masque", video: { mp4: "/events/bal_masque_loop.mp4", webm: "/events/bal_masque_loop.webm" }, poster: "/events/bal_masque_wings.webp" },
  { id: "seaside", video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" }, poster: "/events/seaside_series_dj.webp" },
  { id: "golden-gate", video: { mp4: "/events/ggl_main_video.mp4", webm: "/events/ggl_main_video.webm" }, poster: "/events/ggl_main_dj.webp" },
] as const

const HERO_AUTOPLAY_MS = 7000
const HERO_FALLBACK = "/events/hero-gold-fallback.webp"

export function ClaudeHomeHero() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeTab = HERO_TABS[active]
  const reducedMotion = useClientPrefersReducedMotion()

  // Re-keyed off `active` so every advance restarts a fresh window.
  useEffect(() => {
    if (reducedMotion) return
    const id = window.setTimeout(() => {
      setActive((i) => (i + 1) % HERO_TABS.length)
    }, HERO_AUTOPLAY_MS)
    return () => window.clearTimeout(id)
  }, [active, reducedMotion])

  return (
    <section ref={ref} id="hero" className="relative h-[100svh] min-h-[640px] overflow-hidden border-b border-white/10 bg-[#070605] text-[#f3efe6]">
      <Image src={HERO_FALLBACK} alt="" fill priority sizes="100vw" data-testid="hero-fallback" className="object-cover brightness-[0.62]" style={{ objectPosition: "50% 55%" }} />
      <div className="absolute inset-0 brightness-[0.7] saturate-[0.9]">
        <LazyLoopVideo
          key={activeTab.id}
          srcMp4={activeTab.video.mp4}
          srcWebm={activeTab.video.webm}
          poster={activeTab.poster}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      {/* Radial dark spot behind the mark, a strong dark fade at the very top (nav legibility), and the page colour at the bottom. */}
      <div
        aria-hidden
        data-testid="hero-top-fade"
        className="absolute inset-0 bg-[radial-gradient(circle_360px_at_50%_43%,rgba(7,6,5,0.6)_0%,rgba(7,6,5,0)_100%),linear-gradient(180deg,rgba(7,6,5,0.85)_0%,rgba(7,6,5,0.55)_9%,rgba(7,6,5,0)_24%,rgba(7,6,5,0)_55%,#070605_100%)]"
      />
      <svg aria-hidden viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" fill="none" stroke="#c9a869" strokeWidth="1.5" strokeOpacity="0.45">
        <path d="M388 760 L512 760 L833 0 L709 0 Z M557 760 L681 760 L1002 0 L878 0 Z" />
      </svg>
      <svg aria-hidden viewBox="0 0 1440 760" preserveAspectRatio="xMidYMid slice" className="absolute left-3 top-0 h-full w-full" fill="none" stroke="#ecd9b0" strokeWidth="1" strokeOpacity="0.28">
        <path d="M388 760 L512 760 L833 0 L709 0 Z M557 760 L681 760 L1002 0 L878 0 Z" />
      </svg>

      <h1 className="sr-only">LUPFR Entertainment</h1>
      {/* The source file (public/images/le-logo.webp) is a 1024x1024 canvas with the gold mark inked into only its
          centre ~52%x56%; the crop makes the visible glyph fill this box (see the round 4 note in git history). */}
      <div
        data-testid="hero-logo"
        className="absolute left-1/2 top-[42%] aspect-[534/578] w-[clamp(120px,13vw,190px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden drop-shadow-[0_10px_24px_rgba(0,0,0,0.75)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- precise crop of the source canvas's internal padding; next/image's `fill` can't offset by percentages like this */}
        <img
          src="/images/le-logo.webp"
          alt=""
          className="absolute"
          style={{ width: "191.76%", height: "191.76%", left: "-46.82%", top: "-41.23%", maxWidth: "none" }}
        />
      </div>

      <div className="absolute inset-x-6 bottom-14 flex flex-col items-center gap-[22px] text-center">
        <div data-testid="hero-tagline" className="font-condensed text-[clamp(18px,2vw,28px)] font-semibold uppercase leading-[1.15] tracking-[0.06em] text-[#fdf6e8] max-[760px]:text-[clamp(13px,3.9vw,17px)] min-[761px]:whitespace-nowrap">
          Real Experiences
          <span aria-hidden className="mx-[0.32em] inline-block -skew-x-12 font-light text-[#c9a869] opacity-70">{"//"}</span>
          Music-Led
          <span aria-hidden className="mx-[0.32em] inline-block -skew-x-12 font-light text-[#c9a869] opacity-70">{"//"}</span>
          <GoldShineText scrollTargetRef={ref}>Built for You.</GoldShineText>
        </div>
        <div className="flex flex-wrap justify-center gap-3.5">
          <Link href={CONTACT_PAGE_PATH} className="rounded-sm btn-metallic-gold px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em] max-[1023px]:hidden">Plan Your Event</Link>
          <a href="#events" className="rounded-sm border border-[#e8caa0]/55 bg-black/45 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-[#e8caa0] max-[760px]:hidden">Explore Our Work</a>
        </div>
      </div>
    </section>
  )
}
