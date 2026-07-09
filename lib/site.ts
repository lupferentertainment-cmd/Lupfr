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
 * SEA // SIDE — decommissioned here (owner decision 2026-07-08). The microsite now
 * lives at its own domain/project, `seaside.la` (`SEASIDE_REDIRECT_URL`). The prod host
 * `seaside.lupfr.com` is the redirect *source*: `proxy.ts` 308-redirects it (and the
 * primary-host `/seaside` page route) to `seaside.la` so old links and ranking transfer.
 * Keep `seaside.lupfr.com` attached to the lupfr project so the redirect fires (detaching
 * yields `DEPLOYMENT_NOT_FOUND`). The old staging host `dev.seaside.lupfr.com` is retired
 * (owner decision 2026-07-08) — staging now lives at `dev.seaside.la` on the seaside project.
 * The `app/seaside` page + `components/seaside/*` code is retained but no longer publicly routed.
 */
export const SEASIDE_HOST = "seaside.lupfr.com" as const
export const SEASIDE_URL = `https://${SEASIDE_HOST}` as const
export const SEASIDE_REDIRECT_URL = "https://seaside.la/" as const

/**
 * Temporary blog kill switch.
 * Keep blog source/data intact, but make public blog routes undiscoverable and 404.
 */
export const BLOG_PUBLIC_ACCESS_ENABLED = false as const

/**
 * Dedicated contact page (same form as the home `#contact` section). “Book an Event” CTAs use this.
 */
export const CONTACT_PAGE_PATH = "/contact" as const
