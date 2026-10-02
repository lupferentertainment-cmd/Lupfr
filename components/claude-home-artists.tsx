"use client"

import Image from "next/image"
import Link from "next/link"
import { artistSlug, getArtists } from "@/lib/data/artists"

const artists = getArtists().slice(0, 12)

/**
 * 2026-10-02 fix (owner report, screenshots: "a lot of the features and
 * design still did not make it in"): the design file's "Past Artists" wall
 * (`#artists`) links each card straight to the artist's own Spotify profile
 * with a Spotify-branded "SPOTIFY ↗" chip and an index numeral — the first
 * pass here linked every card to the internal /artists roster instead and
 * dropped both. Real `artist.spotify` URLs already exist in data/artists.yml
 * (verified per the 2026-09-22 PLS&TY changelog entry); cards for an artist
 * with one now link out to it directly, matching the design, falling back to
 * the internal roster deep link only for the few artists without a verified
 * Spotify URL yet (never fabricated).
 */
function SpotifyGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#1ed760" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.2-.5 9.9 1.1.3.2.4.6.3.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.8-1.7-7-2.2-10.3-1.2a.8.8 0 1 1-.4-1.5c3.8-1.1 8.4-.6 11.5 1.4.3.2.4.7.2 1zm.1-2.8C14.6 9 9.2 8.8 6.1 9.8a.9.9 0 1 1-.5-1.8c3.6-1.1 9.5-.9 13.2 1.3a.9.9 0 0 1-.9 1.6z" />
    </svg>
  )
}

export function ClaudeHomeArtists() {
  return (
    <section id="artists" className="border-b border-white/10 bg-[#070605] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">The Sound</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Past Artists</h2></div><Link href="/artists" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all artists →</Link></div>
        {/* Design file's "art wall" (`lp-art-wall`) is a dense bento grid —
            `grid-auto-flow:dense` with a per-card rowSpan/colSpan the Coda
            prototype assigns arbitrarily for visual variety, not from any
            real fact about the artist. Approximated here the same way:
            [grid-auto-flow:dense] plus a deterministic size cycle (never a
            claim about any specific artist being "bigger"). */}
        <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-2 gap-2 [grid-auto-flow:dense] sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {artists.map((artist, i) => {
            const href = artist.spotify ?? `/artists?artist=${artistSlug(artist.name)}`
            const external = Boolean(artist.spotify)
            const span = i % 7 === 3 ? "col-span-2 row-span-2 aspect-square" : i % 5 === 0 ? "row-span-2 aspect-[3/4]" : "aspect-square"
            return (
              <Link
                key={artist.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className={`group relative overflow-hidden bg-[#141210] ${span}`}
              >
                {artist.image ? <Image src={artist.image} alt={artist.name} fill sizes="(min-width:1280px) 16vw, 50vw" className="object-cover transition duration-700 group-hover:scale-105" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 font-mono text-[10px] text-white/65">{String(i + 1).padStart(2, "0")}</span>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-4">
                  <h3 className="font-condensed text-xl font-extrabold uppercase text-white">{artist.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#e8caa0]">{artist.genre}</p>
                    {external ? (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.12em] text-white/75">
                        <SpotifyGlyph />SPOTIFY ↗
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
