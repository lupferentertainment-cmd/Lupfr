"use client"

import { GoldShineText } from "@/components/gold-shine-text"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { PLATFORM_PROGRAMS } from "@/lib/data/brands"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { getServices } from "@/lib/data/services"

const services = getServices()

/** Per-tile photo focus (design `v6Svc[].pos`); anything unlisted is centred. */
const IMAGE_POSITIONS: Record<string, string> = {
  "Private Events": "50% 45%",
  "Brand Activations": "50% 45%",
  "Music & Entertainment": "50% 40%",
  "Venue Programming": "50% 40%",
  Production: "50% 55%",
  "Content & Media": "50% 35%",
}

const PLAN_CTA =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[2px] border border-[rgba(243,227,196,0.7)] bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] px-[18px] py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1a1408] no-underline"

type Tab = "services" | "platforms"

interface Tile {
  num: string
  title: string
  description: string
  image?: string
  position: string
}

/**
 * LUPFR Website Design v6 (owner, 2026-11-24) — "Idea to execution." is two rows of three wide slanted
 * tiles (slanted at both ends and overlapping slightly): an outlined gold number, a one-line title and a
 * short description on each, photos at near full brightness. The Services / Platforms toggle at the top
 * right swaps the same tile design to the five LUPFR platforms (numbered 07-11, images from
 * `PLATFORM_PROGRAMS`). "Full event design & execution" is a slim strip below the tiles with a low-key
 * "Plan Your Full Event" text link. At <=900px the tiles stack one per row.
 */
export function ClaudeHomeServices() {
  const [tab, setTab] = useState<Tab>("services")
  const serviceTiles: Tile[] = services.map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: s.title,
    description: s.description,
    image: s.image,
    position: IMAGE_POSITIONS[s.title] ?? "50% 50%",
  }))
  const platformTiles: Tile[] = PLATFORM_PROGRAMS.map((p, i) => ({
    num: String(i + services.length + 1).padStart(2, "0"),
    title: p.name,
    description: p.line,
    image: p.image,
    position: "50% 50%",
  }))
  const tiles = tab === "services" ? serviceTiles : platformTiles
  const rows = [tiles.slice(0, 3), tiles.slice(3, 6)].filter((r) => r.length > 0)

  return (
    <section id="services" className="relative border-b border-white/10 bg-[#070605] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[901px]:px-12 min-[901px]:py-[84px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-4 min-[901px]:mb-9">
          <div className="flex flex-col items-start">
            <div className="mb-5 flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(01)</span>
              <span>SERVICES</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(42px,4.8vw,72px)] font-extrabold uppercase leading-[0.88] tracking-[0.005em]">
              <GoldShineText>Idea to execution.</GoldShineText>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-6 max-[900px]:gap-3.5">
            <div role="group" aria-label="Services or platforms" className="flex gap-1 rounded-full border border-[rgba(201,168,105,0.45)] p-1">
              {(
                [
                  ["services", "Services", serviceTiles.length],
                  ["platforms", "Platforms", platformTiles.length],
                ] as const
              ).map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={tab === key}
                  onClick={() => setTab(key)}
                  className={`flex items-baseline gap-2 rounded-full px-[18px] py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${tab === key ? "bg-[#c9a869] text-[#1a1408]" : "text-[#e8caa0]"}`}
                >
                  {label}
                  <span className="opacity-60">{String(count).padStart(2, "0")}</span>
                </button>
              ))}
            </div>
            <Link href={CONTACT_PAGE_PATH} data-testid="services-header-cta" className={PLAN_CTA}>
              Plan Your Event <span aria-hidden>→</span>
            </Link>
          </div>
        </div>

        <div data-testid="services-grid" data-tab={tab} className="flex flex-col gap-4 max-[900px]:gap-2.5">
          {rows.map((row, r) => (
            <div key={r} className="flex max-[900px]:flex-col max-[900px]:gap-2.5">
              {row.map((tile, i) => (
                <article
                  key={tile.title}
                  data-testid="service-card"
                  className={`relative aspect-[2/1] w-[34.84%] flex-none overflow-hidden bg-[#0d0c0a] [clip-path:polygon(10%_0,100%_0,90%_100%,0_100%)] max-[900px]:aspect-auto max-[900px]:h-[190px] max-[900px]:w-full max-[900px]:[clip-path:polygon(4%_0,100%_0,96%_100%,0_100%)] ${i > 0 ? "-ml-[2.265%] max-[900px]:ml-0" : ""}`}
                >
                  {tile.image ? (
                    <Image src={tile.image} alt="" fill sizes="(max-width: 900px) 100vw, 34vw" className="object-cover" style={{ objectPosition: tile.position }} />
                  ) : null}
                  <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,5,0.85)_0%,rgba(7,6,5,0.55)_45%,rgba(7,6,5,0.05)_80%)]" />
                  <div className="absolute inset-y-[13%] left-[11.7%] right-[22%] flex flex-col justify-between max-[900px]:inset-y-[22px] max-[900px]:left-8 max-[900px]:right-8">
                    <span className="font-condensed text-[clamp(36px,3.8vw,52px)] font-bold leading-[0.8] text-transparent [-webkit-text-stroke:1.2px_#c9a869]">{tile.num}</span>
                    <div className="flex flex-col gap-2">
                      <h3 className="m-0 whitespace-nowrap font-condensed text-[clamp(21px,2.1vw,30px)] font-extrabold uppercase leading-[0.95] text-[#fdf6e8] max-[900px]:whitespace-normal max-[900px]:text-[26px]">{tile.title}</h3>
                      <p className="m-0 max-w-[240px] text-pretty text-[clamp(11.5px,0.95vw,13px)] leading-[1.45] text-[#d8d1c4] max-[900px]:max-w-[300px] max-[900px]:text-[13px]">{tile.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-y border-[#2a2620] py-4">
          <div className="flex flex-wrap items-baseline gap-x-[18px] gap-y-1">
            <span className="font-mono text-[11px] tracking-[0.22em] text-[#c9a869]">FULL SCALE</span>
            <span className="font-condensed text-2xl font-extrabold uppercase leading-none text-[#fdf6e8]">Full event design &amp; execution</span>
            <span className="text-sm text-[#b9b1a2]">Every service above, planned and run as one event by one team.</span>
          </div>
          <Link
            href={CONTACT_PAGE_PATH}
            data-testid="services-footer-cta"
            className="whitespace-nowrap border-b border-[rgba(201,168,105,0.6)] pb-[3px] font-mono text-xs uppercase tracking-[0.18em] text-[#e8caa0] no-underline transition-colors hover:text-[#fdf6e8]"
          >
            Plan Your Full Event <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
