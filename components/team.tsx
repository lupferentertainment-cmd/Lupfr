"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef } from "react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { ShimmerImage } from "@/components/shimmer-image"
import { getFounders, type TeamMember } from "@/lib/data/team"
import { LINKS } from "@/lib/links"
import { cn } from "@/lib/utils"

// Portraits are cropped clean photos (5:4) — name/title/frame from the source
// artwork removed; the card renders name, title, location, and bio as text.
const TEAM_IMAGE_WIDTH = 1000
const TEAM_IMAGE_HEIGHT = 800

const founders = getFounders()

/**
 * Founder card — deliberately NOT a TeamCard. Rebuilt (owner punch list,
 * 2026-08-29: "Founder section: rebuild to match design file exactly") to
 * match `LUPFR_Restructure.dc.html`'s default founder layout ("layout A" /
 * `.lp-founder-split`) rather than the roster card's bordered-tile shape: a
 * fixed-width portrait column with a right-edge fade into the copy column,
 * a two-tone stacked name, a thin rule + role/location line, and bordered
 * stat pills. Returns a Fragment of exactly two elements (portrait, copy) —
 * `Team` renders founders as direct children of one CSS grid below, so
 * multiple founders auto-flow into additional same-shaped rows the way the
 * design file's own `sc-for` repeats them, instead of a flex-wrap card row.
 */
function FounderCard({ member }: { member: TeamMember }) {
  const spaceIndex = member.name.indexOf(" ")
  const firstName = spaceIndex === -1 ? member.name : member.name.slice(0, spaceIndex)
  const lastName = spaceIndex === -1 ? "" : member.name.slice(spaceIndex + 1)
  const paragraphs = member.bio
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)

  return (
    <>
      {/* Portrait column: square on mobile (design file's own <760px override),
          a fixed-width 3/4 column that fades into the copy column at lg+ — the
          design's `.lp-founder-split > div:nth-child(odd)` behavior, reproduced
          with a responsive class pair instead of a literal breakpoint match,
          since a 420px-fixed image column needs real width to sit beside text. */}
      <div
        className={cn(
          "relative aspect-square w-full self-start overflow-hidden bg-muted",
          "lg:aspect-[3/4]",
          "lg:[mask-image:linear-gradient(to_right,#000_0%,#000_52%,rgba(0,0,0,0.45)_82%,transparent_100%)]",
          "lg:[-webkit-mask-image:linear-gradient(to_right,#000_0%,#000_52%,rgba(0,0,0,0.45)_82%,transparent_100%)]"
        )}
      >
        {member.image ? (
          /* ShimmerImage, not a hand-rolled onLoad fade: it reads `complete` on
             mount, so a browser-cached portrait can't stay stuck at opacity 0
             behind the shimmer. No `priority` — the founders row sits well below
             the fold, so eager-loading it would compete with the hero's LCP on
             mobile. The 1.14x scale + off-center origin (design file values,
             transform-origin 50% 32%) only applies at lg+, matching the desktop
             split framing; the mobile square crop needs no zoom. */
          <ShimmerImage
            src={member.image}
            alt={`${member.name}, ${member.title}`}
            width={TEAM_IMAGE_WIDTH}
            height={TEAM_IMAGE_HEIGHT}
            sizes="(min-width: 1024px) 420px, 92vw"
            loading="lazy"
            className="relative z-[1] h-full w-full origin-[50%_32%] object-cover object-top lg:scale-[1.14]"
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

      <div>
        {/* Two-tone stacked name: outlined first name + solid-gold last name
           (design file values). Tailwind has no text-stroke utility, so the
           stroke color is the one inline style on this component — kept
           theme-aware via color-mix on the accent token rather than the
           design file's literal rgba(201,168,105,...). */}
        <h3 className="whitespace-nowrap font-condensed text-[clamp(34px,11.2vw,68px)] font-bold uppercase leading-[0.92] tracking-[-0.03em] lg:text-[clamp(30px,4.4vw,68px)] lg:tracking-[-0.02em]">
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "1px color-mix(in oklch, var(--accent) 55%, transparent)" }}
          >
            {firstName}
          </span>{" "}
          {lastName ? <span className="text-accent">{lastName}</span> : null}
        </h3>

        <div className="mt-5 flex items-center gap-3.5 lg:mt-6">
          <span className="h-px w-12 shrink-0 bg-accent" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {member.title}
          </span>
          <span className="text-muted-foreground/40" aria-hidden>
            ·
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
            {member.location}
          </span>
        </div>

        {/* Bio paragraphs (owner restructure, 2026-08-28: Will's 5-paragraph
           bio) — a blank line in YAML splits into separate <p>s; a
           single-paragraph bio (Eliott) renders exactly as before.
           Capped height + internal scroll (owner request, 2026-08-29:
           "Dont let the founder text go long - it needs to fit... then
           scroll within that") so a long bio can't push the quote/stats
           taller — it scrolls in place instead, deliberately NOT the design
           file's uncapped flex-grow bio column. The site hides scrollbars
           globally (app/globals.css), matching the roster card's own
           in-place bio overflow-y-auto pattern above. */}
        <div className="mt-6 max-h-[176px] space-y-3.5 overflow-y-auto sm:max-h-[200px]">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[15px] leading-[1.7] text-muted-foreground sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Pull quote + stats (owner restructure, 2026-08-28: "Design each
           founder post area like the claude file, with the cool text/
           structure"), ported from the design canvas's founder layout. */}
        {member.quote ? (
          <blockquote className="mt-6 border-l-2 border-accent pl-5 text-[15px] italic leading-relaxed text-foreground sm:text-base">
            {member.quote}
          </blockquote>
        ) : null}
        {/* grid-cols-3 (was flex flex-wrap): on mobile the 3 pills wrapped to
           2 rows (owner punch list, 2026-09-02, iPhone screenshot: "should
           fit across one row, not be two rows. Same goes for Eliott") —
           equal thirds guarantee one row at every width instead of wrapping
           once the pills' natural size no longer fits the column. */}
        {member.stats && member.stats.length > 0 ? (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-2.5">
            {member.stats.map((stat) => (
              <div key={stat.label} className="rounded-[3px] border border-border px-2 py-2.5 text-center sm:px-4 sm:py-3">
                <div className="font-condensed text-lg font-bold leading-none text-accent sm:text-2xl">{stat.value}</div>
                <div className="mt-1.5 font-mono text-[7.5px] uppercase leading-tight tracking-[0.06em] text-muted-foreground sm:text-[9px] sm:tracking-[0.12em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {member.badges.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {member.badges.map((tag) => (
              <span
                key={tag}
                className="rounded-xs border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </>
  )
}

export function Team() {
  const ref = useRef(null)

  return (
    <section
      id="team"
      ref={ref}
      className="lupfr-section-pad px-4 sm:px-6 lg:px-12 relative overflow-hidden"
    >
      {/* amountIn="some" (not the site's usual 0.2 fraction): since Phase 46
          stacked two full-bleed founder cards on mobile, this section's real
          mobile height runs 3600px+, well over 4x the viewport — 20% of that
          doesn't cross into view until the user has scrolled ~450-500px past
          the section's own top edge, so the whole section (correct height,
          just opacity:0) reads as a large blank gap the whole way there
          (owner report, 2026-08-29: "the Founder/Team section is blank area
          on mobile"). "some" reveals on first intersection instead, so the
          section fades in as soon as its top approaches the viewport,
          matching every other (much shorter) section's felt timing without
          the multi-hundred-pixel blank scroll window. */}
      <ScrollReveal variant="up" amountIn="some" className="container mx-auto max-w-[1400px] relative z-10">
        <p className="lupfr-section-kicker mb-4">Who We Are</p>
        <h2 className="lupfr-heading--compact lupfr-heading-stack">
          <GoldShineText scrollTargetRef={ref}>The</GoldShineText>{" "}
          <span className="lupfr-heading-subline">Founders</span>
        </h2>

        {/* Founders row (owner request 2026-08-04: "a dedicated section for the
            founders … three larger images / description below"; rebuilt
            2026-08-29 to match the design file's split layout exactly — see
            FounderCard). A single CSS grid holds every founder's portrait+copy
            pair as direct children, so additional founders auto-flow into new
            rows below (matching the design file's own `sc-for` repetition)
            with one shared divider under the whole block, not one per founder.
            The roster grid, filter chips, and "The Founders" sub-kicker that
            used to sit here are gone (owner punch list, 2026-09-02: Zac/Kylie/
            Cianna removed, leaving only founders — see docs/CHANGELOG.md); the
            section h2 above now carries that label instead of repeating it. */}
        {founders.length > 0 && (
          <div role="region" aria-label="Founders" className="mt-8 sm:mt-10">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-11">
              {founders.map((member) => (
                <FounderCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        )}

        {/* Owner request 2026-07-21: surface the exclusive Partiful partnership under the team. */}
        <aside
          className="mt-12 sm:mt-14 grid gap-6 overflow-hidden rounded-sm border border-accent/25 bg-card sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:rounded-md"
          aria-label="Partiful partnership announcement"
        >
          {/*
            Owner 2026-08-10: this panel used to be `partiful-announcement.webp`,
            a baked near-black lockup. An image cannot follow the theme, so in
            light mode it sat as a black slab against a near-white page. The
            lockup is now composed from the two real marks over a themed
            surface, so it reads correctly in both modes and drops a ~200KB
            raster from the page at the same time.
          */}
          <div className="relative flex min-h-[200px] items-center justify-center gap-6 bg-muted/40 px-6 py-10 sm:min-h-[240px] sm:gap-8">
            <Image
              src="/images/le-logo.webp"
              alt="LUPFR Entertainment"
              width={110}
              height={110}
              className="h-14 w-auto object-contain sm:h-16"
            />
            <span className="text-2xl font-light text-muted-foreground/60" aria-hidden>
              ×
            </span>
            <Image
              src="/corporate_partners/partiful.webp"
              alt="Partiful"
              width={110}
              height={110}
              className="partner-logo partner-logo--natural h-14 w-auto object-contain sm:h-16"
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
