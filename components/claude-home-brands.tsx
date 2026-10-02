"use client"

import Image from "next/image"
import Link from "next/link"
import { m, useInView } from "framer-motion"
import { useRef, useState } from "react"
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
 *
 * 2026-10-02 second fix (owner report: "the OUR Brands looks off - should be
 * pretty similar to how it was in the current website"): the first fix above
 * still read as flatter than `components/brands.tsx` — no entrance animation,
 * and both division dividers spanned the full grid width equally instead of
 * the real design file's proportioned single-row bar (`#experiences`'s own
 * `lp-brands-divider`: `grid-column:span 3` for Live//Events next to `span 2`
 * for Corporate//Media, a 3:2 split matching the 3+2 card count). Restored
 * that proportioned top bar (xl+, where all 5 cards actually share one row)
 * with the design file's own literal divider colors — Live//Events blue
 * (`rgba(63,124,191)` / `#7aa7dc`), independent of any one brand's own accent
 * — falling back to per-group inline labels below xl exactly as
 * `components/brands.tsx` already does, plus that component's ScrollReveal-
 * style staggered entrance.
 */
const { liveEvents, corporateMedia } = getBrandsByDivision()
const DIVISION_ACCENTS = { liveEvents: "#7aa7dc", corporateMedia: "#c9a869" }

function BrandPosterTile({ brand, index, isInView }: { brand: BrandItem; index: number; isInView: boolean }) {
  const numeral = String(index + 1).padStart(2, "0")
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={brandPath(brand)}
        className="group relative block aspect-[3/4] overflow-hidden border border-white/10 bg-[#141210]"
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
    </m.div>
  )
}

function DivisionLabel({ before, after, accent, inline }: { before: string; after: string; accent: string; inline?: boolean }) {
  return (
    <div className={inline ? "col-span-full flex min-w-0 items-center gap-2.5 xl:hidden" : "flex min-w-0 items-center gap-2.5"}>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: accent }}>
        {before} <span aria-hidden>{"//"}</span> {after}
      </span>
      <span className="h-px flex-1" style={{ backgroundColor: accent }} aria-hidden />
    </div>
  )
}

export function ClaudeHomeBrands() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" })
  const [tab, setTab] = useState<"operating" | "platform">("operating")
  return (
    <section id="brands" ref={ref} className="border-b border-white/10 bg-[#070605] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Ten Platforms. One Company.</p>
            <h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]">Our Brands</h2>
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
          <>
            {/* Single proportioned bar — only where all 5 cards actually share
                one row (xl+); below that the grid wraps into 1/2/3 columns, so
                this top bar would sit far above the groups it labels and the
                inline per-group labels in the grid below take over instead. */}
            <div className="mb-3 hidden items-center gap-4 sm:mb-4 xl:flex">
              <div style={{ flex: 3 }}><DivisionLabel before="Live" after="Events" accent={DIVISION_ACCENTS.liveEvents} /></div>
              <div style={{ flex: 2 }}><DivisionLabel before="Corporate" after="Media" accent={DIVISION_ACCENTS.corporateMedia} /></div>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-[18px] xl:grid-cols-5">
              <DivisionLabel before="Live" after="Events" accent={DIVISION_ACCENTS.liveEvents} inline />
              {liveEvents.map((brand, i) => <BrandPosterTile key={brand.key} brand={brand} index={i} isInView={isInView} />)}
              <DivisionLabel before="Corporate" after="Media" accent={DIVISION_ACCENTS.corporateMedia} inline />
              {corporateMedia.map((brand, i) => <BrandPosterTile key={brand.key} brand={brand} index={liveEvents.length + i} isInView={isInView} />)}
            </div>
          </>
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
