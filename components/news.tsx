"use client"

import { m, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { getNews, newsDateLabel } from "@/lib/data/news"

const news = getNews()

/**
 * Home-page company-news strip, mounted directly below the Hero
 * (owner request 2026-08-08: "Added a few company news items below the Hero").
 *
 * Every row is an external permalink, so each opens in a new tab with
 * `rel="noopener noreferrer"` and carries a visible ↗ affordance — matching
 * the treatment already used for outbound brand/partner links.
 */
export function News() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  if (news.length === 0) return null

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

        <ul className="m-0 list-none border-t border-border p-0">
          {news.map((item, index) => (
            <m.li
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.4,
                delay: 0.06 * index,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="border-b border-border"
            >
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
            </m.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
