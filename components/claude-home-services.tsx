"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { GoldShineText } from "@/components/gold-shine-text"
import { getServices, servicePath } from "@/lib/data/services"

const services = getServices()

export function ClaudeHomeServices() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const current = services[active] ?? services[0]
  if (!current) return null

  return (
    <section id="services" ref={ref} className="relative overflow-hidden border-b border-white/10 bg-[#070605] text-[#f3efe6]">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block" style={{ WebkitMaskImage: "linear-gradient(90deg,transparent,#000 40%)", maskImage: "linear-gradient(90deg,transparent,#000 40%)" }}>
        {current.image ? <Image src={current.image} alt="" fill sizes="50vw" className="object-cover transition duration-700" /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-24 sm:px-8 lg:px-12 lg:py-[120px]">
        <div className="max-w-[760px]">
          <div className="mb-6 flex gap-3 font-mono text-[11px] tracking-[0.2em] text-[#8f887c]"><span className="text-[#c9a869]">(01)</span><span>SERVICES</span></div>
          <h2 className="font-condensed text-[clamp(54px,7vw,100px)] font-extrabold uppercase leading-[0.86] tracking-[0.005em] text-[#fdf6e8]">Idea to <GoldShineText scrollTargetRef={ref}>execution.</GoldShineText></h2>
          <div className="my-8 h-[3px] w-[130px] bg-[#c9a869]" />
          <p className="mb-10 text-lg text-[#e6e0d4]">All an event needs in one place.</p>

          <div className="grid grid-cols-2 gap-x-5 border-t border-white/10 sm:grid-cols-3">
            {services.map((service, i) => (
              <button key={service.title} type="button" onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} className={`border-b border-white/10 py-5 text-left font-condensed text-lg font-extrabold uppercase transition ${active === i ? "text-[#e8caa0]" : "text-[#bdb6a9] hover:text-white"}`}>
                <span className="mr-2 font-mono text-[9px] text-[#8f887c]">0{i + 1}</span>{service.title}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h3 className="font-condensed text-4xl font-extrabold uppercase text-white">{current.title}</h3>
              <p className="mt-3 max-w-xl leading-relaxed text-[#bdb6a9]">{current.description}</p>
            </div>
            <Link href={servicePath(current)} className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e8caa0]">Explore service →</Link>
          </div>
        </div>
      </div>
    </section>
  )
}
