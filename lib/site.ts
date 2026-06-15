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
 * Dedicated contact page (same form as the home `#contact` section). “Book an Event” CTAs use this.
 */
export const CONTACT_PAGE_PATH = "/contact" as const
