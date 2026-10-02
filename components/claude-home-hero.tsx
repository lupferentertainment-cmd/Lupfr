"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
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
 * - Golden Gate (Zusebi 002): no real video asset exists anywhere in
 *   `public/` for this case study — only photos — so per the "never
 *   fabricate media" rule its tab uses the real photo
 *   `/events/ggl_main_dj.webp` instead of inventing a video.
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
  label: string
  video?: { mp4: string; webm: string }
  poster: string
  alt: string
}

const HERO_TABS: readonly HeroTab[] = [
  {
    id: "bal-masque",
    label: "Bal Masque",
    video: { mp4: "/events/bal_masque_loop.mp4", webm: "/events/bal_masque_loop.webm" },
    poster: "/events/bal_masque_wings.webp",
    alt: "Bal Masque — feathered wings installation",
  },
  {
    id: "seaside",
    label: "SEA//SIDE",
    video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" },
    poster: "/events/seaside_series_dj.webp",
    alt: "DJ set aboard a SEA//SIDE Series sailing",
  },
  {
    id: "golden-gate",
    label: "Golden Gate",
    poster: "/events/ggl_main_dj.webp",
    alt: "Zusebi 002: Golden Gate Live — DJ set at Lands End",
  },
] as const

export function ClaudeHomeHero() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeTab = HERO_TABS[active]

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#070605] pt-[76px] text-[#f3efe6]">
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[72%] lg:w-[66%]"
        style={{ WebkitMaskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)", maskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)" }}
      >
        {activeTab.video ? (
          <LazyLoopVideo
            key={activeTab.id}
            srcMp4={activeTab.video.mp4}
            srcWebm={activeTab.video.webm}
            poster={activeTab.poster}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <Image key={activeTab.id} src={activeTab.poster} alt={activeTab.alt} fill priority sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
        )}
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
        {HERO_TABS.map((tab, i) => (
          <button key={tab.id} type="button" onClick={() => setActive(i)} className="min-w-0 text-left">
            <span className={`block truncate font-mono text-[9.5px] uppercase tracking-[0.12em] ${active === i ? "text-[#e8caa0]" : "text-white/45"}`}>0{i + 1} · {tab.label}</span>
            <span className="mt-2 block h-[2px] bg-white/20"><span className={`block h-full bg-[#c9a869] transition-all ${active === i ? "w-full" : "w-0"}`} /></span>
          </button>
        ))}
      </div>
    </section>
  )
}
