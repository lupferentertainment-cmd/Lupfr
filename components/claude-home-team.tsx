"use client"

import Image from "next/image"
import { getFounders } from "@/lib/data/team"

const founders = getFounders()

export function ClaudeHomeTeam() {
  return (
    <section id="team" className="border-b border-white/10 bg-[#0b0a08] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Who We Are</p>
        <h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">The Founders</h2>
        <div className="mt-14 space-y-20">
          {founders.map((f, i) => {
            const [first, ...rest] = f.name.split(" ")
            const last = rest.join(" ")
            return (
              <article key={f.name} className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[420px_1fr] lg:gap-14">
                <div className="relative aspect-[3/4] overflow-hidden" style={{ WebkitMaskImage: "linear-gradient(to right,#000 0%,#000 52%,rgba(0,0,0,.45) 82%,transparent 100%)", maskImage: "linear-gradient(to right,#000 0%,#000 52%,rgba(0,0,0,.45) 82%,transparent 100%)" }}>
                  {f.image ? <Image src={f.image} alt={f.name} fill sizes="420px" className="object-cover object-top" /> : null}
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-condensed text-[clamp(46px,6vw,82px)] font-bold uppercase leading-[0.9] tracking-[-0.02em]"><span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(201,168,105,.55)" }}>{first}</span> <span className="text-[#c9a869]">{last}</span></h3>
                  <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f887c]"><span className="h-px w-12 bg-[#c9a869]"/><span>{f.title}</span><span>·</span><span>{f.location}</span></div>
                  <p className="mt-7 max-w-2xl whitespace-pre-line text-base leading-[1.75] text-[#bdb6a9]">{f.bio}</p>
                  {f.quote ? <blockquote className="mt-7 border-l-2 border-[#c9a869] pl-5 italic text-[#e6e0d4]">{f.quote}</blockquote> : null}
                  {f.stats?.length ? <div className="mt-7 flex flex-wrap gap-2">{f.stats.map((s) => <div key={s.label} className="border border-white/10 px-4 py-3"><div className="font-condensed text-2xl font-bold text-[#c9a869]">{s.value}</div><div className="mt-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8f887c]">{s.label}</div></div>)}</div> : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
