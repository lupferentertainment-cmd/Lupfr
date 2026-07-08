"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { type ReactNode, useEffect, useState } from "react"
import { getPartners } from "@/lib/data/partners"
import { cn } from "@/lib/utils"

const partners = getPartners()

function PartnerLogoChip({
  name,
  image,
  imageDark,
  imageClassName,
  ariaLabel,
  href,
}: {
  name: string
  image: string
  imageDark?: string
  imageClassName?: string
  ariaLabel: string
  href?: string
}) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const activeSrc = mounted && resolvedTheme === "dark" && imageDark ? imageDark : image

  return (
    <PartnerLogoShell href={href} ariaLabel={ariaLabel}>
      <div
        className={cn(
          "partner-logo-chip relative flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-full border-2 border-border/75 bg-card p-3 transition-transform duration-200 ease-snap sm:p-4 md:p-4 lg:p-5",
          "dark:border-border/90 dark:bg-card group-hover:scale-[1.03]"
        )}
      >
        <div
          className={cn(
            "skeleton-shimmer pointer-events-none absolute inset-0 z-0 rounded-full",
            "motion-safe:transition-opacity motion-safe:duration-300",
            "motion-reduce:transition-none",
            ready ? "opacity-0" : "opacity-100"
          )}
          aria-hidden
        />
        <Image
          key={activeSrc}
          src={activeSrc}
          alt={name}
          width={512}
          height={512}
          sizes="(max-width: 640px) 7rem, (max-width: 1024px) 8rem, 10rem"
          onLoad={() => setReady(true)}
          className={cn(
            "relative z-[1]",
            "motion-safe:transition-opacity motion-safe:duration-300",
            "motion-reduce:transition-none",
            ready ? "opacity-100" : "opacity-0",
            imageClassName
          )}
        />
      </div>
    </PartnerLogoShell>
  )
}

function PartnerLogoShell({
  href,
  ariaLabel,
  children,
}: {
  href?: string
  ariaLabel: string
  children: ReactNode
}) {
  const className = cn(
    "group flex opacity-90 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full",
    "size-24 sm:size-28 md:size-32 lg:size-36"
  )
  if (!href) return <div className={className} aria-label={ariaLabel}>{children}</div>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  )
}

/**
 * Slim corporate-partners marquee mounted directly under the hero — an eyebrow
 * line only, no big stacked section header (owner request, 2026-07-02).
 */
export function PartnersStrip() {
  return (
    <section
      aria-label="Corporate partners"
      className="relative bg-muted/40 dark:bg-muted/30 border-y border-border/50 py-6 sm:py-8"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-gold-accent tracking-tight text-sm mb-3 text-center">
          Corporate partners
        </p>
      </div>
      {/* Full-bleed: the logo row deliberately escapes the max-w container so the
          marquee runs edge-to-edge on all viewports (owner request 2026-07-08). */}
      <div className="partner-marquee w-full py-2 sm:py-3">
        <div
          className={cn(
            "partner-marquee-track flex items-center gap-x-8",
            "sm:gap-x-6 md:gap-x-8 lg:gap-x-10"
          )}
        >
          {[false, true].map((isDuplicate) => (
            <div
              key={isDuplicate ? "duplicate" : "primary"}
              aria-hidden={isDuplicate || undefined}
              inert={isDuplicate || undefined}
              className={cn(
                "flex shrink-0 items-center gap-x-8",
                "sm:gap-x-6 md:gap-x-8 lg:gap-x-10"
              )}
            >
              {partners.map((p) => (
                <PartnerLogoChip
                  key={p.name}
                  name={p.name}
                  image={p.image}
                  imageDark={p.imageDark}
                  imageClassName={p.imageClassName}
                  ariaLabel={p.ariaLabel ?? p.name}
                  href={p.url}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
