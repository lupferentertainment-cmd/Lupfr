"use client"

import { m, useInView } from "framer-motion"
import Link from "next/link"
import { useRef } from "react"
import { ArrowUpRight, Instagram, Linkedin, Youtube } from "lucide-react"

import { GoldShineText } from "@/components/gold-shine-text"
import { getNews, newsDateLabel } from "@/lib/data/news"
import { LINKS } from "@/lib/links"

/**
 * "Follow the Momentum" — the closing band of the About → Our Team → Momentum
 * flow the owner specified on 2026-08-08, ported from the AUG 8 design file.
 *
 * The design file's version of this section is built almost entirely on
 * unverifiable copy: "six sold-out sailings on the Bay", a Downtown LA
 * HIGH//RISE launch, and a LinkedIn card stamped "340 reactions · 22 comments".
 * None of that is in repo data, so the STRUCTURE is ported and the CONTENT
 * comes from verified sources only — socials from `lib/links.ts`, the latest
 * item from `data/news.yml` (owner-reviewed, real permalinks). Follower counts
 * and engagement stats are deliberately omitted rather than invented: they go
 * stale the day they ship and nothing in the repo can keep them honest.
 */

const CHANNELS = [
  { name: "Instagram", href: LINKS.instagram, Icon: Instagram },
  { name: "LinkedIn", href: LINKS.linkedin, Icon: Linkedin },
  { name: "YouTube", href: LINKS.youtube, Icon: Youtube },
] as const

/** TikTok has no Lucide glyph; render its wordmark rather than a wrong icon. */
const TIKTOK = { name: "TikTok", href: LINKS.tiktok }

export function FollowTheMomentum() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const latest = getNews()[0]

  return (
    <section
      ref={ref}
      id="momentum"
      aria-labelledby="momentum-title"
      className="lupfr-section-pad relative border-b border-border px-4 sm:px-6 lg:px-12"
    >
      <div className="container relative z-10 mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="lupfr-section-kicker mb-3">News · Our Presence</p>
            <h2 id="momentum-title" className="lupfr-heading--compact">
              <GoldShineText scrollTargetRef={ref}>Follow the Momentum</GoldShineText>
            </h2>
          </div>
          <Link
            href="/media"
            className="text-gold-accent border-b border-[var(--gold)] pb-0.5 text-sm transition-colors hover:text-foreground"
          >
            Learn more →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
          <m.ul
            initial={{ opacity: 0, y: 14 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="m-0 grid list-none grid-cols-2 gap-3 p-0"
          >
            {CHANNELS.map(({ name, href, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-[64px] items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 transition-colors hover:border-accent/50"
                >
                  <Icon size={18} className="shrink-0 text-accent" aria-hidden />
                  <span className="text-sm text-foreground transition-colors group-hover:text-accent">
                    {name}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="ml-auto shrink-0 text-muted-foreground transition-colors group-hover:text-accent"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
            <li>
              <a
                href={TIKTOK.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[64px] items-center gap-3 rounded-sm border border-border bg-card px-4 py-3 transition-colors hover:border-accent/50"
              >
                <span
                  className="shrink-0 font-condensed text-base font-extrabold leading-none text-accent"
                  aria-hidden
                >
                  TT
                </span>
                <span className="text-sm text-foreground transition-colors group-hover:text-accent">
                  {TIKTOK.name}
                </span>
                <ArrowUpRight
                  size={14}
                  className="ml-auto shrink-0 text-muted-foreground transition-colors group-hover:text-accent"
                  aria-hidden
                />
              </a>
            </li>
          </m.ul>

          {latest ? (
            <m.a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col justify-between rounded-sm border border-border bg-card p-5 transition-colors hover:border-accent/50 sm:p-6"
            >
              <span className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]">
                <span className="text-gold-accent">{latest.source}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{newsDateLabel(latest)}</span>
              </span>
              <span className="text-[15px] leading-snug text-foreground transition-colors group-hover:text-accent sm:text-base">
                {latest.title}
              </span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-gold-accent">
                Read the update
                <ArrowUpRight size={14} aria-hidden />
              </span>
            </m.a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
