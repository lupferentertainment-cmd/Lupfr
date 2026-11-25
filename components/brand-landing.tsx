import Image from "next/image"
import Link from "next/link"
import { BrandDeck } from "@/components/brand-deck"
import { BrandPillarIcon, brandIconName } from "@/components/brand-pillar-icons"
import { BrandWordmark } from "@/components/brand-wordmark"
import { ShimmerImage } from "@/components/shimmer-image"
import { getBrandSocials, getOtherBrands, hexToRgba } from "@/lib/data/brand-landing"
import { brandPath, brandPlainTitle, type BrandItem } from "@/lib/data/brands"
import { CONTACT_PAGE_PATH } from "@/lib/site"

/**
 * Brand landing page body (LUPFR Website Design v16; v5 on 2026-11-17 removed
 * the "On the calendar" section — past events now live behind the "See Past
 * Events" button — and added the format photo + pillar icons; v6 on 2026-11-24 made THE FORMAT a
 * full-width photo band with the statement over it, followed by three highlight cards): full-screen
 * hero with tagline + CTA, THE FORMAT (photo band + three highlight cards),
 * a photo gallery, the "bring it to you" planning box with the brand's
 * accounts, and a row linking to the other brands. Theme tokens drive
 * everything below the hero; the hero is a fixed-dark photo overlay in both
 * themes. Copy comes from `data/brands.yml`'s `landing` block.
 */

const KICKER = "font-mono text-[11px] uppercase tracking-[0.2em]"
const H2 = "m-0 font-condensed text-[clamp(34px,4.2vw,54px)] font-extrabold uppercase leading-[0.95] text-foreground"
const SECTION = "border-b border-border px-5 py-16 sm:px-8 md:py-[100px] lg:px-12"
const INNER = "mx-auto max-w-[1400px]"

function SectionHead({ kicker, title, accent }: { kicker: string; title: string; accent: string }) {
  return (
    <div className="mb-9">
      <div className={`${KICKER} mb-3.5`} style={{ color: accent }}>
        {kicker}
      </div>
      <h2 className={H2}>{title}</h2>
    </div>
  )
}

export function BrandLanding({ brand }: { brand: BrandItem }) {
  const landing = brand.landing
  const plain = brandPlainTitle(brand)
  const socials = getBrandSocials(brand.key)
  const others = getOtherBrands(brand.key)
  const gallery = (brand.gallery ?? []).slice(0, 6)
  // v5: format photo = gallery[1] || gallery[0] || the brand image; motif = the 4th icon of the brand's set.
  const formatPic = gallery[1] ?? gallery[0] ?? brand.image
  const motif = brandIconName(brand.key, 3)
  const accent = brand.accent
  const ctaLabel = landing?.cta ?? `Plan a ${brand.title} event`

  return (
    <div data-testid="brand-landing">
      <section className="relative flex min-h-[min(90vh,860px)] items-end overflow-hidden border-b border-border bg-[#0b0a08]">
        {brand.image ? (
          <Image src={brand.image} alt={`${plain} by LUPFR Entertainment`} fill priority sizes="100vw" className="object-cover" />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,6,0.9)_0%,rgba(8,7,6,0.5)_50%,rgba(8,7,6,0.1)_100%)]" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(8,7,6,0.95)_0%,rgba(8,7,6,0)_50%)]" aria-hidden />
        <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-[22px] px-5 pb-11 pt-[120px] sm:px-8 md:px-12 md:pb-[72px] md:pt-[150px]">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="rounded-[2px] border bg-[rgba(8,7,6,0.5)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ borderColor: accent, color: accent }}
            >
              {brand.tag}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[rgba(243,239,230,0.6)]">LUPFR.COM/{brand.key.toUpperCase()}</span>
          </div>
          <h1 className="m-0">
            <BrandWordmark
              brand={brand}
              className="font-condensed text-[clamp(52px,13vw,184px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-white"
            />
          </h1>
          {landing ? (
            <p className="m-0 max-w-[20ch] font-condensed text-[clamp(22px,2.6vw,34px)] font-semibold uppercase leading-[1.05] text-[#fdf6e8]">{landing.tagline}</p>
          ) : null}
          <p className="m-0 max-w-[52ch] text-pretty text-[17px] leading-relaxed text-[rgba(243,239,230,0.78)]">{brand.description}</p>
          <div className="mt-1.5 flex flex-wrap gap-3">
            <Link
              href={CONTACT_PAGE_PATH}
              className="inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold text-[#0b0a08] no-underline"
              style={{ background: accent }}
            >
              {ctaLabel}
            </Link>
            {brand.externalUrl ? (
              <a
                href={brand.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center rounded-full border border-[rgba(243,239,230,0.4)] px-[22px] text-sm text-[#f3efe6] no-underline transition-colors hover:border-[#f3efe6]"
              >
                Visit {brand.externalUrl.replace(/^https?:\/\//, "")} ↗
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {landing ? (
        <section className="border-b border-border bg-[#0b0a08]" aria-label="The format">
          <div data-testid="brand-format-photo" className="relative h-[clamp(420px,62vh,640px)] overflow-hidden max-[640px]:h-[clamp(360px,56vh,480px)]">
            {formatPic ? <ShimmerImage src={formatPic} alt="" fill sizes="100vw" className="object-cover" /> : null}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,6,0.88)_0%,rgba(8,7,6,0.55)_42%,rgba(8,7,6,0)_75%),linear-gradient(to_top,#0b0a08_0%,rgba(8,7,6,0)_35%)]" aria-hidden />
            <div className="pointer-events-none absolute inset-0 flex items-end">
              <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-[18px] px-5 pb-10 sm:px-8 md:px-12 md:pb-16">
                <div className={`${KICKER} flex items-center gap-3`} style={{ color: accent }}>
                  {motif ? (
                    <span data-testid="brand-motif" className="flex">
                      <BrandPillarIcon name={motif} color={accent} size={20} />
                    </span>
                  ) : null}
                  The format
                </div>
                <h2 className="m-0 max-w-[14ch] text-balance font-condensed text-[clamp(40px,5.4vw,80px)] font-extrabold uppercase leading-[0.9] text-[#fdf6e8]">{landing.statement}</h2>
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-[rgba(243,239,230,0.75)]">{brand.format}</div>
              </div>
            </div>
          </div>
          <div className={`${INNER} grid gap-5 px-5 pb-14 pt-6 sm:px-8 md:grid-cols-3 md:px-12 md:pb-24`}>
            {landing.pillars.map((p, i) => (
              <div
                key={p.title}
                data-testid="brand-pillar"
                className="relative flex flex-col gap-[18px] rounded-[2px] border border-border border-t-[3px] px-[30px] pb-[34px] pt-8 max-[640px]:px-6 max-[640px]:py-6"
                style={{ background: hexToRgba(accent, 0.07), borderTopColor: accent }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-condensed text-[64px] font-bold leading-[0.8] text-transparent" style={{ WebkitTextStroke: `1.2px ${accent}` }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {brandIconName(brand.key, i) ? (
                    <span data-testid="brand-pillar-icon" className="flex size-12 items-center justify-center rounded-full border" style={{ borderColor: accent }}>
                      <BrandPillarIcon name={brandIconName(brand.key, i)!} color={accent} size={24} />
                    </span>
                  ) : null}
                </div>
                <span className="font-condensed text-[32px] font-extrabold uppercase leading-[0.95] text-foreground">{p.title}</span>
                <span className="text-pretty text-base leading-relaxed text-muted-foreground">{p.line}</span>
              </div>
            ))}
          </div>
          {brand.deck && brand.deck.length > 0 ? (
            <div className={`${INNER} px-5 pb-14 sm:px-8 md:px-12`}>
              <BrandDeck slides={brand.deck} label={plain} />
            </div>
          ) : null}
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className={SECTION} aria-label="Gallery">
          <div className={INNER}>
            <SectionHead kicker="Gallery" title="Inside the experience" accent={accent} />
            <div className="grid auto-rows-[150px] grid-cols-2 gap-2 md:auto-rows-[230px] md:grid-cols-4 md:gap-3" data-testid="brand-gallery">
              {gallery.map((src, i) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-[4px] border border-border bg-card ${i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : ""}`}
                >
                  <ShimmerImage src={src} alt="" fill sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"} className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={SECTION} aria-label="Plan an event">
        <div
          className={`${INNER} grid items-center gap-8 rounded-md border p-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:gap-12 md:p-14`}
          style={{ borderColor: accent, background: hexToRgba(accent, 0.07) }}
        >
          <div>
            <div className={`${KICKER} mb-3.5`} style={{ color: accent }}>
              BRING {brand.title} TO YOU
            </div>
            <h2 className={H2}>Your event. {brand.title} production.</h2>
            <Link
              href={CONTACT_PAGE_PATH}
              className="mt-7 inline-flex min-h-12 items-center rounded-full px-6 text-sm font-semibold text-[#0b0a08] no-underline"
              style={{ background: accent }}
            >
              {ctaLabel}
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">Follow</div>
            {socials.map((s) => (
              <a
                key={s.platform}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] items-center justify-between gap-3 rounded-[4px] border border-border bg-background px-[18px] no-underline transition-colors hover:border-[var(--brand-accent)]"
                style={{ ["--brand-accent" as string]: accent }}
              >
                <span className="font-condensed text-lg font-bold uppercase text-foreground">{s.handle}</span>
                <span className="font-mono text-[9.5px] uppercase tracking-[0.14em]" style={{ color: accent }}>
                  {s.platform}
                  {s.viaLupfr ? " · via LUPFR" : ""} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-[110px] pt-20 sm:px-8 lg:px-12" aria-label="More from LUPFR">
        <div className={INNER}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className={`${KICKER} text-[#c9a869]`}>More from LUPFR</div>
            <Link
              href="/events"
              data-testid="see-past-events"
              className="inline-flex items-center gap-2 rounded-[2px] border px-[18px] py-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] no-underline transition-colors hover:bg-foreground/[0.05]"
              style={{ borderColor: accent, color: accent }}
            >
              See Past Events <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto md:grid md:grid-cols-5 md:gap-3 md:overflow-visible" data-testid="brand-others">
            {others.map((o) => (
              <Link
                key={o.key}
                href={brandPath(o)}
                aria-label={`${brandPlainTitle(o)} — ${o.tag}`}
                className="group relative aspect-[4/5] shrink-0 basis-[42vw] snap-start overflow-hidden rounded-[4px] border border-border bg-card no-underline transition-colors hover:border-[var(--brand-accent)] md:basis-auto"
                style={{ ["--brand-accent" as string]: o.accent }}
              >
                {o.image ? <Image src={o.image} alt="" fill sizes="(max-width: 768px) 42vw, 20vw" className="object-cover" /> : null}
                <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,7,6,0.92)_25%,rgba(8,7,6,0.2)_75%)]" aria-hidden />
                <span className="absolute inset-x-3.5 bottom-3.5 flex flex-col gap-2">
                  <BrandWordmark brand={o} className="font-condensed text-[clamp(18px,1.9vw,26px)] font-extrabold uppercase leading-[0.88] tracking-[-0.01em] text-white" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: o.accent }}>
                    {o.tag} →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
