"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { HERO_FILMSTRIP_PHOTOS } from "@/components/hero-shared"
import { CONTACT_PAGE_PATH } from "@/lib/site"

const slides = HERO_FILMSTRIP_PHOTOS.slice(0, 3)

export function ClaudeHomeHero() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % slides.length), 6500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section ref={ref} id="hero" className="relative min-h-[100svh] overflow-hidden border-b border-white/10 bg-[#070605] pt-[76px] text-[#f3efe6]">
      <div
        className="absolute inset-y-0 right-0 w-full md:w-[72%] lg:w-[66%]"
        style={{ WebkitMaskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)", maskImage: "linear-gradient(90deg,transparent 0%,rgba(0,0,0,.55) 16%,#000 38%)" }}
      >
        {slides.map((slide, i) => (
          <div key={slide.id} className={`absolute inset-0 transition-opacity duration-[1100ms] ${active === i ? "opacity-100" : "opacity-0"}`}>
            <Image src={slide.src} alt={slide.alt} fill priority={i === 0} sizes="(min-width:1024px) 66vw, 100vw" className="object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070605]/60 via-transparent to-[#070605]/75" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] max-w-[1440px] items-center px-6 py-20 sm:px-8 lg:px-12 xl:px-[72px]">
        <div className="max-w-[720px]">
          <div className="flex items-center gap-5 sm:gap-7">
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
