"use client"

import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"

import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"
import { getTeam, type TeamMember } from "@/lib/data/team"
import { cn } from "@/lib/utils"

const TEAM_IMAGE_SIZE = 800
const CARD_EASE = [0.22, 1, 0.36, 1] as const

const team = getTeam()

function TeamCard({
  member,
  index,
  isInView,
}: {
  member: TeamMember
  index: number
  isInView: boolean
}) {
  const [imageReady, setImageReady] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: 0.12 + index * 0.1, ease: CARD_EASE }}
      className="rounded-2xl border border-border/80 bg-card overflow-hidden"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <div
          className={cn(
            "skeleton-shimmer pointer-events-none absolute inset-0 z-0",
            "motion-safe:transition-opacity motion-safe:duration-300",
            "motion-reduce:transition-none",
            imageReady ? "opacity-0" : "opacity-100"
          )}
          aria-hidden
        />
        <Image
          src={member.image}
          alt={`${member.name}, ${member.title}`}
          width={TEAM_IMAGE_SIZE}
          height={TEAM_IMAGE_SIZE}
          sizes="(max-width: 768px) 100vw, 50vw"
          loading="lazy"
          onLoad={() => setImageReady(true)}
          className={cn(
            "relative z-[1] w-full h-full object-cover",
            "motion-safe:transition-opacity motion-safe:duration-300",
            "motion-reduce:transition-none",
            imageReady ? "opacity-100" : "opacity-0"
          )}
        />
      </div>
      <div className="p-5 md:p-6">
        <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
          {member.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {member.title} · {member.location}
        </p>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          {member.bio}
        </p>
      </div>
    </motion.article>
  )
}

export function Team() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "0px 0px 80px 0px" })

  /* Meet the people behind LUPFR — grid of team member cards. */
  return (
    <section
      id="team"
      ref={ref}
      className="py-14 sm:py-16 md:py-20 px-4 sm:px-6 relative overflow-hidden"
      aria-labelledby="team-section-title"
    >
      <ScrollReveal variant="up" amountIn={0.2} className="container mx-auto max-w-7xl relative z-10">
        <p
          id="team-section-title"
          className="text-gold-accent tracking-tight text-sm mb-4"
        >
          Who We Are
        </p>
        <h2 className="lupfr-heading--compact lupfr-heading-stack">
          <GoldShineText scrollTargetRef={ref}>Our</GoldShineText>
          <br />
          <span className="lupfr-heading-subline">Team</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {team.map((member, i) => (
            <TeamCard key={member.name} member={member} index={i} isInView={isInView} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  )
}
