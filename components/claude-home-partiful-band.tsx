"use client"

import Image from "next/image"
import Link from "next/link"
import { LINKS } from "@/lib/links"

/**
 * The "Backed by Partiful" exclusive-partner announcement. It used to live at
 * the bottom of the standalone Founders section (`claude-home-team.tsx`);
 * round 12 (v15 design) removed Founders, but the partnership announcement is
 * its own content, so it moves here unchanged and mounts right under Our Team
 * (same deferred block). Delete this file + its one mount in `home-page.tsx`
 * if the owner wants the band gone too.
 */
export function ClaudeHomePartifulBand() {
  return (
    <section className="border-b border-white/10 bg-[#0b0a08] px-6 py-14 text-[#f3efe6] sm:px-8 lg:px-12 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        <aside
          className="grid gap-6 overflow-hidden rounded-sm border border-[#c9a869]/25 bg-[#141210] sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] sm:rounded-md"
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
