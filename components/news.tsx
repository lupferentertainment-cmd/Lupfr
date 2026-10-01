"use client"

import Image from "next/image"
import { useRef } from "react"

import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { getNews, newsDateLabel } from "@/lib/data/news"
import { getPress } from "@/lib/data/press"

const news = getNews().slice(0, 4)
const lead = news[0]
const rest = news.slice(1)
const leadImage = getPress()[0]?.image

export function News() {
  const ref = useRef<HTMLElement>(null)
  if (!lead) return null

  return (
    <section ref={ref} className="border-b border-border px-4 py-20 sm:px-6 lg:px-12 lg:py-24">
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-10 flex items-end gap-5">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Press & Updates</p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(34px,4vw,52px)] font-extrabold uppercase leading-[0.95]">
              <GoldShineText scrollTargetRef={ref}>LUPFR in the News</GoldShineText>
            </h2>
          </div>
          <span className="mb-2 hidden h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent md:block" aria-hidden />
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <a
            href={lead.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative min-h-[360px] overflow-hidden rounded-sm border border-border bg-card"
          >
            {leadImage ? (
              <Image
                src={leadImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
              />
            ) : null}
            <span className="absolute inset-0 bg-gradient-to-t from-[#080706]/95 via-[#080706]/35 to-[#080706]/35" aria-hidden />
            <span className="absolute left-4 top-4 bg-accent px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-accent-foreground">
              Latest
            </span>
            <span className="absolute inset-x-6 bottom-6 flex flex-col gap-3">
              <span className="text-[13px] font-medium text-[#e8caa0]">
                {lead.source} <span className="font-normal text-white/55">· {newsDateLabel(lead)}</span>
              </span>
              <span className="max-w-[22ch] text-balance font-[family-name:var(--font-work-sans)] text-[clamp(22px,2.4vw,32px)] font-semibold leading-[1.15] text-[#fdf6e8]">
                {lead.title}
              </span>
              <span className="text-sm font-medium text-accent">Read more ↗</span>
            </span>
          </a>

          <div className="flex flex-col border-t border-border">
            {rest.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 flex-col justify-center gap-2 border-b border-border px-1 py-5 transition-colors hover:bg-accent/[0.04] sm:px-4"
              >
                <span className="text-[12.5px] font-medium text-accent">
                  {item.source} <span className="font-normal text-muted-foreground">· {newsDateLabel(item)}</span>
                </span>
                <span className="max-w-[46ch] text-[16px] font-medium leading-[1.4] text-foreground">
                  {item.title} <span className="text-accent">↗</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  )
}
