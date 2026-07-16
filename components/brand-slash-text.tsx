import { Fragment } from "react"

/**
 * Renders a title/name string, styling every "//" as a skewed gold accent
 * (e.g. "SEA//SIDE") — the brand-divider motif from the LUPFR Website
 * Restructure comp (2026-07-16). Strings without "//" render unchanged.
 */
export function BrandSlashText({ text }: { text: string }) {
  if (!text.includes("//")) return <>{text}</>

  const parts = text.split("//")
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < parts.length - 1 && <span className="lupfr-brand-slash">{"//"}</span>}
        </Fragment>
      ))}
    </>
  )
}
