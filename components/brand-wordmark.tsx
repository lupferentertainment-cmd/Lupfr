import Image from "next/image"
import { splitBrandTitle } from "@/lib/data/brand-landing"
import type { BrandItem } from "@/lib/data/brands"

/**
 * Tight brand wordmark ("SEA//SIDE") for the v16 landing hero and the "More
 * from LUPFR" tiles: the accent-faded skewed "//" (the shared
 * `.lupfr-brand-slash` treatment) or, for SKI//SIDE, its red/blue slash
 * artwork. A screen-reader-only "//" keeps the name readable as written.
 */
export function BrandWordmark({ brand, className }: { brand: Pick<BrandItem, "title" | "accent" | "slashImage">; className?: string }) {
  const [before, after] = splitBrandTitle(brand.title)
  return (
    <span className={className} data-testid="brand-wordmark" style={{ display: "inline-flex", alignItems: "center", whiteSpace: "nowrap" }}>
      <span>{before}</span>
      {brand.slashImage ? (
        <>
          <span className="sr-only">{"//"}</span>
          <Image
            src={brand.slashImage}
            alt=""
            aria-hidden
            width={514}
            height={474}
            data-brand-slash-image
            className="mx-[0.08em] inline-block h-[0.78em] w-auto"
          />
        </>
      ) : (
        <span className="lupfr-brand-slash" style={{ color: brand.accent, margin: "0 0.04em", padding: "0 0.02em" }}>
          {"//"}
        </span>
      )}
      <span>{after}</span>
    </span>
  )
}
