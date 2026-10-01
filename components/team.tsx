"use client"

import Image from "next/image"
import { useRef } from "react"

import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { getFounders, getRoster } from "@/lib/data/team"

const founders = getFounders()
const roster = getRoster()

export function Team() {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="team"
      ref={ref}
      className="border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-12">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Who We Are</p>
          <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(44px,5vw,68px)] font-extrabold uppercase leading-[0.92] tracking-[-0.025em]">
            <GoldShineText scrollTargetRef={ref}>The Founders</GoldShineText>
          </h2>
        </div>

        <div className="space-y-16">
          {founders.map((founder) => {
            const [first, ...rest] = founder.name.split(" ")
            const last = rest.join(" ")
            return (
              <article
                key={founder.name}
                className="grid items-start gap-8 border-b border-border pb-16 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-12"
              >
                <div
                  className="relative aspect-[3/4] overflow-hidden"
                  style={{
                    WebkitMaskImage:
                      "linear-gradient(to right,#000 0%,#000 58%,rgba(0,0,0,.58) 82%,transparent 100%)",
                    maskImage:
                      "linear-gradient(to right,#000 0%,#000 58%,rgba(0,0,0,.58) 82%,transparent 100%)",
                  }}
                >
                  {founder.image ? (
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      sizes="(min-width: 1024px) 420px, 100vw"
                      className="object-cover object-[center_28%]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-card" />
                  )}
                </div>

                <div className="flex min-h-[520px] flex-col">
                  <div>
                    <div className="flex flex-wrap items-baseline gap-x-3 font-[family-name:var(--font-barlow-condensed)] text-[clamp(46px,6vw,84px)] font-bold uppercase leading-[0.88] tracking-[-0.03em]">
                      <span className="text-transparent [-webkit-text-stroke:1px_rgba(201,168,105,.55)]">
                        {first}
                      </span>
                      <span className="text-accent">{last}</span>
                    </div>

                    <div className="my-6 flex flex-wrap items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.17em] text-muted-foreground">
                      <span className="h-px w-12 bg-accent" />
                      <span>{founder.title}</span>
                      <span className="text-border">·</span>
                      <span>{founder.location}</span>
                    </div>

                    <div className="space-y-4">
                      {founder.bio.split(/\n\n+/).map((paragraph) => (
                        <p key={paragraph} className="max-w-[64ch] text-[16px] leading-[1.7] text-muted-foreground">
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {founder.quote ? (
                      <blockquote className="mt-7 border-l-2 border-accent pl-5 text-[16px] italic leading-[1.6] text-foreground">
                        &quot;{founder.quote}&quot;
                      </blockquote>
                    ) : null}
                  </div>

                  {founder.stats?.length ? (
                    <div className="mt-8 flex flex-wrap gap-2.5">
                      {founder.stats.map((stat) => (
                        <div key={stat.label} className="border border-border px-4 py-3">
                          <div className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold text-accent">
                            {stat.value}
                          </div>
                          <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        {roster.length ? (
          <div className="mt-16">
            <div className="mb-8 flex items-center gap-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Team</span>
              <span className="h-px flex-1 bg-gradient-to-r from-accent/45 to-transparent" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roster.map((member) => (
                <article key={member.name} className="group overflow-hidden border border-border bg-card">
                  <div className="relative aspect-[4/3] bg-muted">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, 50vw"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.025]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <h3 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-extrabold uppercase leading-none text-white">
                        {member.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent">{member.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{member.location}</div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </ScrollReveal>
    </section>
  )
}
