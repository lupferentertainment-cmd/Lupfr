"use client"

import Script from "next/script"

/**
 * Laylo drop embed (owner delivery 2026-08-08, "Lets embed Laylo").
 *
 * Markup and query params are the owner's snippet verbatim — `dropId=2qWvZ`,
 * `color=FED455`, `minimal=false`, `theme=light`. The `width:1px` +
 * `min-width:100%` pair is Laylo's own responsive-iframe idiom, not a typo: it
 * lets the frame shrink below its intrinsic width inside a flex/grid parent
 * while still filling the container.
 *
 * The SDK is what resizes the frame to its content height (it posts a message
 * back to the parent), so it must load for the embed to size correctly.
 * `lazyOnload` keeps it off the critical path — this block sits far below the
 * fold and the home page is under a mobile transfer budget.
 *
 * No CSP is set on this site (checked in `proxy.ts` and `next.config.mjs`), so
 * the third-party script and frame load without an allowlist entry. If a CSP is
 * ever introduced, `embed.laylo.com` needs both `script-src` and `frame-src`.
 */
export function LayloEmbed() {
  return (
    <section
      aria-labelledby="laylo-signup-title"
      className="border-t border-border px-4 py-12 sm:px-6 sm:py-14 lg:px-12"
    >
      <div className="container mx-auto max-w-[1400px]">
        <p id="laylo-signup-title" className="lupfr-section-kicker mb-3">
          Never miss a drop
        </p>
        <p className="mb-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Get first access to LUPFR events, ticket releases, and lineup
          announcements.
        </p>

        <Script src="https://embed.laylo.com/laylo-sdk.js" strategy="lazyOnload" />
        <iframe
          id="laylo-drop-2qWvZ"
          title="Sign up for LUPFR drops"
          frameBorder="0"
          scrolling="no"
          allow="web-share"
          style={{ width: "1px", minWidth: "100%", maxWidth: "1000px" }}
          src="https://embed.laylo.com?dropId=2qWvZ&color=FED455&minimal=false&theme=dark"
        />
      </div>
    </section>
  )
}
