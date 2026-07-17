"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight, Briefcase, Laptop, MapPin } from "lucide-react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { getCareers, type CareerItem } from "@/lib/data/careers"
import { LINKS } from "@/lib/links"

const SPRING_PUNCH = { type: "spring" as const, stiffness: 500, damping: 26 }
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 550, damping: 30 }
const CARD_STAGGER = 0.08

const careers = getCareers()

function CareerMetaChip({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
      <Icon size={13} className="text-accent" aria-hidden />
      {label}
    </span>
  )
}

function CareerCard({ job, index, isInView }: { job: CareerItem; index: number; isInView: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 }}
      transition={{ ...SPRING_PUNCH, delay: 0.12 + index * CARD_STAGGER }}
      className="group relative flex h-full flex-col rounded-sm border border-border/80 bg-gradient-to-b from-card to-card/95 dark:from-card dark:to-card/90 p-8 transition-shadow duration-200 hover:shadow-[0_0_0_1px_rgba(184,148,58,0.2),0_20px_40px_-12px_rgba(168,132,48,0.25)]"
    >
      <div className="absolute inset-x-0 top-0 h-px rounded-t-sm bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none" aria-hidden />

      <h3 className="text-xl font-semibold tracking-tight mb-3 group-hover:text-accent transition-colors">
        {job.title}
      </h3>

      <div className="mb-4 flex flex-wrap gap-2">
        <CareerMetaChip icon={MapPin} label={job.location} />
        <CareerMetaChip icon={Briefcase} label={job.type} />
        <CareerMetaChip icon={Laptop} label={job.workMode} />
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed mb-5">{job.summary}</p>

      <ul className="mb-8 space-y-1.5">
        {job.highlights.map((highlight) => (
          <li key={highlight} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
            {highlight}
          </li>
        ))}
      </ul>

      <motion.a
        href={job.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-metallic-gold mt-auto inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-label={`Apply for ${job.title} on LinkedIn`}
      >
        Apply on LinkedIn
        <ArrowUpRight size={15} aria-hidden />
      </motion.a>
    </motion.article>
  )
}

function NoOpenRoles() {
  return (
    <p className="text-center text-muted-foreground">
      No open roles right now — follow us on{" "}
      <a
        href={LINKS.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent hover:underline"
      >
        LinkedIn
      </a>{" "}
      to hear about new openings first.
    </p>
  )
}

export function Careers() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })

  return (
    <section id="careers" ref={ref} className="relative [overflow-x:clip] px-4 sm:px-6 lg:px-12">
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ ...SPRING_SNAPPY, delay: 0.1 }}
          className="text-center mb-10 sm:mb-12 md:mb-14"
        >
          <motion.p
            className="lupfr-section-kicker mb-4"
            initial={{ opacity: 0, x: -24 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.05 }}
          >
            Join the Team
          </motion.p>
          <motion.h2
            className="mb-6"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ ...SPRING_PUNCH, delay: 0.12 }}
          >
            <GoldShineText scrollTargetRef={ref}>Careers</GoldShineText>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ ...SPRING_SNAPPY, delay: 0.22 }}
          >
            Help us build one-of-a-kind music experiences across LA & SF. Ground-floor roles, direct mentorship, real shows.
          </motion.p>
        </motion.div>

        {careers.length === 0 ? (
          <NoOpenRoles />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {careers.map((job, i) => (
              <CareerCard key={job.title} job={job} index={i} isInView={isInView} />
            ))}
          </div>
        )}

        <motion.p
          className="mt-10 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3 }}
        >
          See what it&apos;s like behind the scenes —{" "}
          <a
            href={LINKS.linkedinLife}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Life at LUPFR on LinkedIn
          </a>
        </motion.p>
      </ScrollReveal>
    </section>
  )
}
