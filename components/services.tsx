"use client"

import Link from "next/link"
import { useRef } from "react"

import { GoldShineText } from "@/components/gold-shine-text"
import { ScrollReveal } from "@/components/scroll-reveal"
import { getServices, servicePath } from "@/lib/data/services"

const services = getServices()

export function Services() {
  const ref = useRef<HTMLElement>(null)

  return (
    <section
      id="services"
      ref={ref}
      className="border-b border-border px-4 py-24 sm:px-6 lg:px-12 lg:py-[120px]"
    >
      <ScrollReveal variant="up" amountIn={0.18} className="container mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
              What We Do
            </p>
            <h2 className="font-[family-name:var(--font-barlow-condensed)] text-[clamp(44px,5.4vw,76px)] font-extrabold uppercase leading-[0.9] tracking-[-0.025em]">
              <GoldShineText scrollTargetRef={ref}>Our Services</GoldShineText>
            </h2>
          </div>
          <Link
            href="/services"
            className="w-fit border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-foreground"
          >
            Explore all services →
          </Link>
        </div>

        <div className="grid grid-cols-1 border-t border-border md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Link
              key={service.title}
              href={servicePath(service)}
              className="group relative min-h-[250px] overflow-hidden border-b border-border p-6 transition-colors hover:bg-white/[0.03] md:p-8 lg:min-h-[285px] lg:border-r"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-25"
                style={{ backgroundImage: `url("${service.image}")` }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/55" aria-hidden="true" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em]">
                  <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-muted-foreground">Service</span>
                </div>

                <div className="mt-auto">
                  <h3 className="max-w-[14ch] font-[family-name:var(--font-barlow-condensed)] text-[clamp(28px,3vw,44px)] font-extrabold uppercase leading-[0.92] tracking-[-0.015em] text-foreground">
                    {service.title}
                  </h3>
                  <p className="mt-4 max-w-[42ch] text-sm leading-6 text-muted-foreground">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                    Learn more <span aria-hidden="true">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
