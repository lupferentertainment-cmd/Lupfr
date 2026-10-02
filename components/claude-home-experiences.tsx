"use client"

import Image from "next/image"
import Link from "next/link"
import { BrandSlashText } from "@/components/brand-slash-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { brandPath } from "@/lib/data/brands"
import { eventDetailPath, getEventBySlug } from "@/lib/events"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * Oct 1 2026 homepage redesign (owner table, confirmed via follow-up: "Curated
 * showcase, matching the design"). This replaces the earlier build of this
 * section, which repurposed the live events calendar — matching this
 * section's real counterpart in the design file, `id="work"` / "OUR WORK" /
 * "Featured Experiences" in LUPFR Website v3.dc.html (claude-redesign-
 * reference.html), a hand-picked reel of 3 flagship case studies, not an
 * auto-updating feed. Facts (title/date/location) are pulled live from
 * data/events.yml via getEventBySlug so they can't drift from the real
 * listing; the narrative copy and "delivered" tags are transcribed from
 * Will's own design file. Media (video+photo) comes from "LUPFR Website
 * Design NEW/assets" on Will's desktop, re-encoded per his own
 * Website Fix Notes.md spec (muted, 8-12s loops, 1.5-3MB) — see
 * components/lazy-loop-video.tsx.
 *
 * The live calendar view (upcoming/past events) that used to live here is
 * unchanged elsewhere on the site — /events still lists every real event.
 */

/**
 * These 3 slugs are hand-picked and hardcoded on purpose (see the file
 * doc-comment above) — if one is ever renamed/removed in data/events.yml,
 * this throws loudly at import time instead of silently substituting
 * placeholder copy for a flagship case study.
 */
function requireEvent(slug: string) {
  const event = getEventBySlug(slug)
  if (!event) throw new Error(`claude-home-experiences: expected event "${slug}" to exist in data/events.yml`)
  return event
}

function monthYear(dateISO: string): string {
  return new Date(`${dateISO}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase()
}

const balMasque = requireEvent("bal-masque")
const goldenGateLive = requireEvent("zusebi-002-live-from-golden-gate")
const seasideLongBeach = requireEvent("seaside-001-long-beach-harbor")
const seasideMarinaDelRey = requireEvent("seaside-002")

interface CaseStudy {
  title: React.ReactNode
  meta: string
  mediaLabel: string
  desc: string
  delivered: string[]
  href: string
  linkLabel: string
  /** Real, already-verified external "watch the full film" link (design
   * file's conditional `fx.hasFilm` "Watch Full Film" button) — only set
   * where a genuine recap video already exists elsewhere in the site's own
   * data (never a fabricated link). Omitted entirely means the design's
   * `hasFilm` is false for that case study; no button renders. */
  filmUrl?: string
  video?: { mp4: string; webm: string }
  main: { src: string; alt: string }
  side1: { src: string; alt: string }
  side2: { src: string; alt: string }
}

const caseStudies: CaseStudy[] = [
  {
    title: <BrandSlashText text="SEA//SIDE Series" />,
    meta: `${seasideLongBeach.location.split(",")[0].toUpperCase()} · ${seasideMarinaDelRey.location.split(",")[0].toUpperCase()}`,
    mediaLabel: "EVENT FILM",
    desc: "Public and private yacht events built around music and hospitality. From sold-out public sailings to private charters, company outings and brand activations on the water, we handle the yacht, talent, boarding, production and content.",
    delivered: ["Public & private sailings", "Yacht sourcing, sound, lighting", "Artist bookings", "Photo & film"],
    href: brandPath({ key: "seaside" }),
    linkLabel: "View SEA//SIDE →",
    // Same "SEA//SIDE 002" Instagram recap already used (and verified real)
    // as claude-home-media.tsx's side-clip link — that event is literally
    // one of this case study's own two referenced events (seaside-002).
    filmUrl: "https://www.instagram.com/p/DdrQLrbpPqr/",
    video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" },
    main: { src: "/events/seaside_series_dj.webp", alt: "DJ set aboard a SEA//SIDE Series sailing" },
    side1: { src: "/events/seaside_series_interview.webp", alt: "SEA//SIDE Series guest interview on the water" },
    side2: { src: "/events/seaside_series_dj2.webp", alt: "DJ performing aboard a SEA//SIDE Series sailing, Golden Gate Bridge behind" },
  },
  {
    title: balMasque.title,
    meta: `SAN FRANCISCO · ${monthYear(balMasque.dateISO!)}`,
    mediaLabel: "PHOTOGRAPHY",
    desc: "A masquerade evening in San Francisco with Maison Noir, where dress code, design and music set a new standard for events.",
    delivered: ["Creative direction", "Full production suite", "Performers & DJs", "Photography"],
    href: eventDetailPath("bal-masque"),
    linkLabel: "View experience →",
    // Same Bal Masque YouTube recap already used (and verified real) as
    // claude-home-media.tsx's side-clip link.
    filmUrl: "https://www.youtube.com/watch?v=Xt6zGwZ7jKg",
    main: { src: "/events/bal_masque_wings.webp", alt: "Bal Masque — feathered wings installation" },
    side1: { src: "/events/bal_masque_acrobat.webp", alt: "Bal Masque — aerial acrobat performance" },
    side2: { src: "/events/bal_masque_masque_detail.webp", alt: "Bal Masque — masquerade detail" },
  },
  {
    title: goldenGateLive.title,
    meta: `LANDS END, SAN FRANCISCO · ${monthYear(goldenGateLive.dateISO!)}`,
    mediaLabel: "FULL SET",
    desc: "An open-air sunset pop up at Lands End. Zusebi played live to the city, with the setting doing the rest.",
    delivered: ["Set up, lighting & crowd", "Artist & sound", "Full media kit"],
    href: eventDetailPath("zusebi-002-live-from-golden-gate"),
    linkLabel: "View experience →",
    main: { src: "/events/ggl_main_dj.webp", alt: "Zusebi 002: Golden Gate Live — DJ set at Lands End" },
    side1: { src: "/events/ggl_dj_crowd.webp", alt: "Zusebi 002: Golden Gate Live — crowd" },
    side2: { src: "/events/ggl_shoulders.webp", alt: "Zusebi 002: Golden Gate Live — sunset over the city" },
  },
]

function CaseStudyCard({ study, reverse }: { study: CaseStudy; reverse: boolean }) {
  return (
    <article className={`grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:items-stretch ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="grid aspect-[16/11] min-w-0 grid-cols-[2fr_1fr] grid-rows-2 gap-2">
        <div className="relative row-span-2 overflow-hidden bg-[#0d0c0a]">
          <Image src={study.main.src} alt={study.main.alt} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
          {study.video ? (
            <div className="absolute inset-0">
              <LazyLoopVideo srcMp4={study.video.mp4} srcWebm={study.video.webm} poster={study.main.src} className="h-full w-full object-cover" />
            </div>
          ) : null}
          <span className="absolute bottom-3.5 left-3.5 rounded-sm border border-white/20 bg-black/60 px-2.5 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-[#f3efe6]">{study.mediaLabel}</span>
        </div>
        <div className="relative overflow-hidden bg-[#0d0c0a]">
          <Image src={study.side1.src} alt={study.side1.alt} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover" />
        </div>
        <div className="relative overflow-hidden bg-[#0d0c0a]">
          <Image src={study.side2.src} alt={study.side2.alt} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover" />
        </div>
      </div>
      <div className="mt-[-4px] flex min-w-0 max-w-[560px] flex-col gap-[18px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f887c]">{study.meta}</p>
        <h3 className="font-condensed text-[clamp(32px,4vw,52px)] font-extrabold uppercase leading-[0.94] text-[#f3efe6]">{study.title}</h3>
        <p className="text-base leading-relaxed text-[#bdb6a9]">{study.desc}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 border-t border-white/10 pt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#c9a869]">
          {study.delivered.map((item) => (
            <li key={item} className="leading-snug text-[#bdb6a9]">{item}</li>
          ))}
        </ul>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          {study.filmUrl ? (
            <a
              href={study.filmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] border border-[#f3e3c4]/70 bg-gradient-to-br from-[#f3e3c4] via-[#c9a869] to-[#a67c3d] px-[22px] py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#1a1408]"
            >
              <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-[#1a1408]" aria-hidden />
              Watch Full Film
            </a>
          ) : null}
          <Link
            href={CONTACT_PAGE_PATH}
            className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-[2px] border border-[#c9a869]/55 px-[22px] py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#c9a869]"
          >
            Create an Experience Like This <span aria-hidden>→</span>
          </Link>
        </div>
        <Link href={study.href} className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">{study.linkLabel}</Link>
      </div>
    </article>
  )
}

export function ClaudeHomeExperiences() {
  return (
    <section id="events" className="border-b border-white/10 bg-[#0b0a08] px-6 py-24 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-[120px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Our Work</p><h2 className="mt-3 font-condensed text-[clamp(54px,7vw,96px)] font-extrabold uppercase leading-[0.88]">Featured Experiences</h2></div>
          <Link href="/events" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all experiences →</Link>
        </div>
        <div className="space-y-20 lg:space-y-28">
          {caseStudies.map((study, i) => <CaseStudyCard key={i} study={study} reverse={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  )
}
