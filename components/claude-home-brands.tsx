"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { brandPath, brandPlainTitle, getBrandsByDivision, PLATFORM_PROGRAMS } from "@/lib/data/brands"

const { liveEvents, corporateMedia } = getBrandsByDivision()
const operating = [...liveEvents, ...corporateMedia]

export function ClaudeHomeBrands() {
  const [tab, setTab] = useState<"operating" | "platform">("operating")
  return (
    <section id="brands" className="border-b border-white/10 bg-[#070605] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">The Portfolio</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Our Brands</h2></div>
          <div className="flex overflow-hidden rounded-full border border-white/15">
            {(["operating", "platform"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${tab === t ? "bg-[#c9a869] text-[#1a1408]" : "text-[#bdb6a9]"}`}>{t}</button>)}
          </div>
        </div>

        {tab === "operating" ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {operating.map((brand) => (
              <Link key={brand.key} href={brandPath(brand)} className="group relative aspect-[3/4] overflow-hidden bg-[#141210]">
                {brand.image ? <Image src={brand.image} alt={brandPlainTitle(brand)} fill sizes="(min-width:1280px) 20vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-5"><p className="font-mono text-[9px] uppercase tracking-[0.15em]" style={{ color: brand.accent }}>{brand.tag}</p><h3 className="mt-2 font-condensed text-2xl font-extrabold uppercase text-white">{brandPlainTitle(brand)}</h3></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {PLATFORM_PROGRAMS.map((program) => (
              <div key={program.name} className="relative aspect-[3/4] overflow-hidden bg-[#141210]">
                <Image src={program.image} alt="" fill sizes="(min-width:1280px) 20vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/20" />
                <div className="absolute inset-x-0 bottom-0 p-5"><p className="font-mono text-[9px] text-[#c9a869]">{program.num}</p><h3 className="mt-2 font-condensed text-2xl font-extrabold uppercase text-white">{program.name}</h3><p className="mt-2 text-xs leading-relaxed text-white/65">{program.line}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
