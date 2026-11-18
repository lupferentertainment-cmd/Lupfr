import Image from "next/image"

import { getHomeNews, newsDateLabel } from "@/lib/data/news"

/**
 * "LUPFR in the News" — a photo-backed lead press mention plus three more in
 * a list. Moved here from the home page's Media section (Round 16) when Media
 * became its own page; every link is a real permalink from data/news.yml.
 *
 * Round 16 (owner: "make sure the image of me about the Voyage LA article is
 * more square and fits my face"): the lead card is now a true square
 * (`aspect-square`) in a width-capped column, instead of a wide 340–400px
 * strip. The source (public/images/team/will-2026.webp, 1206x1603) has the
 * face between ~14% and ~51% of its height; a square crop shows 75% of it, so
 * `object-position: 50% 10%` keeps the whole head in frame with the bottom
 * gradient/title sitting over the shirt, not the face.
 */
export function MediaNewsFeature() {
  const [lead, ...rest] = getHomeNews()
  if (!lead) return null
  const list = rest.slice(0, 3)
  return (
    <section aria-label="LUPFR in the News" className="mb-16 lg:mb-20">
      <div className="mb-5 flex items-baseline gap-4">
        <p className="shrink-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">LUPFR in the News</p>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <a
          href={lead.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex aspect-square flex-col justify-end overflow-hidden border border-white/10 bg-gradient-to-br from-[#1a1710] to-[#0b0a08] p-6 no-underline sm:p-7"
        >
          {lead.image ? (
            <Image src={lead.image} alt="" fill sizes="(min-width:1024px) 460px, 100vw" className="object-cover" style={{ objectPosition: "50% 10%" }} />
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <span className="relative z-[1] self-start rounded-[2px] bg-[#c9a869] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-[#1a1408]">Latest</span>
          <span className="relative z-[1] mt-auto text-[13px] font-medium text-[#e8caa0]">
            {lead.source} <span className="font-normal text-white/60">· {newsDateLabel(lead)}</span>
          </span>
          <span className="relative z-[1] mt-2 text-balance font-sans text-[clamp(18px,2vw,24px)] font-semibold leading-tight text-[#fdf6e8]">{lead.title}</span>
          <span className="relative z-[1] mt-2 text-[13.5px] font-medium text-[#c9a869]">Read the interview ↗</span>
        </a>
        <div className="flex flex-col border-t border-border">
          {list.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col justify-center gap-1.5 border-b border-border py-4 no-underline transition-colors hover:bg-[rgba(201,168,105,0.05)]"
            >
              <span className="text-[12.5px] font-medium text-[#c9a869]">
                {item.source} <span className="font-normal text-muted-foreground">· {newsDateLabel(item)}</span>
              </span>
              <span className="text-[16px] font-medium leading-snug text-foreground">
                {item.title} <span className="text-[#c9a869]">↗</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
