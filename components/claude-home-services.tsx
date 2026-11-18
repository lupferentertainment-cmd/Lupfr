"use client"

import Image from "next/image"
import Link from "next/link"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { getServices } from "@/lib/data/services"

const services = getServices()

/** Per-card photo focus (design v5 `svcV3[].pos`); anything unlisted is centred. */
const IMAGE_POSITIONS: Record<string, string> = {
  "Private Events": "50% 45%",
  "Brand Activations": "50% 45%",
  "Music & Entertainment": "50% 40%",
  "Venue Programming": "50% 40%",
  Production: "50% 55%",
  "Content & Media": "50% 35%",
}

const PLAN_CTA =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-[2px] border border-[rgba(243,227,196,0.7)] bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] px-[18px] py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#1a1408] no-underline"

/**
 * LUPFR Website Design v5 (owner, 2026-11-17) — "Idea to execution." is now a
 * 3x2 grid of photo cards (number, icon, title, one-line description only; the
 * old per-service "included" list and divider are gone) with the "Plan Your
 * Event" button in the section header. Cards are 16:10 (4:3 between 901 and
 * 1250px wide) so all six fit on one screen; at ≤900px the grid becomes a
 * vertical stack of smaller tiles (2 columns, then 1 column ≤560px, 5:3 — the same
 * pattern as the Our Brands tiles; owner 2026-11-17 "not a carousel"), with the
 * button moving back below it. The previous icon-timeline + accordion is retired.
 */
export function ClaudeHomeServices() {
  return (
    <section id="services" className="relative border-b border-white/10 bg-[#070605] px-5 py-[72px] text-[#f3efe6] sm:px-8 min-[901px]:px-12 min-[901px]:py-[84px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6 min-[901px]:mb-9">
          <div className="flex flex-col items-start">
            <div className="mb-5 flex gap-3.5 font-mono text-[11px] tracking-[0.22em] text-[#8f887c]">
              <span className="text-[#c9a869]">(01)</span>
              <span>SERVICES</span>
            </div>
            <h2 className="m-0 font-condensed text-[clamp(42px,4.8vw,72px)] font-extrabold uppercase leading-[0.88] tracking-[0.005em] text-[#fdf6e8]">
              Idea to <span className="text-[#e8caa0]">execution.</span>
            </h2>
            <p className="mt-[18px] text-[clamp(15px,1.3vw,18px)] leading-[1.55] text-[#e6e0d4]">All an event needs in one place.</p>
          </div>
          <Link href={CONTACT_PAGE_PATH} data-testid="services-header-cta" className={`${PLAN_CTA} max-[900px]:hidden`}>
            Plan Your Event <span aria-hidden>→</span>
          </Link>
        </div>

        <div
          data-testid="services-grid"
          className="grid grid-cols-3 gap-3.5 max-[900px]:grid-cols-2 max-[900px]:gap-[10px] max-[560px]:grid-cols-1"
        >
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <article
                key={service.title}
                data-testid="service-card"
                className="group relative aspect-[16/10] overflow-hidden rounded-[4px] border border-white/[0.08] bg-[#0d0c0a] max-[1250px]:min-[901px]:aspect-[4/3] max-[900px]:aspect-[4/3] max-[560px]:aspect-[5/3]"
              >
                {service.image ? (
                  <Image
                    src={service.image}
                    alt=""
                    fill
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[800ms] group-hover:scale-105"
                    style={{ objectPosition: IMAGE_POSITIONS[service.title] ?? "50% 50%" }}
                  />
                ) : null}
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,5,0.55)_0%,rgba(7,6,5,0)_26%,rgba(7,6,5,0.35)_50%,rgba(7,6,5,0.95)_100%)]" />
                <div className="absolute inset-x-[18px] top-[18px] flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-[0.16em] text-[#e8caa0]">{String(i + 1).padStart(2, "0")}</span>
                  {Icon ? (
                    <span className="flex size-[34px] items-center justify-center rounded-full border border-[rgba(201,168,105,0.6)] bg-[rgba(8,7,6,0.5)]">
                      <Icon size={15} strokeWidth={1.6} className="text-[#c9a869]" />
                    </span>
                  ) : null}
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-[7px] px-5 pb-5 pt-[18px] max-[900px]:gap-1 max-[900px]:px-4 max-[900px]:pb-4 max-[900px]:pt-3">
                  <h3 className="m-0 font-condensed text-[clamp(24px,2vw,32px)] font-extrabold uppercase leading-[0.95] text-[#fdf6e8] max-[900px]:text-[24px]">{service.title}</h3>
                  <p className="m-0 text-pretty text-[13.5px] leading-[1.45] text-[#e6e0d4] max-[900px]:text-[12.5px] max-[900px]:leading-[1.4]">{service.description}</p>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-7 hidden items-center justify-end max-[900px]:flex">
          <Link href={CONTACT_PAGE_PATH} data-testid="services-footer-cta" className={`${PLAN_CTA} ml-auto`}>
            Plan Your Event <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
