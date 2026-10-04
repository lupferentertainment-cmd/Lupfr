"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { artistSlug, getArtists } from "@/lib/data/artists"

/**
 * 2026-10-02 fix, round 4 (owner report: "still includes artist I do not
 * want and does not size right. should be only like the claude file."):
 * the design file's home "Past Artists" wall is NOT the full roster — its
 * own literal JS (`pick` array feeding `artistsV3`, LUPFR Website
 * v3.dc.html ~line 2420) hardcodes exactly these 7 names in this order:
 * PLS&TY, fromclay, Where's West?, AUGUSTE, thatfranco, Devvy Dub, HLWA.
 * The prior pass instead sliced the first 12 roster entries, which pulled
 * in Zusebi (not in the design's pick list — the unwanted artist) plus
 * Nick Rosen/Admiral/LUPFR/Alex Rayne the design never shows here at all.
 * Rebuilt to pick these exact 7, by name, off the real roster (never a
 * fabricated subset), in the design's own order.
 */
const WALL_PICK = ["PLS&TY", "fromclay", "Where's West?", "Auguste", "thatfranco", "Devvy Dub", "HLWA"]

/** Same source (`wallPat`, ~line 2426) as the colSpan/rowSpan cycle for the
 *  7 cards above, in order — a 4-col `grid-auto-flow:dense` bento, not a
 *  uniform grid. */
const WALL_SPAN: { col: 1 | 2; row: 1 | 2 }[] = [
  { col: 2, row: 2 }, // PLS&TY
  { col: 1, row: 1 }, // fromclay
  { col: 1, row: 1 }, // Where's West?
  { col: 1, row: 2 }, // Auguste
  { col: 1, row: 1 }, // thatfranco
  { col: 2, row: 1 }, // Devvy Dub
  { col: 1, row: 1 }, // HLWA
]

const allArtists = getArtists()
const artists = WALL_PICK.map((name) => allArtists.find((a) => a.name.toLowerCase() === name.toLowerCase())).filter(
  (a): a is NonNullable<typeof a> => Boolean(a),
)

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
  // 2026-10-04 fix, round 10 (owner: "We also need PLS&TY to be colored
  // until you select another artist"). Mobile has no hover, so a purely
  // CSS `group-hover:grayscale-0` left every tile gray by default there
  // with no way to ever see a colored one. `activeIndex` defaults to 0
  // (PLS&TY, the wall's first card) so it renders colored immediately;
  // hovering/focusing any tile (desktop and keyboard alike) makes that one
  // the colored one instead, reverting the previous selection to gray —
  // "colored until you select another artist," literally.
  const [activeIndex, setActiveIndex] = useState(0)
  return (
    <section id="artists" className="border-b border-white/10 bg-[#070605] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">The Sound</p><h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]"><GoldShineText>Past Artists</GoldShineText></h2></div><Link href="/artists" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all artists →</Link></div>
        {/* Design file's "art wall" (`lp-art-wall`, line 800): 4 columns,
            `grid-auto-rows:clamp(200px,19vw,280px)`, `grid-auto-flow:dense`,
            12px gap — each card's real colSpan/rowSpan from WALL_SPAN above.
            2026-10-02 fix (owner: "this should fit better / be smaller"):
            tightened the row-height clamp ~25% (200-280px -> 150-220px) so
            the wall takes up less vertical real estate.
            Round 2 (owner: "they still dont fit on the screen fully. we
            want it to be a bit smaller on desktop so we can see it all"):
            the 220px desktop ceiling was still too tall — capped further to
            170px, with the floor/scaling trimmed to match.
            Round 10 (owner, screenshot: "the tiles ... are just boxes of
            the same size" — the mobile 2-column grid used to only apply
            col-span-2/row-span-2 at `lg:`, collapsing every tile to a
            uniform 1x1 box below that with a one-off full-width override
            for the trailing odd card. The real WALL_SPAN bento now applies
            at every breakpoint — `grid-auto-flow:dense` already handles
            placement on the existing 4-col desktop grid, and degrades fine
            on this 2-col mobile grid too (a col-span-2 card reads as a
            featured full-width tile, others as half-width). */}
        <div className="grid auto-rows-[clamp(120px,11vw,170px)] grid-cols-2 gap-3 [grid-auto-flow:dense] lg:grid-cols-4">
          {artists.map((artist, i) => {
            const href = artist.spotify ?? `/artists?artist=${artistSlug(artist.name)}`
            const external = Boolean(artist.spotify)
            const { col, row } = WALL_SPAN[i] ?? { col: 1, row: 1 }
            const colClass = col === 2 ? "col-span-2" : "col-span-1"
            const rowClass = row === 2 ? "row-span-2" : "row-span-1"
            const isActive = i === activeIndex
            return (
              <Link
                key={artist.id}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                onMouseEnter={() => setActiveIndex(i)}
                onFocus={() => setActiveIndex(i)}
                className={`group relative overflow-hidden rounded-[3px] border border-white/[0.08] bg-[#0d0c0a] ${colClass} ${rowClass}`}
              >
                {artist.image ? (
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    fill
                    sizes="(min-width:1024px) 25vw, 50vw"
                    // 2026-10-02 fix (owner: "make the other boxes gray
                    // unless you hover over it") — grayscale by default,
                    // full color only on the hovered tile; `transition`
                    // already covers `filter` so grayscale-0 eases in too.
                    // Round 10: `isActive` (mouse/focus-driven state, see
                    // above) also lifts the grayscale for whichever tile
                    // is the current default — PLS&TY on first render,
                    // since there's no hover at all on mobile.
                    className={`object-cover transition duration-700 group-hover:scale-105 group-hover:grayscale-0 ${isActive ? "grayscale-0" : "grayscale"}`}
                    style={{ objectPosition: "center 25%" }}
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <span className="absolute left-3.5 top-3.5 font-mono text-[10px] text-white/65">{String(i + 1).padStart(2, "0")}</span>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
                  <h3 className="font-condensed text-xl font-extrabold uppercase leading-[0.92] text-white">{artist.name}</h3>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#e8caa0]">{artist.genre}</p>
                    {external ? (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] text-white/75">
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
