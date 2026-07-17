import { Fragment } from "react"

/**
 * Renders a title/name string, styling every "//" as a skewed gold accent —
 * the brand-divider motif from the LUPFR Website Restructure comp (2026-07-16).
 * Exactly one space is rendered on each side of the divider regardless of the
 * source string ("SEA//SIDE" and "SEA // SIDE" both display as "SEA // SIDE",
 * owner request 2026-07-17). Strings without "//" render unchanged.
 * Pass `color` to override the gold with a per-brand accent (the comp colors
 * each brand card's "//" with that brand's accent hex).
 */
export function BrandSlashText({ text, color }: { text: string; color?: string }) {
  if (!text.includes("//")) return <>{text}</>

  const parts = text.split("//").map((part) => part.trim())
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              {" "}
              <span className="lupfr-brand-slash" style={color ? { color } : undefined}>
                {"//"}
              </span>{" "}
            </>
          )}
        </Fragment>
      ))}
    </>
  )
}
