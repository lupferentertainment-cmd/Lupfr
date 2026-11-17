import Image from "next/image"
import { ZusebiFilmButton } from "@/components/zusebi-film"

/** Round play glyph shared by the Zusebi poster tiles (v16 design: 72–80px ring, off-centre triangle). */
export function PlayRing({ size }: { size: 44 | 72 | 80 }) {
  const tri = size === 44 ? "border-y-[7px] border-l-[11px] ml-[3px]" : size === 72 ? "border-y-[11px] border-l-[18px] ml-[5px]" : "border-y-[12px] border-l-[20px] ml-1.5"
  return (
    <span
      className="absolute left-1/2 top-[46%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(243,239,230,0.75)] bg-[rgba(8,7,6,0.55)]"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className={`h-0 w-0 border-y-transparent border-l-[#f3efe6] ${tri}`} />
    </span>
  )
}

/** /media's featured tile: Zusebi live at Golden Gate Park, opens the film modal. */
export function ZusebiFeaturedTile() {
  return (
    <ZusebiFilmButton className="group relative block aspect-video w-full overflow-hidden rounded-[4px] border border-border bg-[#0d0c0a] p-0 text-left transition-colors hover:border-[rgba(201,168,105,0.6)]">
      <Image src="/events/ggl_main_dj.webp" alt="" fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" style={{ objectPosition: "center 45%" }} />
      <span className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,7,6,0.92)_8%,rgba(8,7,6,0.15)_55%,rgba(8,7,6,0.5)_100%)]" aria-hidden />
      <span className="absolute left-[18px] top-[18px] rounded-[2px] bg-[#c9a869] px-[9px] py-[5px] font-mono text-[9.5px] tracking-[0.18em] text-[#1a1408]">FEATURED SET</span>
      <PlayRing size={80} />
      <span className="absolute inset-x-[26px] bottom-6 flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#e8caa0]">OUT//SIDE · LANDS END, SAN FRANCISCO</span>
        <span className="font-condensed text-[clamp(30px,3.6vw,52px)] font-extrabold uppercase leading-[0.92] text-[#fdf6e8]">Zusebi · Live at Golden Gate Park</span>
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#c9a869]">WATCH THE FULL SET ▶</span>
      </span>
    </ZusebiFilmButton>
  )
}
