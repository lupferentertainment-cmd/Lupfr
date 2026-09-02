"use client"

import { useRef } from "react"
import { m, useInView } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { getNews, newsDateLabel } from "@/lib/data/news"

const news = getNews()

const ARROW_CLASS =
  "absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-foreground shadow backdrop-blur transition-all duration-200 hover:border-accent/50 hover:bg-accent/20 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"

/**
 * Home-page company-news strip, mounted directly below the Hero
 * (owner request 2026-08-08: "Added a few company news items below the Hero").
 *
 * Rebuilt as a horizontal scrolling carousel (owner request 2026-09-02: "make
 * it a scrolling carousel - just on home page not sub page") — home page
 * only; `/media`'s "News & Updates" feed (lib/data/media.ts) keeps its own
 * static list layout untouched. Native scroll-snap + `scrollBy`, not the
 * Embla `components/ui/carousel.tsx` primitive: this strip never needs
 * Embla's paging/drag-free mechanics, and native scroll keeps touch momentum
 * on mobile for free.
 *
 * Every card is an external permalink, so each opens in a new tab with
 * `rel="noopener noreferrer"` and carries a visible ↗ affordance — matching
 * the treatment already used for outbound brand/partner links.
 */
export function News() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (news.length === 0) return null

  function scrollByCard(direction: 1 | -1) {
    const node = scrollerRef.current
    if (!node) return
    const amount = Math.max(280, Math.min(400, node.clientWidth * 0.9)) * direction
    node.scrollBy({ left: amount, behavior: "smooth" })
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
          <a
            href="/media"
            className="text-gold-accent border-b border-[var(--gold)] pb-0.5 text-sm transition-colors hover:text-foreground"
          >
            News &amp; media →
          </a>
        </div>

        <m.div
          initial={{ opacity: 0, y: 14 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            ref={scrollerRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
          >
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex w-[min(360px,88vw)] shrink-0 snap-start flex-col justify-between gap-5 rounded-sm border border-border p-5 transition-colors hover:border-accent/50 hover:bg-accent/5"
              >
                <span className="flex items-center gap-3">
                  <span className="text-gold-accent font-mono text-[10px] uppercase tracking-[0.16em]">
                    {item.source}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {newsDateLabel(item)}
                  </span>
                </span>

                <span className="flex min-w-0 items-start gap-2 text-[15px] leading-snug text-foreground transition-colors group-hover:text-accent">
                  <span className="min-w-0">{item.title}</span>
                  <ArrowUpRight size={14} className="mt-1 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" aria-hidden />
                </span>
              </a>
            ))}
          </div>

          {news.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                aria-label="Scroll to previous news"
                className={`${ARROW_CLASS} left-2 lg:-left-5`}
              >
                <ArrowLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                aria-label="Scroll to next news"
                className={`${ARROW_CLASS} right-2 lg:-right-5`}
              >
                <ArrowRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}
        </m.div>
      </div>
    </section>
  )
}
