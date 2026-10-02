"use client"

import Image from "next/image"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { getNews, newsDateLabel } from "@/lib/data/news"

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
  const news = getNews()
  const [newsLead, ...rest] = news
  const newsRest = rest.slice(0, 3)
  return (
    <section id="news" className="border-b border-white/10 bg-[#0b0a08] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Event Films · Sound//Check · Live Sets</p>
            <h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]">Media &amp; News</h2>
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

        {/* 2026-10-02 fix (owner report, "a lot of the features and design
            still did not make it in"): the design file's `#watch` section has
            a second block below the video reel, "LUPFR in the News" — a
            photo-backed lead press mention plus 3 more in a list. The first
            pass of this component dropped that block entirely. Rebuilt here
            from the same real, already-verified data getNews() uses
            elsewhere (home's old news strip, /media) — every link a real
            permalink, nothing invented.
            Round 4 (owner: "...does not size right or have the image of me
            for the hidden gems"): the lead card now renders the newest
            item's real photo (newsLead.image, when set — see data/news.yml)
            as a background instead of a flat gradient; sizing tightened to
            match the rest of this pass's section-height reductions. */}
        {news.length > 0 ? (
          <div className="mt-14">
            <div className="mb-[18px] flex items-center gap-4">
              <h3 className="font-condensed text-[clamp(24px,2.4vw,32px)] font-extrabold uppercase leading-none text-[#f3efe6]">LUPFR in the News</h3>
              <span className="h-px flex-1 bg-gradient-to-r from-[#c9a869]/45 to-transparent" />
            </div>
            <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
              <a
                href={newsLead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex min-h-[260px] flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1710] to-[#0b0a08] p-6 no-underline sm:p-7"
              >
                {newsLead.image ? (
                  <Image src={newsLead.image} alt="" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: "50% 15%" }} />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                <span className="relative z-[1] self-start rounded-[2px] bg-[#c9a869] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#1a1408]">Latest</span>
                <span className="relative z-[1] mt-auto text-[13px] font-medium text-[#e8caa0]">
                  {newsLead.source} <span className="font-normal text-white/60">· {newsDateLabel(newsLead)}</span>
                </span>
                <span className="relative z-[1] mt-2.5 text-balance font-sans text-[clamp(20px,2.2vw,28px)] font-semibold leading-tight text-[#fdf6e8]">{newsLead.title}</span>
                <span className="relative z-[1] mt-2.5 text-[13.5px] font-medium text-[#c9a869]">Read the interview ↗</span>
              </a>
              <div className="flex flex-col border-t border-white/10">
                {newsRest.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 flex-col justify-center gap-1.5 border-b border-white/10 py-4 no-underline"
                  >
                    <span className="text-[12.5px] font-medium text-[#c9a869]">
                      {item.source} <span className="font-normal text-white/50">· {newsDateLabel(item)}</span>
                    </span>
                    <span className="text-[16px] font-medium leading-snug text-[#f3efe6]">
                      {item.title} <span className="text-[#c9a869]">↗</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
