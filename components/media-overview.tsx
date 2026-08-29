import { ArrowUpRight } from "lucide-react"

import { BrandSlashText } from "@/components/brand-slash-text"
import { SocialIcon } from "@/components/social-icon"
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

/**
 * News & Media page body (owner punch list, 2026-08-29: "Pull exact News/
 * Media sub-page from claude file") — a combined news feed followed by a
 * "follow each brand" channel matrix, matching `LUPFR_Restructure.dc.html`'s
 * `isMediaPage` layout in place of the earlier per-brand tab UI.
 */
export function MediaOverview() {
  return (
    <div>
      <section aria-label="News and updates" className="mb-14 sm:mb-16">
        <div className="mb-5 flex items-baseline gap-4">
          <p className="lupfr-section-kicker shrink-0">News &amp; Updates</p>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>
        {newsFeed.length > 0 ? (
          <ul className="max-h-[420px] space-y-0 divide-y divide-border overflow-y-auto border-t border-border">
            {newsFeed.map((n) => (
              <li key={n.url + n.title}>
                <a
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-5 transition-colors hover:bg-accent/5 sm:grid-cols-[100px_minmax(0,1fr)_auto_20px] sm:gap-x-6"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                    {n.date}
                  </span>
                  <span className="col-span-2 font-condensed text-lg font-semibold uppercase leading-[1.15] text-foreground transition-colors group-hover:text-accent sm:col-span-1 sm:text-xl">
                    {n.title}
                  </span>
                  <span className="justify-self-start rounded-xs border border-accent px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-accent sm:justify-self-auto">
                    {n.source}
                  </span>
                  <span className="hidden text-accent sm:block" aria-hidden>
                    <ArrowUpRight size={16} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-border pt-6 text-sm text-muted-foreground">
            No coverage yet — check back soon.
          </p>
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
