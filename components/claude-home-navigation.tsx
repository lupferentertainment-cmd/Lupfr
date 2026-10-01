"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { LupfrLogoImage } from "@/components/lupfr-logo-image"
import { ThemeToggle } from "@/components/theme-toggle"
import { CONTACT_PAGE_PATH } from "@/lib/site"

const links = [
  ["Services", "#services"],
  ["Experiences", "#events"],
  ["Brands", "#brands"],
  ["Media", "#news"],
  ["About", "#about"],
] as const

export function ClaudeHomeNavigation() {
  const [open, setOpen] = useState(false)
  return (
    <header className="fixed inset-x-0 top-0 z-[80] h-[76px] border-b border-white/10 bg-[#070605]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-8">
        <Link href="#" aria-label="LUPFR home" className="shrink-0">
          <LupfrLogoImage width={300} height={100} sizes="170px" className="h-11 w-auto object-contain" priority />
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-10">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="font-mono text-[12px] tracking-[0.04em] text-[#cfc9bd] transition hover:text-[#f3efe6]">
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle withSound className="shrink-0" />
          <Link href={CONTACT_PAGE_PATH} className="hidden rounded-full btn-metallic-gold px-4 py-2.5 text-xs font-semibold sm:inline-flex">
            Plan Your Event
          </Link>
          <button type="button" onClick={() => setOpen((v) => !v)} className="grid size-10 place-items-center text-white lg:hidden" aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="absolute left-0 right-0 top-[76px] border-b border-white/10 bg-[#0b0a08]/98 px-6 py-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="font-condensed text-3xl font-bold uppercase text-[#f3efe6]">
                {label}
              </a>
            ))}
            <Link href={CONTACT_PAGE_PATH} onClick={() => setOpen(false)} className="mt-2 inline-flex w-fit rounded-sm btn-metallic-gold px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em]">
              Plan Your Event
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
