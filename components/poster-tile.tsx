"use client"

import Link from "next/link"
import { m } from "framer-motion"
import type { ReactNode } from "react"
import { ShimmerImage } from "@/components/shimmer-image"

/**
 * Full-bleed photo card — Our Brands and the home Our Services tease
 * (owner restructure note, 2026-08-28: "new poster-tile grid design,
 * replacing the stacked rows" / "the tiles are more open on homepage").
 * Ported from the design canvas's `.lp-poster-tile`: tag pill top-left,
 * index numeral top-right, bottom gradient, name/description/CTA over the
 * photo. `.lp-poster-tile` (app/globals.css) swaps the aspect ratio to a
 * shorter 5:3 under 480px — the canvas's own mobile variant.
 */
export function PosterTile({
  href,
  ariaLabel,
  image,
  accent,
  tagLabel,
  index,
  title,
  description,
  ctaLabel,
  isInView,
}: {
  href: string
  ariaLabel: string
  image?: string
  accent: string
  tagLabel: string
  index: number
  title: ReactNode
  description: string
  ctaLabel: string
  isInView: boolean
}) {
  const numeral = String(index + 1).padStart(2, "0")

  return (
    <m.article
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="lp-poster-tile group relative overflow-hidden rounded-sm border border-border bg-card"
    >
      <Link href={href} aria-label={ariaLabel} className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" />

      {image ? (
        <ShimmerImage
          src={image}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 720px) 50vw, (max-width: 1200px) 33vw, 20vw"
          className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-reduce:transition-none group-hover:scale-[1.06]"
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(8,7,6,0.95) 26%, rgba(8,7,6,0.35) 62%, rgba(8,7,6,0.55))",
        }}
        aria-hidden
      />

      <span
        className="absolute top-4 left-4 z-[2] rounded-xs border px-2 py-1 font-mono text-[9px] uppercase tracking-wider"
        style={{ borderColor: accent, color: accent, backgroundColor: "rgba(8,7,6,0.5)" }}
      >
        {tagLabel}
      </span>
      <span className="absolute top-[18px] right-4 z-[2] font-mono text-[10px] text-white/45">{numeral}</span>

      <div className="absolute inset-x-0 bottom-0 z-[2] p-5 pb-6">
        <h3 className="font-condensed font-extrabold uppercase tracking-tight text-2xl leading-none text-white">
          {title}
        </h3>
        <p className="lp-poster-desc mt-2.5 text-[12.5px] leading-relaxed text-white/70 line-clamp-3">
          {description}
        </p>
        <div className="mt-3.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: accent }}>
          {ctaLabel} <span aria-hidden>→</span>
        </div>
      </div>
    </m.article>
  )
}
