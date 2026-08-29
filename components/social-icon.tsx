/**
 * Generic outline glyphs for the 4 platforms shown on the News & Media page's
 * channel rows (`components/media-overview.tsx`). Simple platform outlines,
 * not brand wordmarks/logo art — the same shapes as `LUPFR_Restructure.dc.html`'s
 * own inline SVGs.
 */
import type { MediaChannelCell } from "@/lib/data/media"

export function SocialIcon({
  platform,
  size = 18,
}: {
  platform: MediaChannelCell["platform"]
  size?: number
}) {
  switch (platform) {
    case "Instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
        </svg>
      )
    case "LinkedIn":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4v11H3v-11zM9.5 9.5h3.8v1.5h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75v5.7h-4v-5.05c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.96 1.3-1.96 2.66v5.14h-4v-11z" />
        </svg>
      )
    case "TikTok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16.5 3h-2.8v12.2a2.6 2.6 0 1 1-2.1-2.55v-2.85a5.45 5.45 0 1 0 4.9 5.42V8.9a6.4 6.4 0 0 0 3.6 1.1V7.2a3.7 3.7 0 0 1-3.6-4.2z" />
        </svg>
      )
    case "YouTube":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.77C18.28 5 12 5 12 5s-6.28 0-7.85.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.75 1.77C5.72 19 12 19 12 19s6.28 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.1V8.9l5.2 3.1-5.2 3.1z" />
        </svg>
      )
  }
}
