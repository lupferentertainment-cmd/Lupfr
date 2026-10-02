"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { HERO_FILMSTRIP_PHOTOS } from "@/components/hero-shared"
import { CONTACT_PAGE_PATH } from "@/lib/site"

const slides = HERO_FILMSTRIP_PHOTOS.slice(0, 3)

/**
 * 2026-10-02 fix (owner report: "the hero videos arent there, the LUPFR logo
 * on hero is not there"). The design file's `#hero` (`heroStack`) is a real
 * looping video behind the lockup, plus a small `assets/le-logo.png` mark
 * beside the LUPFR wordmark (`lp-hero-mark`) — the first pass here dropped
 * both in favor of a photo-only filmstrip with a text-only lockup.
 *
 * Video: `/hero/hero_yacht_001.mp4` is reused rather than re-decided here —
 * it's the one hero video asset in `public/hero/` the owner explicitly kept
 * (see docs/CHANGELOG.md "hero drone video" / "hero video reviewed, no
 * gap" entries, 2026-07-17), before the 2026-08-28 restructure retired the
 * single-video hero for the photo filmstrip. No .webm sibling exists for it
 * (it predates this redesign's webm-pair convention), so `LazyLoopVideo`'s
 * `srcWebm` is left optional for this one caller. The 3-photo picker below
 * stays real photos — the design's own 3-item `heroTabs` picker is a caption
 * index over the hero media, not a claim that 3 distinct videos exist.
 *
 * Logo: `/images/le-logo.webp` is the same real LE mark already used as a
 * watermark on Team/Brands (see tests/unit/brands-le-watermark.test.ts) —
 * not a new asset.
 */
const HERO_VIDEO_SRC = "/hero/hero_yacht_001.mp4"

export function ClaudeHomeHero() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#070605] pt-[76px] text-[#f3efe6]">
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[72%] lg:w-[66%]"
        style={{ WebkitMaskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)", maskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)" }}
      >
        <LazyLoopVideo srcMp4={HERO_VIDEO_SRC} poster={slides[0].src} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070605]/60 via-transparent to-[#070605]/75" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] max-w-[1440px] items-center px-6 py-20 sm:px-8 lg:px-12 xl:px-[72px]">
        <div className="max-w-[720px]">
          <div className="flex items-center gap-5 sm:gap-7">
            <Image
              src="/images/le-logo.webp"
              alt=""
              width={96}
              height={100}
              className="h-[clamp(52px,6.5vw,88px)] w-auto flex-none object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)]"
            />
            <span className="h-[120px] w-px bg-gradient-to-b from-transparent via-[#e8caa0] to-transparent" />
            <div>
              <h1 className="font-condensed text-[clamp(70px,9vw,132px)] font-extrabold uppercase leading-[0.78] tracking-[0.01em] text-[#fdf6e8]">LUPFR</h1>
              <div className="mt-4 flex justify-between font-mono text-[clamp(10px,1vw,16px)] uppercase tracking-[0.25em] text-[#e8caa0]">ENTERTAINMENT</div>
            </div>
          </div>
          <div className="mt-8 h-[2px] w-[110px] bg-[#c9a869]" />
          <div className="mt-7 font-condensed text-[clamp(22px,2.1vw,30px)] font-semibold uppercase tracking-[0.06em] text-[#fdf6e8]">
            Real Experiences. Music-Led. <GoldShineText scrollTargetRef={ref}>Built for You.</GoldShineText>
          </div>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link href={CONTACT_PAGE_PATH} className="rounded-sm btn-metallic-gold px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-[0.16em]">Plan Your Event</Link>
            <a href="#events" className="rounded-sm border border-[#e8caa0]/55 bg-black/35 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-[#e8caa0]">Explore Our Work</a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-20 hidden w-[440px] grid-cols-3 gap-4 lg:grid">
        {slides.map((slide, i) => (
          <button key={slide.id} type="button" onClick={() => setActive(i)} className="min-w-0 text-left">
            <span className={`block truncate font-mono text-[9.5px] tracking-[0.12em] ${active === i ? "text-[#e8caa0]" : "text-white/45"}`}>0{i + 1} · {slide.alt}</span>
            <span className="mt-2 block h-[2px] bg-white/20"><span className={`block h-full bg-[#c9a869] transition-all ${active === i ? "w-full" : "w-0"}`} /></span>
          </button>
        ))}
      </div>
    </section>
  )
}
