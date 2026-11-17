import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

import { BrandSlashText } from "@/components/brand-slash-text"
import { SocialIcon } from "@/components/social-icon"
import { PlayRing, ZusebiFeaturedTile } from "@/components/zusebi-featured"
import { MEDIA_VIDEOS } from "@/lib/data/media-videos"
import { getMediaOverview, type MediaChannelCell } from "@/lib/data/media"
import { cn } from "@/lib/utils"

const { newsFeed, brandRows } = getMediaOverview()

function channelLabel(cell: MediaChannelCell): string {
  if (cell.state === "live") return "Follow"
  if (cell.state === "via") return "Via LUPFR"
  return "Not launched"
}

/**
 * A single platform cell in a brand's channel row. "live"/"via" are real,
 * clickable links (a "via" cell honestly still points at LUPFR's real
 * account, since that account is genuinely where that brand's content
 * lives); "soon" renders as an inert, dimmed placeholder — no invented link.
 */
function ChannelCell({ cell, accent }: { cell: MediaChannelCell; accent: string }) {
  const inner = (
    <>
      <span
        className="flex shrink-0 items-center"
        style={{ color: cell.state === "soon" ? "var(--muted-foreground)" : accent }}
      >
        <SocialIcon platform={cell.platform} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-condensed text-sm font-bold uppercase leading-none text-foreground">
          {cell.platform}
        </span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
          {channelLabel(cell)}
        </span>
      </span>
    </>
  )

  if (cell.state === "soon") {
    return (
      <div className="flex items-center gap-2.5 rounded-sm border border-border px-3 py-2.5 opacity-50">
        {inner}
      </div>
    )
  }

  return (
    <a
      href={cell.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 rounded-sm border border-border px-3 py-2.5 transition-colors hover:border-accent/50"
    >
      {inner}
    </a>
  )
}

const GOLD = "#c9a869"

/** Section label with a hairline rule, as on the design's /media page. */
function RuleLabel({ children }: { children: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-4">
      <p className="shrink-0 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{children}</p>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  )
}

/**
 * News & Media page body (LUPFR Website Design v16): the featured Zusebi set
 * beside the three latest news items, a six-video WATCH grid, the full news
 * list, then the "follow each brand" channel matrix (unchanged).
 */
export function MediaOverview() {
  const latest = newsFeed.slice(0, 3)
  return (
    <div>
      <div className="mb-16 grid gap-3.5 lg:mb-20 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]" data-testid="media-top">
        <ZusebiFeaturedTile />
        <section aria-label="Latest news" className="flex min-w-0 flex-col rounded-[4px] border border-border bg-card">
          <div className="border-b border-border px-5 py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Latest news</div>
          {latest.map((n) => (
            <a
              key={n.url + n.title}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col justify-center gap-2 border-b border-border px-5 py-[18px] no-underline transition-colors last:border-b-0 hover:bg-[rgba(201,168,105,0.05)]"
            >
              <span className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: n.accent ?? GOLD }}>
                  {n.source}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{n.date}</span>
              </span>
              <span className="text-pretty font-condensed text-xl font-bold uppercase leading-[1.08] text-foreground">
                {n.title} <span style={{ color: n.accent ?? GOLD }}>↗</span>
              </span>
            </a>
          ))}
        </section>
      </div>

      <section aria-label="Watch" className="mb-16 lg:mb-20">
        <RuleLabel>Watch</RuleLabel>
        <div className="grid grid-cols-1 gap-3.5 min-[521px]:grid-cols-2 lg:grid-cols-3" data-testid="media-videos">
          {MEDIA_VIDEOS.map((v) => (
            <a
              key={v.title}
              href={v.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col overflow-hidden rounded-[4px] border border-border bg-card no-underline transition-colors hover:border-[rgba(201,168,105,0.6)]"
            >
              <span className="relative block aspect-[16/10] bg-[#0d0c0a]">
                <Image src={v.poster} alt="" fill sizes="(max-width: 1024px) 50vw, 380px" className="object-cover" />
                <PlayRing size={44} />
              </span>
              <span className="flex flex-col gap-1.5 px-4 pb-4 pt-3.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#c9a869]">{v.meta}</span>
                <span className="font-condensed text-xl font-bold uppercase leading-[1.05] text-foreground">{v.title}</span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section aria-label="News and updates" className="mb-16 lg:mb-20">
        <RuleLabel>All news &amp; updates</RuleLabel>
        {newsFeed.length > 0 ? (
          <ul className="flex flex-col border-t border-border">
            {newsFeed.map((n) => (
              <li key={n.url + n.title}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_20px] items-center gap-x-3 gap-y-1.5 border-b border-border px-2 py-5 no-underline transition-colors hover:bg-[rgba(201,168,105,0.05)] md:grid-cols-[120px_minmax(0,1fr)_150px_20px] md:gap-x-6"
                >
                  <span className="col-span-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground md:col-span-1">{n.date}</span>
                  <span className="font-condensed text-[clamp(18px,2vw,24px)] font-semibold uppercase leading-[1.15] text-foreground">{n.title}</span>
                  <span
                    className="hidden justify-self-start whitespace-nowrap rounded-[2px] border px-2 py-[3px] font-mono text-[9px] uppercase tracking-[0.1em] md:block"
                    style={{ borderColor: n.accent ?? GOLD, color: n.accent ?? GOLD }}
                  >
                    {n.source}
                  </span>
                  <span className="justify-self-end" style={{ color: n.accent ?? GOLD }} aria-hidden>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">No coverage yet — check back soon.</p>
        )}
      </section>

      <section aria-label="Follow each brand">
        <div className="mb-5 flex items-baseline gap-4">
          <p className="lupfr-section-kicker shrink-0">Follow Each Brand</p>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        <div className="divide-y divide-border border-t border-border">
          {brandRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-[240px_minmax(0,1fr)] sm:items-center sm:gap-8"
            >
              <div className="border-l-[3px] pl-4" style={{ borderColor: row.accent }}>
                <p className="font-condensed text-2xl font-extrabold uppercase leading-none text-foreground">
                  <BrandSlashText text={row.label} color={row.key === "lupfr" ? undefined : row.accent} />
                </p>
                <p
                  className={cn(
                    "mt-2 font-mono text-[9px] uppercase tracking-[0.12em]",
                    row.status === "COMING SOON" ? "text-muted-foreground" : "text-accent"
                  )}
                >
                  {row.status}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {row.channels.map((cell) => (
                  <ChannelCell key={cell.platform} cell={cell} accent={row.accent} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
