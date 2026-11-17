"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { BrandSlashText } from "@/components/brand-slash-text"
import { brandPath, getBrandsByDivision, PLATFORM_PROGRAMS, type BrandItem } from "@/lib/data/brands"

/**
 * LUPFR Website Design v5 (owner, 2026-11-17) — Our Brands, "Reveal" layout
 * (design variant br3). Both tabs share one tile: a 3:4.6 photo with a
 * brand-colour wash, an outlined index number, a small mono label, the brand
 * name, a description that is revealed on hover (always visible at <=1100px)
 * and an accent bar that grows on hover. Operating is a 6-column row in the
 * order SEA//SIDE, IN//SIDE, OUT//SIDE, SKI//SIDE, HIGH//RISE, SOUND//CHECK;
 * Platform is 5 columns. This replaces the v10 division-label poster grid
 * (the Live//Events and Corporate//Media rules are gone). Responsive: 3
 * columns at <=1100px (no photo filter), 2 at <=720px, 1 at <=480px with
 * shorter tiles. The small labels are the design file's own (the file wins
 * over the pasted list, e.g. SEA//SIDE reads "OFFSHORE EXPERIENCES").
 */
const { liveEvents, corporateMedia } = getBrandsByDivision()
const OPERATING = [...liveEvents, ...corporateMedia]

const BRAND_LABELS: Record<string, string> = {
  seaside: "SEA//SIDE OFFSHORE EXPERIENCES",
  inside: "IN//SIDE INDOOR NIGHTS",
  outside: "OUT//SIDE OPEN-AIR GATHERINGS",
  skiside: "SKI//SIDE APRÈS-SKI EXPERIENCES",
  highrise: "HIGH//RISE CORPORATE",
  soundcheck: "SOUND//CHECK MEDIA",
}

const PLATFORM_LABELS = ["VIP", "PROMOTER", "MEDIA", "HOSPITALITY", "VENTURES"]
const PLATFORM_ACCENT = "#c9a869"

/** Brand name with its divider: the brand's slash-mark image when it has one, else the accent-coloured text "//". */
function BrandTileTitle({ brand }: { brand: BrandItem }) {
  if (!brand.slashImage) return <BrandSlashText text={brand.title} color={brand.accent} />
  const [before, after] = brand.title.split("//")
  return (
    <span className="inline-flex items-center">
      {before}
      <span className="sr-only">{"//"}</span>
      <Image
        src={brand.slashImage}
        alt=""
        aria-hidden
        width={514}
        height={474}
        data-brand-slash-image
        className="mx-[0.08em] inline-block h-[0.78em] w-auto"
      />
      {after}
    </span>
  )
}

interface RevealTileProps {
  num: string
  label: string
  accent: string
  image?: string
  description: string
  title: React.ReactNode
  sizes: string
}

/** The shared Reveal tile body (design v5 `.lp-br3`), rendered inside a Link (operating) or a div (platform). */
function RevealTileBody({ num, label, accent, image, description, title, sizes }: RevealTileProps) {
  return (
    <>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes={sizes}
          className="object-cover brightness-[.72] saturate-[1.05] transition duration-700 group-hover:scale-[1.06] group-hover:brightness-[.92] max-[1100px]:brightness-100 max-[1100px]:saturate-100"
        />
      ) : null}
      <div
        aria-hidden
        data-testid="brand-wash"
        className="pointer-events-none absolute inset-0 opacity-[.22] mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40 max-[1100px]:hidden"
        style={{ backgroundColor: accent }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,5,0.35)_0%,rgba(7,6,5,0)_30%,rgba(7,6,5,0.55)_62%,rgba(7,6,5,0.95)_100%)]" />
      <span
        aria-hidden
        className="absolute left-4 top-3.5 font-condensed text-[26px] font-extrabold leading-none text-transparent [-webkit-text-stroke:1px_rgba(253,246,232,0.7)] max-[480px]:text-[24px]"
      >
        {num}
      </span>
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-4 pb-5 pt-4">
        <span
          data-testid="brand-label"
          className="w-fit font-mono text-[9.5px] uppercase leading-[1.4] tracking-[0.14em] max-[900px]:rounded-[2px] max-[900px]:bg-[rgba(8,7,6,0.72)] max-[900px]:px-2 max-[900px]:py-1 max-[900px]:text-[#f3efe6]"
          style={{ color: accent }}
        >
          {label}
        </span>
        <h3 className="m-0 font-condensed text-[clamp(18px,1.75vw,26px)] font-extrabold uppercase leading-[0.95] text-[#fdf6e8] max-[480px]:text-[30px]">{title}</h3>
        <p className="m-0 max-h-0 overflow-hidden text-[12.5px] leading-[1.5] text-[#e6e0d4] opacity-0 transition-all duration-500 group-hover:max-h-[90px] group-hover:opacity-100 group-focus-visible:max-h-[90px] group-focus-visible:opacity-100 max-[1100px]:max-h-[90px] max-[1100px]:opacity-100">
          {description}
        </p>
        <span
          aria-hidden
          data-testid="brand-bar"
          className="block h-[2px] w-full origin-left scale-x-[.18] transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
          style={{ backgroundColor: accent }}
        />
      </div>
    </>
  )
}

const TILE_CLASS =
  "group relative block aspect-[3/4.6] overflow-hidden rounded-[4px] border border-white/10 bg-[#141210] transition-transform duration-500 hover:-translate-y-1.5 focus-visible:-translate-y-1.5 max-[480px]:aspect-[5/3]"

const GRID_BASE = "grid gap-[10px] max-[1100px]:grid-cols-3 max-[720px]:grid-cols-2 max-[480px]:grid-cols-1"

export function ClaudeHomeBrands() {
  const [tab, setTab] = useState<"operating" | "platform">("operating")
  return (
    <section id="brands" className="border-b border-white/10 bg-[#070605] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[901px]:px-12 min-[901px]:py-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(03)</span>
              <span>ELEVEN PLATFORMS. ONE COMPANY.</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(42px,4.8vw,72px)] font-extrabold uppercase leading-[0.88] text-[#fdf6e8]">Our Brands</h2>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex overflow-hidden rounded-full border border-white/15">
              {(["operating", "platform"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${tab === t ? "bg-[#c9a869] text-[#1a1408]" : "text-[#bdb6a9]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <Link href="/brands" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">Explore LUPFR →</Link>
          </div>
        </div>

        {tab === "operating" ? (
          <div data-testid="brands-grid-operating" className={`${GRID_BASE} grid-cols-6`}>
            {OPERATING.map((brand, i) => (
              <Link key={brand.key} href={brandPath(brand)} className={TILE_CLASS}>
                <RevealTileBody
                  num={String(i + 1).padStart(2, "0")}
                  label={BRAND_LABELS[brand.key] ?? brand.tag}
                  accent={brand.accent}
                  image={brand.image}
                  description={brand.description}
                  title={<BrandTileTitle brand={brand} />}
                  sizes="(min-width:1101px) 16vw, (min-width:721px) 33vw, 50vw"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div data-testid="brands-grid-platform" className={`${GRID_BASE} grid-cols-5`}>
            {PLATFORM_PROGRAMS.map((program, i) => (
              <div key={program.name} className={TILE_CLASS}>
                <RevealTileBody
                  num={program.num}
                  label={PLATFORM_LABELS[i] ?? program.name}
                  accent={PLATFORM_ACCENT}
                  image={program.image}
                  description={program.line}
                  title={program.name}
                  sizes="(min-width:1101px) 20vw, (min-width:721px) 33vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
