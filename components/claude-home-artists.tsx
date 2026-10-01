"use client"

import Image from "next/image"
import Link from "next/link"
import { artistSlug, getArtists } from "@/lib/data/artists"

const artists = getArtists().slice(0, 12)

export function ClaudeHomeArtists() {
  return (
    <section id="artists" className="border-b border-white/10 bg-[#070605] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">The Sound</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Past Artists</h2></div><Link href="/artists" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all artists →</Link></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {artists.map((artist, i) => (
            <Link key={artist.id} href={`/artists?artist=${artistSlug(artist.name)}`} className={`group relative overflow-hidden bg-[#141210] ${i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"}`}>
              {artist.image ? <Image src={artist.image} alt={artist.name} fill sizes="(min-width:1280px) 16vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" /> : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4"><h3 className="font-condensed text-xl font-extrabold uppercase text-white">{artist.name}</h3><p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#c9a869]">{artist.genre}</p></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
