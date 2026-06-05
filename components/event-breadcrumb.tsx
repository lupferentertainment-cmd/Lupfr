"use client"

import Link from "next/link"
import { useEventCalendarClock } from "@/hooks/use-event-calendar-clock"
import { getEventBreadcrumbLabel, type EventItem } from "@/lib/events"

export function EventBreadcrumb({ event }: { event: EventItem }) {
  const now = useEventCalendarClock()
  const label = getEventBreadcrumbLabel(event, now)

  return (
    <nav aria-label="Event breadcrumb">
      <ol className="flex items-center gap-x-2 text-xs sm:text-sm">
        <li>
          <Link
            href="/#events"
            className="text-gold-accent font-semibold tracking-tight hover:opacity-80 transition-opacity"
          >
            Events
          </Link>
        </li>
        {label !== null && (
          <li className="flex items-center gap-x-2">
            <span aria-hidden className="text-muted-foreground">
              /
            </span>
            <span suppressHydrationWarning className="text-foreground/70 font-medium tracking-tight">
              {label}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}
