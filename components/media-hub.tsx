"use client"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"

import { BrandSlashText } from "@/components/brand-slash-text"
import { getMediaChannels } from "@/lib/data/media"
import { cn } from "@/lib/utils"

const channels = getMediaChannels()

/**
 * Media Hub panel — "cycle through LUPFR and each brand" from the owner's
 * July 24 restructure mockup.
 *
 * Every link here is one the repo has verified (see lib/data/media.ts); the
 * mockup's placeholder handles and invented headlines are intentionally absent,
 * so tabs degrade to honest empty states rather than inventing a presence.
 */
export function MediaHub() {
  const [activeKey, setActiveKey] = useState(channels[0].key)
  const active = channels.find((c) => c.key === activeKey) ?? channels[0]

  return (
    <div>
      <div
        role="tablist"
        aria-label="Choose a LUPFR brand"
        className="mb-10 flex flex-wrap gap-2 sm:gap-3"
      >
        {channels.map((c) => {
          const selected = c.key === active.key
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              id={`media-tab-${c.key}`}
              aria-selected={selected}
              aria-controls="media-panel"
              /* BrandSlashText splits the divider into nodes, so name the tab explicitly. */
              aria-label={c.label}
              onClick={() => setActiveKey(c.key)}
              className={cn(
                "min-h-[44px] rounded-full border px-5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 ease-snap",
                selected
                  ? "text-background"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
              )}
              style={
                selected
                  ? { backgroundColor: c.accent, borderColor: c.accent }
                  : undefined
              }
            >
              <BrandSlashText text={c.label} />
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id="media-panel"
        aria-labelledby={`media-tab-${active.key}`}
        className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-14"
      >
        <div>
          <p
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]"
            style={{ color: active.accent }}
          >
            {active.tagline}
          </p>
          <h2 className="mb-5 font-condensed text-4xl font-extrabold uppercase leading-[1.05] tracking-tight sm:text-5xl">
            <BrandSlashText text={active.label} />
          </h2>
          <p className="max-w-[560px] text-base leading-7 text-muted-foreground sm:text-[17px]">
            {active.blurb}
          </p>

          {active.website ? (
            <a
              href={active.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 border-b pb-1 text-sm font-medium transition-colors hover:text-foreground"
              style={{ color: active.accent, borderColor: active.accent }}
            >
              Visit {active.websiteLabel}
              <ArrowUpRight size={14} aria-hidden />
            </a>
          ) : null}

          <section className="mt-10" aria-label="News and updates">
            <p className="lupfr-section-kicker mb-5">News &amp; Updates</p>
            {active.news.length > 0 ? (
              <ul className="space-y-4">
                {active.news.map((n) => (
                  <li key={n.url + n.title}>
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-sm border border-border bg-card p-4 transition-colors hover:border-accent/50 sm:p-5"
                    >
                      <span className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        <span className="text-accent">{n.source}</span>
                        {n.date ? <span aria-hidden>·</span> : null}
                        {n.date ? <span>{n.date}</span> : null}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-foreground transition-colors group-hover:text-accent sm:text-base">
                        {n.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No coverage yet for this brand — company news lives on the LUPFR tab.
              </p>
            )}
          </section>
        </div>

        <section aria-label="Channels">
          <p className="lupfr-section-kicker mb-5">Channels</p>
          <ul className="space-y-3">
            {active.socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-sm border border-border bg-card px-4 py-3 transition-colors hover:border-accent/50"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{s.name}</span>
                    <span className="block truncate font-mono text-[11px] text-muted-foreground">
                      {s.handle}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="shrink-0 text-muted-foreground transition-colors group-hover:text-accent"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
          {active.socialsAreCompanyWide ? (
            // Say it plainly rather than implying the brand runs its own accounts.
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              These are the LUPFR channels — {" "}
              <BrandSlashText text={active.label} /> is covered there alongside the
              other brands.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  )
}
