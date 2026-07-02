/**
 * Canonical public site URL (metadata, share links, JSON-LD).
 */
export const SITE_URL = "https://lupfr.com" as const

/**
 * Canonical public blog host and URL.
 */
export const BLOG_HOST = "blog.lupfr.com" as const
export const BLOG_URL = `https://${BLOG_HOST}` as const

/**
 * SEA // SIDE microsite host and URL (app/seaside served via proxy host rewrite).
 * Production is `seaside.lupfr.com`; the `dev` branch Preview is reachable at
 * `dev.seaside.lupfr.com` (assign that domain to the `dev` branch in Vercel).
 * `proxy.ts` rewrites all seaside hosts to `/seaside`.
 */
export const SEASIDE_HOST = "seaside.lupfr.com" as const
export const SEASIDE_DEV_HOST = "dev.seaside.lupfr.com" as const
export const SEASIDE_URL = `https://${SEASIDE_HOST}` as const

/**
 * Temporary blog kill switch.
 * Keep blog source/data intact, but make public blog routes undiscoverable and 404.
 */
export const BLOG_PUBLIC_ACCESS_ENABLED = false as const

/**
 * Dedicated contact page (same form as the home `#contact` section). “Book an Event” CTAs use this.
 */
export const CONTACT_PAGE_PATH = "/contact" as const
