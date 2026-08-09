"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { MapPin } from "lucide-react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { GoldCard } from "@/components/gold-card"
import { ShimmerImage } from "@/components/shimmer-image"
import { getFounders, getRoster, TEAM_TAGS, type TeamMember, type TeamTag } from "@/lib/data/team"
import { LINKS } from "@/lib/links"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

// Portraits are cropped clean photos (5:4) — name/title/frame from the source
// artwork removed; the card renders name, title, location, and bio as text.
const TEAM_IMAGE_WIDTH = 1000
const TEAM_IMAGE_HEIGHT = 800

const founders = getFounders()
const roster = getRoster()

function TeamCard({
  member,
  index,
  isInView,
  isMobile,
  isExpanded,
  onToggle,
}: {
  member: TeamMember
  index: number
  isInView: boolean
  isMobile: boolean | undefined
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <GoldCard index={index} isRevealed={isInView} enableTilt={!isMobile} tiltMaxDeg={10}>
      <motion.button
        type="button"
        onClick={onToggle}
        className="group w-full cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm sm:rounded-md"
        aria-expanded={isExpanded}
        aria-controls={`team-bio-${index}`}
        id={`team-bio-trigger-${index}`}
      >
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
          {member.image ? (
            /* Same cached-image guard as the founder cards: a portrait already in
               the browser cache must not stay invisible behind the shimmer. */
            <ShimmerImage
              src={member.image}
              alt={`${member.name}, ${member.title}`}
              width={TEAM_IMAGE_WIDTH}
              height={TEAM_IMAGE_HEIGHT}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              loading="lazy"
              className={cn(
                "relative z-[1] w-full h-full object-cover object-center",
                "motion-safe:group-hover:scale-[1.08]"
              )}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-card via-muted/60 to-card">
              <span className="font-serif text-4xl font-bold text-accent/50" aria-hidden>
                {member.name.charAt(0)}
              </span>
              <span className="text-xs tracking-normal text-muted-foreground">Portrait coming soon</span>
            </div>
          )}
        </div>
        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-accent shrink-0" aria-hidden />
            <span className="text-xs tracking-normal text-muted-foreground">{member.location}</span>
          </div>
          <h3 className="font-condensed text-xl md:text-2xl font-bold tracking-tight text-foreground transition-colors duration-200 ease-snap group-hover:text-accent/90">
            {member.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{member.title}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {member.badges.map((tag) => (
              <span
                key={tag}
                className="rounded-xs border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <motion.span
            className="mt-3 inline-flex items-center gap-2 text-sm text-accent/80"
            initial={false}
            animate={{ opacity: isExpanded ? 1 : 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <span className="tracking-normal">{isExpanded ? "Less" : "More"}</span>
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              ▼
            </motion.span>
          </motion.span>
        </div>
      </motion.button>

      {/* In-place bio: an overlay that covers the card in the SAME footprint
          (owner request 2026-07-08 — the bio must not push the card taller than
          its row). The front above defines the height; this panel fades/rises
          over it and scrolls internally for long bios. */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`team-bio-${index}`}
            role="region"
            aria-labelledby={`team-bio-trigger-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-card/95 backdrop-blur-sm rounded-sm sm:rounded-md"
          >
            <div className="flex items-start justify-between gap-2 px-4 pt-4 md:px-5 md:pt-5">
              <div>
                <h3 className="font-condensed text-xl md:text-2xl font-bold tracking-tight text-foreground">{member.name}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{member.title}</p>
              </div>
              <button
                type="button"
                onClick={onToggle}
                aria-label={`Close ${member.name} bio`}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-accent/90 transition-colors duration-200 ease-snap hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                Back
                <motion.span animate={{ rotate: 180 }}>▼</motion.span>
              </button>
            </div>
            <div className="flex-1 px-4 pb-4 pt-3 md:px-5 md:pb-5">
              <p className="text-muted-foreground leading-relaxed text-sm">{member.bio}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GoldCard>
  )
}

/**
 * Founder card — deliberately NOT a TeamCard. Owner asked for "larger images /
 * description below" (Will, 2026-08-04), so the portrait is bigger and the bio
 * reads inline instead of hiding behind the roster card's expand toggle.
 */
function FounderCard({
  member,
  index,
  isInView,
  isMobile,
}: {
  member: TeamMember
  index: number
  isInView: boolean
  isMobile: boolean | undefined
}) {
  return (
    <GoldCard index={index} isRevealed={isInView} enableTilt={!isMobile} tiltMaxDeg={6} className="h-full flex flex-col">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted shrink-0">
        {member.image ? (
          /* ShimmerImage, not a hand-rolled onLoad fade: it reads `complete` on
             mount, so a browser-cached portrait can't stay stuck at opacity 0
             behind the shimmer. No `priority` — the founders row sits well below
             the fold, so eager-loading it would compete with the hero's LCP on
             mobile. */
          <ShimmerImage
            src={member.image}
            alt={`${member.name}, ${member.title}`}
            width={TEAM_IMAGE_WIDTH}
            height={TEAM_IMAGE_HEIGHT}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            className="relative z-[1] h-full w-full object-cover object-center"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-card via-muted/60 to-card">
            <span className="font-serif text-5xl font-bold text-accent/50" aria-hidden>
              {member.name.charAt(0)}
            </span>
            <span className="text-xs tracking-normal text-muted-foreground">Portrait coming soon</span>
          </div>
        )}
      </div>
      <div className="p-5 md:p-7 flex-1 flex flex-col justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <MapPin size={14} className="shrink-0 text-accent" aria-hidden />
            <span className="text-xs tracking-normal text-muted-foreground">{member.location}</span>
          </div>
          <h3 className="font-condensed text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {member.name}
          </h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-wider text-accent">{member.title}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
          {member.badges.map((tag) => (
            <span
              key={tag}
              className="rounded-xs border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </GoldCard>
  )
}

type TeamFilter = "All" | TeamTag

/** Only offer a filter box for tags that actually have a roster member behind
 *  them — founders live in their own row, so Exec would otherwise show empty. */
const TEAM_FILTERS: readonly TeamFilter[] = [
  "All",
  ...TEAM_TAGS.filter((tag) => roster.some((m) => m.teams.includes(tag))),
]

export function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })
  const isMobile = useIsMobile()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [activeFilter, setActiveFilter] = useState<TeamFilter>("All")

  const visibleTeam =
    activeFilter === "All"
      ? roster
      : roster.filter((member) => member.teams.includes(activeFilter as TeamTag))

  const selectFilter = (filter: TeamFilter) => {
    setActiveFilter(filter)
    setExpandedIndex(null)
  }

  return (
    <section
      id="team"
      ref={ref}
      className="lupfr-section-pad px-4 sm:px-6 lg:px-12 relative overflow-hidden"
    >
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-[1400px] relative z-10">
        <p className="lupfr-section-kicker mb-4">Who We Are</p>
        <h2 className="lupfr-heading--compact lupfr-heading-stack">
          <GoldShineText scrollTargetRef={ref}>Our</GoldShineText>{" "}
          <span className="lupfr-heading-subline">Team</span>
        </h2>

        {/* Founders row (owner request 2026-08-04: "a dedicated section for the
            founders … three larger images / description below"). Sits above the
            roster and adapts from two to three cards as founders are added. */}
        {founders.length > 0 && (
          <div
            role="region"
            aria-label="Founders"
            className="mb-12 sm:mb-16"
          >
            <p className="lupfr-section-kicker mb-5">The Founders</p>
            <div className="flex flex-wrap justify-center gap-5 sm:gap-7 items-stretch">
              {founders.map((member, i) => (
                <div
                  key={member.name}
                  className="basis-full sm:basis-[calc(50%-0.875rem)] lg:basis-[calc(33.333%-1.17rem)] sm:grow max-w-[520px]"
                >
                  <FounderCard member={member} index={i} isInView={isInView} isMobile={isMobile} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clickable team boxes: All / LA / SF (owner request, 2026-07-02). */}
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Filter team by city">
          {TEAM_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => selectFilter(filter)}
              aria-pressed={activeFilter === filter}
              aria-label={`Show ${filter} team`}
              className={cn(
                "min-h-[44px] rounded-full border px-5 py-2 text-sm font-medium tracking-normal transition-colors duration-200 ease-snap",
                activeFilter === filter
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Fit-all centered row (owner request 2026-07-08: show every member, no manual
            horizontal scroll, no stranded bottom-right gap). flex-wrap + justify-center
            centers sparse filters (Exec=1, SF=2) instead of stranding them left; on desktop
            all five sit in one row. items-start so an expanded bio doesn't stretch neighbors.
            Phones stay 2-up; sm+ cards grow to fill the row (capped) so few-member filters
            still read full. */}
        <div data-team-grid className="flex flex-wrap justify-center gap-3 sm:gap-6 items-start">
          {visibleTeam.map((member, i) => (
            <div
              key={member.name}
              className="basis-[calc(50%-0.375rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(20%-1.2rem)] sm:grow max-w-[300px]"
            >
              <TeamCard
                member={member}
                index={i}
                isInView={isInView}
                isMobile={isMobile}
                isExpanded={expandedIndex === i}
                onToggle={() => setExpandedIndex((prev) => (prev === i ? null : i))}
              />
            </div>
          ))}
        </div>

        {/* Owner request 2026-07-21: surface the exclusive Partiful partnership under the team. */}
        <aside
          className="mt-12 sm:mt-14 grid gap-6 overflow-hidden rounded-sm border border-accent/25 bg-card sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:rounded-md"
          aria-label="Partiful partnership announcement"
        >
          <div className="relative min-h-[200px] sm:min-h-[240px]">
            <Image
              src="/images/partiful-announcement.webp"
              alt="Partiful partnership mark"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center gap-4 px-6 py-7 sm:px-8 sm:py-8">
            <p className="lupfr-section-kicker leading-none">Exclusive Partner</p>
            <h3 className="font-condensed text-3xl font-extrabold uppercase tracking-tight text-foreground sm:text-4xl">
              Backed by Partiful
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              LUPFR is Partiful&apos;s exclusive entertainment partner — pairing their community
              platform with our production across LA and SF.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Image
                src="/corporate_partners/partiful.webp"
                alt="Partiful"
                width={48}
                height={48}
                className="partner-logo partner-logo--natural size-12 object-contain"
              />
              <a
                href={LINKS.partiful}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border-b border-accent pb-1 text-sm font-medium text-accent transition-colors hover:text-foreground"
              >
                Follow LUPFR on Partiful →
              </a>
              <Link
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                LinkedIn announcement
              </Link>
            </div>
          </div>
        </aside>
      </ScrollReveal>
    </section>
  )
}
