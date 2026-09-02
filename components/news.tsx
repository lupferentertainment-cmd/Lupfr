"use client"

import { useRef } from "react"
import { m, useInView } from "framer-motion"
import { ArrowUpRight, ChevronDown, ChevronUp } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { getNews, newsDateLabel } from "@/lib/data/news"

const news = getNews()

const CHEVRON_CLASS =
  "flex size-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors duration-200 hover:border-accent/50 hover:bg-accent/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:pointer-events-none disabled:opacity-40"

/**
 * Home-page company-news strip, mounted directly below the Hero
 * (owner request 2026-08-08: "Added a few company news items below the Hero").
 *
 * Vertical scrolling carousel (owner request 2026-09-02: "make it a
 * scrolling carousel - just on home page not sub page", then corrected the
 * same day — "I liked the top to bottom, not side to side of the
 * announcements" — confirmed via a clarifying question: still a scrollable
 * carousel, but rows stack top-to-bottom and scroll vertically, not cards
 * side-to-side). Row markup matches the original pre-carousel static list
 * exactly (date/source | title | outbound-link arrow, full-width hairline
 * rows) — only the container is now a capped-height, vertically snap-
 * scrolling strip with up/down controls next to "News & media →" instead of
 * every row always being on-screen. `/media`'s own "News & Updates" feed
 * (lib/data/media.ts) keeps its own separate, untouched static layout.
 *
 * Every row is an external permalink, so each opens in a new tab with
 * `rel="noopener noreferrer"` and carries a visible ↗ affordance — matching
 * the treatment already used for outbound brand/partner links.
 */
export function News() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const scrollerRef = useRef<HTMLUListElement>(null)

  if (news.length === 0) return null

  function scrollByRow(direction: 1 | -1) {
    const node = scrollerRef.current
    if (!node) return
    const measured = node.firstElementChild instanceof HTMLElement ? node.firstElementChild.offsetHeight : 0
    // Floor of 64px: a real row is always taller than this, and it keeps the
    // scroll meaningful (and its direction testable) in environments — like
    // jsdom/happy-dom — that don't compute real layout, where offsetHeight is 0.
    node.scrollBy({ top: Math.max(64, measured) * direction, behavior: "smooth" })
  }

  return (
    <section
      ref={ref}
      id="news"
      aria-labelledby="news-section-title"
      className="relative border-b border-border px-4 py-12 sm:px-6 sm:py-14 lg:px-12"
    >
      <div className="container relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p id="news-section-title" className="lupfr-section-kicker mb-3">
              The Latest · Company News
            </p>
            <h2 className="lupfr-heading--compact">
              <GoldShineText scrollTargetRef={ref}>News</GoldShineText>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/media"
              className="text-gold-accent border-b border-[var(--gold)] pb-0.5 text-sm transition-colors hover:text-foreground"
            >
              News &amp; media →
            </a>
            {news.length > 1 ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollByRow(-1)}
                  aria-label="Scroll to previous news"
                  className={CHEVRON_CLASS}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByRow(1)}
                  aria-label="Scroll to next news"
                  className={CHEVRON_CLASS}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <m.ul
          ref={scrollerRef}
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="scrollbar-hide m-0 max-h-[320px] list-none snap-y snap-mandatory overflow-y-auto scroll-smooth border-t border-border p-0 sm:max-h-[280px]"
        >
          {news.map((item) => (
            <li key={item.id} className="snap-start border-b border-border">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2 py-4 transition-colors hover:bg-accent/5 sm:flex-row sm:items-center sm:gap-6 sm:py-5"
              >
                <span className="flex shrink-0 items-center gap-3 sm:w-[230px]">
                  <span className="text-gold-accent font-mono text-[10px] uppercase tracking-[0.16em]">
                    {item.source}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {newsDateLabel(item)}
                  </span>
                </span>

                <span className="flex min-w-0 flex-1 items-start gap-2 text-[15px] leading-snug text-foreground transition-colors group-hover:text-accent sm:items-center">
                  <span className="min-w-0">{item.title}</span>
                  <ArrowUpRight
                    size={14}
                    className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-accent sm:mt-0"
                    aria-hidden
                  />
                </span>
              </a>
            </li>
          ))}
        </m.ul>
      </div>
    </section>
  )
}
