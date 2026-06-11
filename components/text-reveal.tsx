"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { Fragment } from "react"

const ease = [0.22, 1, 0.36, 1] as const

type RevealTag = "p" | "span" | "h3"

const motionByTag = {
  p: motion.p,
  span: motion.span,
  h3: motion.h3,
} as const

const wordVariants: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
}

interface TextRevealProps {
  text: string
  as?: RevealTag
  className?: string
  /** Seconds before the first word starts. */
  delay?: number
  /** Seconds between each word. */
  stagger?: number
  /** Portion of the element (0-1) that must be visible to trigger. */
  amount?: number
}

function buildContainerVariants(delay: number, stagger: number): Variants {
  return {
    hidden: {},
    visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
  }
}

/**
 * Per-word scroll reveal: words rise + fade in with a stagger as the element
 * enters the viewport (once). Opacity + transform only (no filter blur — see
 * DESIGN.md scroll-motion rules). Reduced motion renders static text.
 */
export function TextReveal({
  text,
  as = "p",
  className,
  delay = 0.1,
  stagger = 0.025,
  amount = 0.5,
}: TextRevealProps) {
  const reducedMotion = useReducedMotion()
  const Tag = motionByTag[as]
  if (reducedMotion) return <Tag className={className}>{text}</Tag>
  return (
    <Tag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -60px 0px" }}
      variants={buildContainerVariants(delay, stagger)}
    >
      {text.split(" ").map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <motion.span
            aria-hidden
            className="inline-block will-change-transform"
            variants={wordVariants}
          >
            {word}
          </motion.span>{" "}
        </Fragment>
      ))}
    </Tag>
  )
}
