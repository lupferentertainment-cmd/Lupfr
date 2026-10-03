"use client"

import Image from "next/image"
import Link from "next/link"
import { BrandSlashText } from "@/components/brand-slash-text"
import { GoldShineText } from "@/components/gold-shine-text"
import { LazyLoopVideo } from "@/components/lazy-loop-video"
import { ServiceIcon, type ServiceIconKey } from "@/components/lupfr-service-icons"
import { brandPath, getBrandBySlug } from "@/lib/data/brands"
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

// 2026-10-02 fix (owner report: "SEA//SIDE is not the // blue, bal masque
// is not the same size and does not have the videos"). `seaside.accent`
// (#6fb8c9, data/brands.yml) is the real verified brand blue — BrandSlashText
// was being called with no `color` at all for this title, so its "//" fell
// back to the shared gold default instead. Bal Masque already has a real,
// already-encoded loop video on disk (`public/events/bal_masque_loop.{mp4,webm}`,
// re-encoded from the design canvas's own `assets/events/bal-masque-loop.mp4`)
// that this section simply never wired up — SEA//SIDE was the only case study
// with a `video` set, so its media block was the only one playing a loop
// instead of a static frame, which reads as a different (smaller/quieter) card.
const seasideAccent = getBrandBySlug("seaside")?.accent

// 2026-10-02 fix (owner, Claude design app screenshot: "on the bal masque
// and zusebi golden gate live add the IN//SIDE and OUT//SIDE in just like
// the screenshot from claude i included"). The design file shows each case
// study with its own brand eyebrow above the title — SEA//SIDE Series
// already carries its brand identity in the title itself (BrandSlashText).
// Bal Masque (an indoor masquerade at SF's Hibernia Bank) is a real
// IN//SIDE event and Golden Gate Live (an open-air sunset pop-up in Golden
// Gate Park — corrected 2026-10-03, owner: "the Zusebi: Golden Gate Live
// was in Golden Gate Park, not Lands End") is a real OUT//SIDE event — both
// already-verified LUPFR brands (data/brands.yml), not fabricated tags.
const insideAccent = getBrandBySlug("inside")?.accent
const outsideAccent = getBrandBySlug("outside")?.accent

// 2026-10-02 fix, round 2 (owner screenshots of the Claude design file:
// "it should align everything to that"). Each case study's "Services
// Delivered" list (icon-badge + bold category label + one-line detail) is
// transcribed verbatim from the design file's own `feat` + `SVC` data
// tables in LUPFR Website v3.dc.html — not the earlier screenshot-read
// pass, which had gotten Bal Masque's 2nd item wrong (guessed "Event
// Management"; the design file's own data says `brand` → "Brand
// Activations", same label/icon as the home Services category) and in the
// wrong order. Icons are the design's own SVG path keys
// (components/lupfr-service-icons.tsx) via the `SVC` table's icon-per-
// category mapping: private→hospitality, brand→spark, music→music,
// mgmt→production, content→camera.
const DELIVERED_LABELS: Record<string, ServiceIconKey> = {
  "PRIVATE EVENTS": "hospitality",
  "BRAND ACTIVATIONS": "spark",
  "MUSIC & ENTERTAINMENT": "music",
  PRODUCTION: "production",
  "CONTENT & MEDIA": "camera",
}

function delivered(items: Array<[label: keyof typeof DELIVERED_LABELS, description: string]>): DeliveredItem[] {
  return items.map(([label, description]) => ({ icon: DELIVERED_LABELS[label], label, description }))
}

const balMasque = requireEvent("bal-masque")
const goldenGateLive = requireEvent("zusebi-002-live-from-golden-gate")
const seasideLongBeach = requireEvent("seaside-001-long-beach-harbor")
const seasideMarinaDelRey = requireEvent("seaside-002")

interface DeliveredItem {
  icon: ServiceIconKey
  label: string
  description: string
}

interface CaseStudy {
  title: React.ReactNode
  /** Per-card brand eyebrow (IN//SIDE, OUT//SIDE) — omitted for SEA//SIDE
   * Series, whose title already carries its own brand identity. */
  brand?: { label: string; accent?: string }
  meta: string
  mediaLabel: string
  desc: string
  delivered: DeliveredItem[]
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
  /**
   * `position` is an optional CSS object-position override (default center).
   * SEA//SIDE's side2 uses it — see that photo's own comment below.
   */
  side2: { src: string; alt: string; position?: string }
}

const caseStudies: CaseStudy[] = [
  {
    title: <BrandSlashText text="SEA//SIDE Series" color={seasideAccent} />,
    meta: `${seasideLongBeach.location.split(",")[0].toUpperCase()} · ${seasideMarinaDelRey.location.split(",")[0].toUpperCase()}`,
    mediaLabel: "EVENT FILM",
    desc: "Public and private yacht events built around music and hospitality. From sold-out public sailings to private charters, company outings and brand activations on the water, we handle the yacht, talent, boarding, production and content.",
    delivered: delivered([
      ["PRIVATE EVENTS", "Public & private sailings"],
      ["PRODUCTION", "Yacht sourcing, sound, lighting"],
      ["MUSIC & ENTERTAINMENT", "Artist Bookings"],
      ["CONTENT & MEDIA", "Photo & film"],
    ]),
    href: brandPath({ key: "seaside" }),
    linkLabel: "View SEA//SIDE →",
    // Same "SEA//SIDE 002" Instagram recap already used (and verified real)
    // as claude-home-media.tsx's side-clip link — that event is literally
    // one of this case study's own two referenced events (seaside-002).
    filmUrl: "https://www.instagram.com/p/DdrQLrbpPqr/",
    video: { mp4: "/events/seaside_series.mp4", webm: "/events/seaside_series.webm" },
    main: { src: "/events/seaside_series_dj.webp", alt: "DJ set aboard a SEA//SIDE Series sailing" },
    side1: { src: "/events/seaside_series_interview.webp", alt: "SEA//SIDE Series guest interview on the water" },
    // 2026-10-02 fix (owner: "this should be the bottom right photo for
    // SEA//SIDE Series (get their full heads in)" — a new on-deck interview
    // photo). This side2 slot is a near-square crop, but the source photo is
    // portrait (1117x1408), so object-cover's default center position would
    // clip the tallest guest's hair at the very top (verified by rendering
    // the actual crop math before/after). Anchoring to the top keeps all
    // three full heads in frame with clean headroom.
    side2: {
      src: "/events/seaside_series_group_interview.webp",
      alt: "Guests interviewed on deck during a SEA//SIDE Series sailing",
      position: "center top",
    },
  },
  {
    title: balMasque.title,
    brand: { label: "IN//SIDE", accent: insideAccent },
    meta: `SAN FRANCISCO · ${monthYear(balMasque.dateISO!)}`,
    mediaLabel: "PHOTOGRAPHY",
    desc: "A masquerade evening in San Francisco with Maison Noir, where dress code, design and music set a new standard for events.",
    delivered: delivered([
      ["BRAND ACTIVATIONS", "Creative direction"],
      ["PRODUCTION", "Full Production Suite"],
      ["MUSIC & ENTERTAINMENT", "Performers & DJs"],
      ["CONTENT & MEDIA", "Photography"],
    ]),
    href: eventDetailPath("bal-masque"),
    linkLabel: "View experience →",
    // Same Bal Masque YouTube recap already used (and verified real) as
    // claude-home-media.tsx's side-clip link.
    filmUrl: "https://www.youtube.com/watch?v=Xt6zGwZ7jKg",
    video: { mp4: "/events/bal_masque_loop.mp4", webm: "/events/bal_masque_loop.webm" },
    main: { src: "/events/bal_masque_wings.webp", alt: "Bal Masque — feathered wings installation" },
    side1: { src: "/events/bal_masque_acrobat.webp", alt: "Bal Masque — aerial acrobat performance" },
    side2: { src: "/events/bal_masque_masque_detail.webp", alt: "Bal Masque — masquerade detail" },
  },
  {
    title: goldenGateLive.title,
    brand: { label: "OUT//SIDE", accent: outsideAccent },
    meta: `GOLDEN GATE PARK, SAN FRANCISCO · ${monthYear(goldenGateLive.dateISO!)}`,
    mediaLabel: "FULL SET",
    desc: "An open-air sunset pop up in Golden Gate Park. Zusebi played live to the city, with the setting doing the rest.",
    delivered: delivered([
      ["PRODUCTION", "Set up, lighting & crowd"],
      ["MUSIC & ENTERTAINMENT", "Artist & sound"],
      ["CONTENT & MEDIA", "Full media kit"],
    ]),
    href: eventDetailPath("zusebi-002-live-from-golden-gate"),
    linkLabel: "View experience →",
    // 2026-10-03 fix (owner: "I have attached the new Golden Gate Live
    // video. Add this as both the GOLDEN GATE hero video and also in the
    // main box of the experience section for it too") — re-encoded from the
    // owner's own attached clip (public/events/ggl_main_video.{mp4,webm}),
    // same pipeline as Bal Masque/SEA//SIDE's loop videos. This case study
    // previously had no real video asset of its own and fell back to a
    // static main photo — see claude-home-hero.tsx's own matching note.
    video: { mp4: "/events/ggl_main_video.mp4", webm: "/events/ggl_main_video.webm" },
    main: { src: "/events/ggl_main_dj.webp", alt: "Zusebi 002: Golden Gate Live — DJ set in Golden Gate Park" },
    side1: { src: "/events/ggl_dj_crowd.webp", alt: "Zusebi 002: Golden Gate Live — crowd" },
    side2: { src: "/events/ggl_shoulders.webp", alt: "Zusebi 002: Golden Gate Live — sunset over the city" },
  },
]

function CaseStudyCard({ study, reverse }: { study: CaseStudy; reverse: boolean }) {
  // 2026-10-02 fix, round 4 (owner: "the Bal Masque section should be the
  // same size as the others. It shouldnt be smaller"). Bal Masque is the
  // only one of the 3 case studies with `reverse` true (alternating
  // layout, every 2nd card). Reversing only reordered the two children
  // (`order-2` on the media block) without also swapping which grid track
  // they land in — grid-template-columns stayed a fixed `1.35fr .65fr`
  // regardless, so the reordered media block got auto-placed into the
  // narrower .65fr track instead of the wide 1.35fr one, rendering it
  // visibly smaller than SEA//SIDE's and Golden Gate's (both not
  // reversed). The column proportions now flip along with the visual
  // order, so the media block is always the ~1.35fr-wide one.
  return (
    <article className={`grid gap-6 lg:items-stretch ${reverse ? "lg:grid-cols-[.65fr_1.35fr] lg:[&>*:first-child]:order-2" : "lg:grid-cols-[1.35fr_.65fr]"}`}>
      <div className="grid aspect-[16/11] min-w-0 grid-cols-[2fr_1fr] grid-rows-2 gap-2">
        <div className="relative row-span-2 overflow-hidden bg-[#0d0c0a]">
          <Image src={study.main.src} alt={study.main.alt} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
          {study.video ? (
            <div className="absolute inset-0">
              <LazyLoopVideo srcMp4={study.video.mp4} srcWebm={study.video.webm} poster={study.main.src} className="h-full w-full object-cover" />
            </div>
          ) : null}
          {/* 2026-10-02 fix (owner: "Hero headers - no black background,
              just fit into the hero videos as is"): the design file's own
              media-type label (e.g. "PHOTOGRAPHY") sits directly on the
              photo as plain mono text — no bordered black chip. Dropped the
              border/bg-black box; a drop-shadow keeps it legible over any
              photo instead. */}
          <span className="absolute bottom-3.5 left-3.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.85)]">{study.mediaLabel}</span>
        </div>
        <div className="relative overflow-hidden bg-[#0d0c0a]">
          <Image src={study.side1.src} alt={study.side1.alt} fill sizes="(min-width:1024px) 20vw, 50vw" className="object-cover" />
        </div>
        <div className="relative overflow-hidden bg-[#0d0c0a]">
          <Image
            src={study.side2.src}
            alt={study.side2.alt}
            fill
            sizes="(min-width:1024px) 20vw, 50vw"
            className="object-cover"
            style={study.side2.position ? { objectPosition: study.side2.position } : undefined}
          />
        </div>
      </div>
      <div className="mt-[-4px] flex min-w-0 max-w-[560px] flex-col gap-[18px]">
        {study.brand ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8f887c]">
            <BrandSlashText text={study.brand.label} color={study.brand.accent} />
          </p>
        ) : null}
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f887c]">{study.meta}</p>
        <h3 className="font-condensed text-[clamp(32px,4vw,52px)] font-extrabold uppercase leading-[0.94] text-[#f3efe6]">{study.title}</h3>
        <p className="text-base leading-relaxed text-[#bdb6a9]">{study.desc}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-5">
          {study.delivered.map((item) => (
            <li key={item.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-8 flex-none items-center justify-center rounded-full border border-[#c9a869]/40 bg-[#c9a869]/10 text-[#c9a869]">
                <ServiceIcon icon={item.icon} size={16} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#c9a869]">{item.label}</span>
                <span className="text-[13px] leading-snug text-[#bdb6a9]">{item.description}</span>
              </span>
            </li>
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
    <section id="events" className="border-b border-white/10 bg-[#0b0a08] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Our Work</p><h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]"><GoldShineText>Featured Experiences</GoldShineText></h2></div>
          <Link href="/events" className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">View all experiences →</Link>
        </div>
        <div className="space-y-20 lg:space-y-28">
          {caseStudies.map((study, i) => <CaseStudyCard key={i} study={study} reverse={i % 2 === 1} />)}
        </div>
      </div>
    </section>
  )
}
