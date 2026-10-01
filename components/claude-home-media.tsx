"use client"

import { ArrowUpRight } from "lucide-react"
import { getNews, newsDateLabel } from "@/lib/data/news"

const news = getNews()

export function ClaudeHomeMedia() {
  if (!news.length) return null
  const [lead, ...rest] = news
  return (
    <section id="news" className="border-b border-white/10 bg-[#0b0a08] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Media & News</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">In the News</h2></div>
        <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <a href={lead.url} target="_blank" rel="noopener noreferrer" className="group flex min-h-[390px] flex-col justify-end border border-white/10 bg-[#141210] p-7 sm:p-9">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9a869]">{lead.source} · {newsDateLabel(lead)}</div>
            <h3 className="mt-5 max-w-3xl font-condensed text-[clamp(38px,5vw,70px)] font-extrabold uppercase leading-[0.92] text-white">{lead.title}</h3>
            <ArrowUpRight className="mt-8 text-[#e8caa0] transition group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
          <div className="border-t border-white/10">
            {rest.slice(0, 6).map((item) => (
              <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[110px_1fr_auto] gap-4 border-b border-white/10 py-5">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8f887c]">{item.source}</span>
                <span className="text-sm leading-snug text-[#d8d1c4] group-hover:text-white">{item.title}</span>
                <ArrowUpRight size={15} className="text-[#8f887c] group-hover:text-[#e8caa0]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
