"use client"

import { forwardRef, type ComponentPropsWithRef } from "react"
import { CalendarDays } from "lucide-react"

import { LINKS } from "@/lib/links"
import { cn } from "@/lib/utils"

const BASE =
  "group max-w-full min-w-0 inline-flex items-center justify-center font-semibold rounded-full border transition-colors"

const TONE: Record<"on-dark" | "on-surface", string> = {
  /* Use foreground in both themes so outline CTAs stay readable on light hero video + dimmed nav; dark theme foreground is still light. */
  "on-dark":
    "border-foreground/30 dark:border-border text-foreground hover:border-accent hover:text-accent",
  "on-surface":
    "border-border text-foreground/90 hover:border-accent hover:text-accent",
}

const SIZE: Record<"sm" | "md", string> = {
  sm: "h-9 min-h-9 px-3.5 text-sm font-medium gap-1.5 tracking-normal",
  md: "px-6 sm:px-8 py-3.5 sm:py-4 gap-2.5 tracking-normal [font-size:var(--lupfr-pill-cta-fs)] leading-snug",
}

const ICON: Record<"sm" | "md", number> = {
  sm: 16,
  md: 18,
}

export type ScheduleCallCtaProps = {
  tone: "on-dark" | "on-surface"
  size: "sm" | "md"
} & Omit<ComponentPropsWithRef<"a">, "href" | "children">

export const ScheduleCallCta = forwardRef<HTMLAnchorElement, ScheduleCallCtaProps>(function ScheduleCallCta(
  { tone, size, className, ...rest },
  ref
) {
  return (
    <a
      ref={ref}
      href={LINKS.scheduleCall}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(BASE, TONE[tone], SIZE[size], className)}
      {...rest}
    >
      <CalendarDays size={ICON[size]} className="shrink-0 opacity-90" aria-hidden />
      Schedule a call
    </a>
  )
})

