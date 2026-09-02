import Image from "next/image"

const PARTIFUL_PROFILE_URL = "https://partiful.com/u/0SHzuWD8fZTwWwVJixNo"

/**
 * "Every ticket lives on Partiful" band — owner restructure note, 2026-08-28:
 * "New: Partiful band under the events grid linking to [profile] — all
 * ticketing runs through Partiful now" (also placed under the home Our
 * Brands grid per the same design-canvas component). Copy/link ported
 * verbatim from the design canvas's `.lp-partiful-band`.
 */
export function PartifulBand({ className = "" }: { className?: string }) {
  return (
    <a
      href={PARTIFUL_PROFILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`mt-10 flex flex-wrap items-center justify-between gap-5 rounded-sm border border-border bg-card px-5 py-5 sm:px-6 transition-colors hover:border-accent/50 ${className}`}
    >
      <span className="flex min-w-0 flex-col gap-2">
        <span className="flex items-center gap-4">
          {/* Owner request 2026-08-29: swap the placeholder "P" glyph for the
             real transparent Partiful mark — the same asset already used in
             the Team section's partnership band (components/team.tsx). */}
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(201,168,105,0.14)" }}
            aria-hidden
          >
            <Image
              src="/corporate_partners/partiful.webp"
              alt=""
              width={40}
              height={40}
              className="partner-logo partner-logo--natural h-5 w-5 object-contain"
            />
          </span>
          <span className="block font-condensed text-lg font-extrabold uppercase tracking-tight text-foreground sm:text-xl">
            Every ticket lives on Partiful
          </span>
        </span>
        {/* Owner punch list, 2026-09-02, iPhone screenshot: "The every ticket
           lives on partiful description takes up too much space. Should
           just be one line below. Make it flow better" — the subtitle used
           to sit indented under the icon (nested in the span above), where
           it wrapped to 2 lines on mobile. `whitespace-nowrap` + a smaller
           mobile-only size keeps it one line; un-indenting (own line, full
           card width) gives it the room to do that. `sm:ml-[52px]` restores
           the original icon-aligned indent once there's room to not wrap
           (icon 36px + gap-4 16px). */}
        <span className="block whitespace-nowrap font-mono text-[8.5px] tracking-[0.05em] text-muted-foreground sm:ml-[52px] sm:text-[10.5px] sm:tracking-[0.14em]">
          RSVPS · GUEST LISTS · EVERY LUPFR EVENT IN ONE PLACE
        </span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-2 rounded-full btn-metallic-gold px-6 py-3 text-sm font-semibold">
        Get Tickets <span aria-hidden>→</span>
      </span>
    </a>
  )
}
