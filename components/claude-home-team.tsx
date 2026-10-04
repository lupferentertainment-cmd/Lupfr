"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { GoldShineText } from "@/components/gold-shine-text"
import { getFounders, type TeamMember } from "@/lib/data/team"
import { LINKS } from "@/lib/links"

const founders = getFounders()

/**
 * 2026-10-02 fix (owner report: "founders section should be like the old
 * one"). The first pass here flattened `components/team.tsx`'s real founder
 * layout — the two-tone outlined/solid name, the role/location rule line,
 * the capped-height scrollable bio, the pull quote, the stat-pill row, the
 * badge chips, and the Partiful partnership aside underneath — down to name/
 * title/bio/quote/stats only. This restores that same structure (not an
 * import of `components/team.tsx` itself, which is wired to the sitewide
 * light/dark theme tokens this redesign's fixed dark palette opts out of —
 * same reasoning as claude-home-brands.tsx) with this section's own
 * `#070605`/`#c9a869` palette in place of `var(--accent)`/`var(--card)` etc.
 */
const TEAM_IMAGE_WIDTH = 1000
const TEAM_IMAGE_HEIGHT = 800

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
      {member.image ? (
        <div
          className={cn(
            "relative aspect-square w-full self-start overflow-hidden bg-[#141210]",
            "lg:aspect-[3/4]",
            "lg:[mask-image:linear-gradient(to_right,#000_0%,#000_52%,rgba(0,0,0,0.45)_82%,transparent_100%)]",
            "lg:[-webkit-mask-image:linear-gradient(to_right,#000_0%,#000_52%,rgba(0,0,0,0.45)_82%,transparent_100%)]"
          )}
        >
          <Image
            src={member.image}
            alt={`${member.name}, ${member.title}`}
            width={TEAM_IMAGE_WIDTH}
            height={TEAM_IMAGE_HEIGHT}
            sizes="(min-width: 1024px) 420px, 92vw"
            loading="lazy"
            className="relative z-[1] h-full w-full origin-[50%_32%] object-cover object-top lg:scale-[1.14]"
          />
        </div>
      ) : (
        // 2026-10-02 fix (owner: "Make Sky Terrell Image smaller so it
        // doesn't take up all the empty space on the page"). The placeholder
        // used to share Will/Eliott's full 420px/aspect-[3/4] real-portrait
        // box, leaving a tall slab of empty gradient next to Sky's copy. Any
        // founder without a photo now gets a capped, self-contained box
        // instead — real portraits above are untouched.
        // 2026-10-04 fix, round 10 (owner, mobile screenshot: "Sky Terrell
        // image needs to fit the across the screen (same height) so there
        // is not dead space"). The 220px cap applied below `sm:` too, which
        // on an actual phone-width column (full-width below `lg`, same as
        // the real-portrait founders) left dead space beside the small box
        // instead of the "tall slab" round 6 was actually guarding against.
        // Dropping just the base cap lets it go full-width like every real
        // portrait does at that breakpoint; the `sm:`/implicit `lg:` cap
        // that round 6 added is untouched.
        <div className="relative aspect-square w-full self-start overflow-hidden rounded-sm bg-gradient-to-br from-[#141210] via-[#1c1916] to-[#141210] sm:max-w-[260px]">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2">
            <span className="font-condensed text-5xl font-bold text-[#c9a869]/50" aria-hidden>
              {member.name.charAt(0)}
            </span>
            <span className="text-xs tracking-normal text-[#8f887c]">Portrait coming soon</span>
          </div>
        </div>
      )}

      <div>
        <h3 className="whitespace-nowrap font-condensed text-[clamp(34px,11.2vw,68px)] font-bold uppercase leading-[0.92] tracking-[-0.03em] lg:text-[clamp(30px,4.4vw,68px)] lg:tracking-[-0.02em]">
          <span className="text-transparent" style={{ WebkitTextStroke: "1px rgba(201,168,105,0.55)" }}>
            {firstName}
          </span>{" "}
          {lastName ? <span className="text-[#c9a869]">{lastName}</span> : null}
        </h3>

        {/* 2026-10-04 fix, round 10 (owner, mobile screenshot: "We need to
            have the text of title and cities as one row each (instead of
            two rows per text)"). Neither span had `whitespace-nowrap`, so
            on a narrow phone each one's own text — not the row as a whole —
            was free to wrap mid-string onto a second line. `whitespace-
            nowrap` on both makes each one a true single line; `flex-wrap`
            on the row (nowrap again from `lg:`, where it already fit on
            one line) lets the location group drop to its own line below
            the title instead of breaking inside a word if both can't fit
            alongside the rule/divider. Slightly smaller size/tracking below
            `sm:` and hiding the "·" divider there make sharing one row more
            achievable on an actual phone width. */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 lg:mt-6 lg:flex-nowrap lg:gap-x-3.5">
          <span className="h-px w-8 shrink-0 bg-[#c9a869] sm:w-12" aria-hidden />
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f887c] sm:text-[11px] sm:tracking-[0.18em]">
            {member.title}
          </span>
          <span className="hidden text-[#8f887c]/40 sm:inline" aria-hidden>
            ·
          </span>
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f887c]/70 sm:text-[11px] sm:tracking-[0.18em]">
            {member.location}
          </span>
        </div>

        <div className="mt-6 max-h-[176px] space-y-3.5 overflow-y-auto sm:max-h-[200px]">
          {paragraphs.map((paragraph, i) => (
            <p key={i} className="text-[15px] leading-[1.7] text-[#bdb6a9] sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        {member.quote ? (
          <blockquote className="mt-6 border-l-2 border-[#c9a869] pl-5 text-[15px] italic leading-relaxed text-[#f3efe6] sm:text-base">
            {member.quote}
          </blockquote>
        ) : null}

        {member.stats && member.stats.length > 0 ? (
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-2.5">
            {member.stats.map((stat) => (
              <div key={stat.label} className="rounded-[3px] border border-white/10 px-2 py-2.5 text-center sm:px-4 sm:py-3">
                <div className="font-condensed text-lg font-bold leading-none text-[#c9a869] sm:text-2xl">{stat.value}</div>
                <div className="mt-1.5 font-mono text-[7.5px] uppercase leading-tight tracking-[0.06em] text-[#8f887c] sm:text-[9px] sm:tracking-[0.12em]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {member.badges?.length ? (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {member.badges.map((tag) => (
              <span
                key={tag}
                className="rounded-xs border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#8f887c]"
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

export function ClaudeHomeTeam() {
  return (
    <section id="team" className="border-b border-white/10 bg-[#0b0a08] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c9a869]">Who We Are</p>
        <h2 className="mt-3 font-condensed text-[clamp(38px,4.2vw,64px)] font-extrabold uppercase leading-[0.9]">
          <GoldShineText>The Founders</GoldShineText>
        </h2>

        {founders.length > 0 && (
          <div role="region" aria-label="Founders" className="mt-10 sm:mt-12">
            <div className="grid grid-cols-1 gap-7 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:gap-11">
              {founders.map((member) => (
                <FounderCard key={member.name} member={member} />
              ))}
            </div>
          </div>
        )}

        <aside
          className="mt-12 grid gap-6 overflow-hidden rounded-sm border border-[#c9a869]/25 bg-[#141210] sm:mt-14 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:rounded-md"
          aria-label="Partiful partnership announcement"
        >
          <div className="relative flex min-h-[200px] items-center justify-center gap-6 bg-white/[0.03] px-6 py-10 sm:min-h-[240px] sm:gap-8">
            <Image src="/images/le-logo.webp" alt="LUPFR Entertainment" width={110} height={110} className="h-14 w-auto object-contain sm:h-16" />
            <span className="text-2xl font-light text-white/40" aria-hidden>
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
            <p className="font-mono text-[11px] uppercase leading-none tracking-[0.2em] text-[#c9a869]">Exclusive Partner</p>
            <h3 className="font-condensed text-3xl font-extrabold uppercase tracking-tight text-[#f3efe6] sm:text-4xl">Backed by Partiful</h3>
            <p className="max-w-md text-sm leading-relaxed text-[#bdb6a9] sm:text-base">
              LUPFR is Partiful&apos;s exclusive entertainment partner — pairing their community platform with our production
              across LA and SF.
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
                className="inline-block border-b border-[#c9a869] pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c9a869]"
              >
                Follow LUPFR on Partiful →
              </a>
              <Link
                href={LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f887c] underline-offset-4 hover:text-[#c9a869] hover:underline"
              >
                LinkedIn announcement
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
