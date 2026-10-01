"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { artistSlug, getArtists } from "@/lib/data/artists"

const artists = getArtists().slice(0, 8)

export function Artists() {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="artists"
      ref={ref}
      className="border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Music & Entertainment</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(44px,5vw,68px)] font-extrabold uppercase leading-[0.92] tracking-[-0.025em]">
              <GoldShineText scrollTargetRef={ref}>Past Artists</GoldShineText>
            </h2>
          </div>
          <Link href="/artists" className="w-fit border-b border-accent pb-1 text-sm font-medium text-accent">
            View Artist Roster →
          </Link>
        </div>

        <div className="grid auto-rows-[clamp(210px,22vw,300px)] grid-cols-2 gap-3 md:grid-cols-4">
          {artists.map((artist, i) => {
            const large = i === 0 || i === 5
            const href = artist.spotify || `/artists?artist=${artistSlug(artist.name)}`
            const external = Boolean(artist.spotify)
            return (
              <a
                key={artist.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`group relative overflow-hidden rounded-sm border border-border bg-card ${large ? "col-span-2 row-span-2 md:col-span-2" : ""}`}
              >
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes={large ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                  className="object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080706]/90 via-transparent to-black/10" />
                <span className="absolute left-3 top-3 font-mono text-[10px] text-white/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="absolute inset-x-4 bottom-4 flex flex-col gap-1.5">
                  <span className={`font-[family-name:var(--font-barlow-condensed)] font-extrabold uppercase leading-[0.9] text-white ${large ? "text-[clamp(34px,5vw,64px)]" : "text-[clamp(24px,3vw,38px)]"}`}>
                    {artist.name}
                  </span>
                  <span className="flex items-center justify-between gap-3 font-mono text-[9.5px] uppercase tracking-[0.13em] text-[#e8caa0]">
                    <span>{artist.genre}</span>
                    <span className="text-white/70">{external ? "Spotify ↗" : "Profile →"}</span>
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      </ScrollReveal>
    </section>
  )
}
