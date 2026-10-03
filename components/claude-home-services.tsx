"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { CONTACT_PAGE_PATH } from "@/lib/site"
import { getServices } from "@/lib/data/services"

const services = getServices()

// 2026-10-02 fix (owner: "change music and entertainment to Music (so it
// fits on the row same as others)"); 2026-10-03 fix (owner, mid-batch:
// "change Venue programming to just 'Programming'" / "change content &
// media to just 'Media'") — same reasoning for all three: the row only has
// room for short labels before wrapping to a 2nd line, so these get a
// shorter display label for the row only, not a data rename. The detail
// heading/description/features and every other reference to the full
// service names (lib/data/services.ts, the services directory page,
// claude-home-experiences.tsx's "Services Delivered" tags) are unaffected.
const TAB_LABEL_OVERRIDES: Record<string, string> = {
  "Music & Entertainment": "Music",
  "Venue Programming": "Programming",
  "Content & Media": "Media",
}

// 2026-10-03 fix (owner, live screenshot of this section: "have this image
// zoomed in a bit so the speakers center the image") — Private Events' own
// background photo (public/services/private-events-2026-ballroom.webp,
// confirmed 1400x933px) has its two PA/speaker towers sitting left-of-center
// and right-of-center in the source frame; a plain object-cover crop (no
// position override) was leaving one or both out of frame depending on how
// tall this panel renders. A modest zoom plus an objectPosition anchored on
// the stage (between the two towers, slightly above the crowd) keeps both
// towers in view and centered instead of the default full-frame center crop.
const IMAGE_POSITION_OVERRIDES: Record<string, { position: string; zoom?: boolean }> = {
  "Private Events": { position: "50% 38%", zoom: true },
}

/**
 * 2026-10-02 fix — full-site literal port (owner instruction: "how can we
 * get the actual claude file I built onto the website"). The design file's
 * `#services` section is a 6-node icon timeline (circular icon badge + a
 * connecting progress bar, `svcV3`/`lp-svc-tl`), the active service's
 * description + "Plan Your Event →" CTA on the left of a two-column detail
 * row, and its "INCLUDES" bulleted `features` list on the right. The first
 * pass here used plain text tab buttons and dropped the icon nodes, the
 * timeline bar, the INCLUDES list, and the CTA (replaced with an "Explore
 * service →" detail-page link instead) — all while `lib/data/services.ts`
 * already carried `icon` and `features` for every service, unused. Rebuilt
 * to use both, originally keeping the "Explore service →" detail-page link
 * alongside the design's own CTA. 2026-10-03 fix (owner: "remove the
 * 'explore this service' and just have the button there") — that secondary
 * link is gone; "Plan Your Event" is the only CTA now, same as the design.
 */
export function ClaudeHomeServices() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const current = services[active] ?? services[0]
  if (!current) return null
  const progressPct = services.length > 1 ? (active / (services.length - 1)) * 100 : 0

  return (
    <section id="services" ref={ref} className="relative overflow-hidden border-b border-white/10 bg-[#070605] text-[#f3efe6]">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block" style={{ WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)", maskImage: "linear-gradient(90deg,transparent,#000 40%)" }}>
        {current.image ? (
          <Image
            key={current.title}
            src={current.image}
            alt=""
            fill
            sizes="50vw"
            className={`object-cover transition duration-700 ${IMAGE_POSITION_OVERRIDES[current.title]?.zoom ? "scale-110" : ""}`}
            style={IMAGE_POSITION_OVERRIDES[current.title] ? { objectPosition: IMAGE_POSITION_OVERRIDES[current.title]!.position } : undefined}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="max-w-[760px]">
          <div className="mb-4 flex gap-3 font-mono text-[11px] tracking-[0.2em] text-[#8f887c]"><span className="text-[#c9a869]">(01)</span><span>SERVICES</span></div>
          <h2 className="font-condensed text-[clamp(36px,4vw,60px)] font-extrabold uppercase leading-[0.9] tracking-[0.005em] text-[#fdf6e8]">Idea to <GoldShineText scrollTargetRef={ref}>execution.</GoldShineText></h2>
          <div className="my-5 h-[3px] w-[110px] bg-[#c9a869]" />
          <p className="mb-6 text-base text-[#e6e0d4]">All an event needs in one place.</p>

          <div className="relative grid grid-cols-3 gap-y-6 sm:grid-cols-6">
            <span aria-hidden className="absolute left-[8.33%] right-[8.33%] top-5 h-px bg-[#c9a869]/30" />
            <span aria-hidden className="absolute left-[8.33%] top-5 h-px bg-[#c9a869] transition-[width] duration-400" style={{ width: `${progressPct * 0.8333}%` }} />
            {services.map((service, i) => {
              const Icon = service.icon
              const isActive = active === i
              return (
                <button
                  key={service.title}
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="relative z-[1] flex min-w-0 flex-col items-center gap-2.5 bg-transparent px-1 text-center"
                >
                  {Icon ? (
                    <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border transition-colors ${isActive ? "border-[#c9a869] bg-[#c9a869]" : "border-[#c9a869]/45 bg-[#0d0c0a]"}`}>
                      <Icon size={18} strokeWidth={1.6} className={isActive ? "text-[#1a1408]" : "text-[#c9a869]"} />
                    </span>
                  ) : null}
                  <span className={`font-condensed text-[13px] font-extrabold uppercase leading-none sm:text-[15px] ${isActive ? "text-[#e8caa0]" : "text-[#bdb6a9]"}`}>{TAB_LABEL_OVERRIDES[service.title] ?? service.title}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-[#c9a869]/45 to-transparent" />

          <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
            {/* 2026-10-03 fix (owner: "remove the 'explore this service' and
                just have the button there (fix it to have better
                margins)") — dropped the secondary "Explore service →"
                detail-page link entirely; with the gold CTA now the only
                thing below the description, it gets a bit more breathing
                room above it (mt-1.5 -> mt-4) than it needed when a second
                line sat right under it. */}
            <div className="flex flex-col items-start gap-2.5">
              <h3 className="font-condensed text-[clamp(22px,2.2vw,32px)] font-extrabold uppercase leading-[0.95] text-[#fdf6e8]">{current.title}</h3>
              <p className="text-[15px] leading-relaxed text-[#e6e0d4]">{current.description}</p>
              <Link href={CONTACT_PAGE_PATH} className="mt-4 inline-flex items-center gap-2 rounded-sm border border-[rgba(243,227,196,0.7)] bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#1a1408]">
                Plan Your Event <span aria-hidden>→</span>
              </Link>
            </div>
            {current.features?.length ? (
              <div className="flex flex-col">
                <span className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#c9a869]">Includes</span>
                {current.features.map((feature) => (
                  <span key={feature} className="flex items-center gap-2.5 border-b border-white/[0.08] py-2 text-sm text-[#fdf6e8]">
                    <span className="h-[5px] w-[5px] flex-none rotate-45 bg-[#c9a869]" />
                    {feature}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
