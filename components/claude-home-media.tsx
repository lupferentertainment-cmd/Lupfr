"use client"

import Image from "next/image"
import { LazyLoopVideo } from "@/components/lazy-loop-video"

/**
 * Oct 1 2026 homepage redesign (owner table, confirmed via follow-up: "do
 * however it is set up in the design I made"). Replaces the earlier build of
 * this section, which showed press clippings — the section's real
 * counterpart in the design file is `id="watch"` / "Media & News" in LUPFR
 * Website v3.dc.html (claude-redesign-reference.html): a video reel (lead
 * event film + 3 side clips), not a news list. The press feed this used to
 * show is real LUPFR coverage and hasn't gone anywhere — it still lives on
 * Follow the Momentum (components/follow-the-momentum.tsx) and the /media
 * page (lib/data/news.ts's getNews()), both unchanged by this edit.
 *
 * Clip links are Will's own real links from the design file; media is
 * re-encoded from "LUPFR Website Design NEW/assets" per his own Website Fix
 * Notes.md spec — see components/lazy-loop-video.tsx and
 * claude-home-experiences.tsx (same source folder, same spec).
 */

const sideClips = [
  { cat: "SOUND//CHECK", title: "Artist podcast", poster: "/brands/soundcheck.webp", href: "https://youtube.com/shorts/1vm4F7b_Tgw", cta: "WATCH ON YOUTUBE ↗" },
  { cat: "EVENT RECAP", title: "SEA//SIDE 002", poster: "/events/seaside_002_recap.webp", href: "https://www.instagram.com/p/DdrQLrbpPqr/", cta: "WATCH ON IG ↗" },
  { cat: "EVENT RECAP", title: "Bal Masque", poster: "/events/bal_masque_wings.webp", href: "https://www.youtube.com/watch?v=Xt6zGwZ7jKg", cta: "WATCH ON YOUTUBE ↗" },
]

export function ClaudeHomeMedia() {
  return (
    <section id="news" className="border-b border-white/10 bg-[#0b0a08] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Event Films · Sound//Check · Live Sets</p>
            <h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Media &amp; News</h2>
          </div>
          <a href="/media" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">See all videos →</a>
        </div>
        <div className="grid gap-3.5 lg:grid-cols-[1.7fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-[#0d0c0a]">
            <LazyLoopVideo
              srcMp4="/events/seaside_event_film.mp4"
              srcWebm="/events/seaside_event_film.webm"
              poster="/brands/seaside-gallery-2.webp"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">Event Film</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/75">SEA//SIDE</span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-3.5">
            {sideClips.map((clip) => (
              <a
                key={clip.title}
                href={clip.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative grid min-h-[120px] flex-1 grid-cols-[1fr_1.1fr] overflow-hidden border border-white/10 bg-[#141210] no-underline"
              >
                <div className="relative min-w-0 overflow-hidden">
                  <Image src={clip.poster} alt="" fill sizes="(min-width:1024px) 18vw, 40vw" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1.5 px-4 py-3">
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f887c]">{clip.cat}</span>
                  <span className="truncate font-condensed text-lg font-bold uppercase leading-tight text-[#f3efe6]">{clip.title}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#c9a869] group-hover:text-[#e8caa0]">{clip.cta}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
