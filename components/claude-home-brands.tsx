"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BrandSlashText } from "@/components/brand-slash-text"
import { brandPath, getBrandsByDivision, PLATFORM_PROGRAMS, type BrandItem } from "@/lib/data/brands"

/**
 * 2026-10-02 fix (owner report, screenshots of the live preview: "a lot of
 * the features and design still did not make it in"): the first pass of
 * this section flattened all 5 operating brands into one undifferentiated
 * grid with name + tag only, dropping the division grouping, the real
 * per-brand description copy, and the "Explore" CTA that the design file's
 * `#experiences` ("Our Brands") poster-tile grid actually has — and that the
 * site's OWN pre-redesign `components/brands.tsx` (now unused on any route,
 * see its "CORPORATE // MEDIA" owner punch-list history) already carried,
 * tested, and owner-iterated on for months (division rule bars in each
 * brand's/gold accent, `brand.description`, numbered tag/index badges,
 * "Explore →"). This rebuilds the same structure/content directly (not by
 * importing that component, which is wired to the sitewide light/dark theme
 * tokens the Oct 1 redesign deliberately opts out of — see docs/DESIGN.md's
 * "Homepage redesign" entry) with this redesign's own fixed dark palette.
 */
const { liveEvents, corporateMedia } = getBrandsByDivision()
const DIVISION_ACCENTS = { liveEvents: liveEvents[0].accent, corporateMedia: "#c9a869" }

function BrandPosterTile({ brand, index }: { brand: BrandItem; index: number }) {
  const numeral = String(index + 1).padStart(2, "0")
  return (
    <Link
      href={brandPath(brand)}
      className="group relative aspect-[3/4] overflow-hidden border border-white/10 bg-[#141210]"
    >
      {brand.image ? (
        <Image
          src={brand.image}
          alt=""
          fill
          sizes="(min-width:1280px) 20vw, (min-width:1024px) 33vw, 50vw"
          className="object-cover transition duration-700 group-hover:scale-[1.06]"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/55" />
      <span
        className="absolute left-4 top-4 rounded-[2px] border px-2 py-1 font-mono text-[9px] uppercase tracking-wider"
        style={{ borderColor: brand.accent, color: brand.accent, backgroundColor: "rgba(8,7,6,0.5)" }}
      >
        {brand.tag}
      </span>
      <span className="absolute right-4 top-[18px] font-mono text-[10px] text-white/45">{numeral}</span>
      <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
        <h3 className="font-condensed text-2xl font-extrabold uppercase leading-none text-white">
          <BrandSlashText text={brand.title} color={brand.accent} />
        </h3>
        <p className="mt-2.5 line-clamp-3 text-[12.5px] leading-relaxed text-white/70">{brand.description}</p>
        <div className="mt-3.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: brand.accent }}>
          Explore <span aria-hidden>→</span>
        </div>
      </div>
    </Link>
  )
}

function DivisionLabel({ before, after, accent }: { before: string; after: string; accent: string }) {
  return (
    <div className="col-span-full flex min-w-0 items-center gap-2.5">
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: accent }}>
        {before} <span aria-hidden>{"//"}</span> {after}
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: accent }} aria-hidden />
    </div>
  )
}

export function ClaudeHomeBrands() {
  const [tab, setTab] = useState<"operating" | "platform">("operating")
  return (
    <section id="brands" className="border-b border-white/10 bg-[#070605] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Ten Platforms. One Company.</p>
            <h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Our Brands</h2>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex overflow-hidden rounded-full border border-white/15">
              {(["operating", "platform"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${tab === t ? "bg-[#c9a869] text-[#1a1408]" : "text-[#bdb6a9]"}`}>
                  {t}
                </button>
              ))}
            </div>
            <Link href="/brands" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">Explore LUPFR →</Link>
          </div>
        </div>

        {tab === "operating" ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <DivisionLabel before="Live" after="Events" accent={DIVISION_ACCENTS.liveEvents} />
            {liveEvents.map((brand, i) => <BrandPosterTile key={brand.key} brand={brand} index={i} />)}
            <DivisionLabel before="Corporate" after="Media" accent={DIVISION_ACCENTS.corporateMedia} />
            {corporateMedia.map((brand, i) => <BrandPosterTile key={brand.key} brand={brand} index={liveEvents.length + i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
            {PLATFORM_PROGRAMS.map((program) => (
              <div key={program.name} className="relative aspect-[3/4] overflow-hidden border border-[#c9a869]/30 bg-[#141210]">
                <Image src={program.image} alt="" fill sizes="(min-width:1280px) 20vw, 50vw" className="object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/25 to-black/50" />
                <div className="absolute inset-0 flex flex-col justify-between p-5">
                  <span className="font-mono text-[10.5px] text-[#c9a869]">{program.num}</span>
                  <div className="flex flex-col gap-2.5">
                    <h3 className="font-condensed text-2xl font-bold uppercase leading-[0.95] text-white">{program.name}</h3>
                    <p className="text-[12.5px] leading-relaxed text-white/75">{program.line}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
