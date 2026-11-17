"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { ThemeToggle } from "@/components/theme-toggle"
import { CONTACT_PAGE_PATH } from "@/lib/site"

// Round 13 (v16 design): six links, numbers removed. "Team" is Our Team (`#team`, which now
// also holds the Exec Team — the standalone Founders section is gone).
const links = [
  ["Services", "#services"],
  ["Experiences", "#events"],
  ["Brands", "#brands"],
  ["Media", "#news"],
  ["About", "#about"],
  ["Team", "#team"],
] as const

export function ClaudeHomeNavigation() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-[80] h-[76px] border-b border-white/10 bg-[#070605]/80 backdrop-blur-xl">
      <nav aria-label="Primary" className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-8">
        <Link href="#" aria-label="LUPFR home" className="shrink-0">
          <LupfrLogoImage width={300} height={100} sizes="170px" className="h-11 w-auto object-contain" priority />
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-[30px] whitespace-nowrap lg:flex">
          {links.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="font-condensed text-[15px] font-semibold uppercase tracking-[0.12em] text-[#bdb6a9] transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle withSound className="shrink-0" />
          <Link href={CONTACT_PAGE_PATH} className="hidden rounded-full btn-metallic-gold px-4 py-2.5 text-xs font-semibold sm:inline-flex">
            Plan Your Event
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} className="grid size-10 place-items-center text-white lg:hidden" aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="absolute left-0 right-0 top-[76px] max-h-[calc(100dvh-76px)] overflow-y-auto border-b border-white/10 bg-[#0b0a08]/98 px-6 py-6 lg:hidden">
          <nav aria-label="Site navigation" className="flex flex-col gap-5">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="font-condensed text-3xl font-bold uppercase text-[#f3efe6]">
                {label}
              </a>
            ))}
            <Link href={CONTACT_PAGE_PATH} onClick={() => setOpen(false)} className="mt-2 inline-flex w-fit rounded-sm btn-metallic-gold px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Plan Your Event
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
