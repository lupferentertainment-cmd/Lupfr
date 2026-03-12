"use client"

import { motion, useInView, useScroll, useTransform, animate } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { GoldShineText } from "@/components/gold-shine-text"

function CountUpOrdinal({ end, isInView }: { end: number; isInView: boolean }) {
  const [display, setDisplay] = useState(0)
  const hasStarted = useRef(false)
  useEffect(() => {
    if (!isInView) return
    if (hasStarted.current) return
    hasStarted.current = true
    const controls = animate(0, end, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    return () => controls.stop()
  }, [isInView, end])
  return <span className="tabular-nums">{String(display).padStart(2, "0")}</span>
}

const values = [
  {
    number: 1,
    title: "Curation",
    description: "Every artist, every venue, every detail is intentionally selected to create cohesive experiences.",
  },
  {
    number: 2,
    title: "Community",
    description: "We build connections that last beyond the dancefloor. Our events are where friendships form.",
  },
  {
    number: 3,
    title: "Quality",
    description: "Premium sound, immersive lighting, stylish venues. We don't compromise on production value.",
  },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, margin: "0px 0px 80px 0px" })
  const containerRef = useRef(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [100, -100])

  return (
    <section id="about" ref={ref} className="py-32 px-6 relative overflow-hidden">
      <ScrollReveal variant="up" amountIn={0.2} className="relative">
        <div ref={containerRef} className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-gold-accent uppercase tracking-[0.3em] text-sm mb-4">The Story</p>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8">
              <GoldShineText>Culture Meets</GoldShineText>
              <br />
              <span className="text-muted-foreground">Production</span>
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p>
                <span className="inline-block text-metallic-gold-shimmer">Lupfer Entertainment</span> was born from a simple idea: San Francisco deserves house music experiences that match its energy and creativity. We saw a gap between the underground scene and accessible, high-quality events.
              </p>
              <p>
                Today, we produce boat parties on the Bay, rooftop sessions with skyline views, and warehouse events that bring back the raw energy of the underground—all while maintaining the polish that attracts SF&apos;s young professional crowd.
              </p>
              <p>
                Whether you&apos;re a venue looking to elevate your programming, a brand seeking authentic nightlife partnerships, or simply someone who wants to dance to great music with a great crowd—we&apos;re here to make it happen.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="w-16 h-px bg-accent" />
              <p className="text-foreground font-medium">SF&apos;s House Music Movement</p>
            </motion.div>
          </motion.div>

          {/* Right - Values */}
          <motion.div
            style={{ y }}
            className="relative"
          >
            <div className="space-y-8">
              {values.map((value, i) => (
                <motion.div
                  key={value.number}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.65, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="group p-8 rounded-2xl bg-card border border-border hover:border-accent/50 transition-all duration-300"
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                >
                  <div className="flex items-start gap-6">
                    <span className="text-5xl font-bold text-accent/20 group-hover:text-accent/40 transition-colors tabular-nums">
                      <CountUpOrdinal end={value.number} isInView={isInView} />
                    </span>
                    <div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Decorative Element - subtle motion */}
            <motion.div
              className="absolute -top-20 -right-20 w-40 h-40 border border-accent/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-10 -left-10 w-24 h-24 border border-accent/10 rounded-full"
              animate={{ rotate: -360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { duration: 30, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
            />
          </motion.div>
        </div>

        {/* Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-32 overflow-hidden"
        >
          <motion.div
            animate={{ x: [0, "-50%"] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center">
                {["BOAT PARTIES", "ROOFTOP SESSIONS", "WAREHOUSE EVENTS", "PRIVATE EXPERIENCES", "TALENT BOOKING", "VENUE PROGRAMMING"].map((item) => (
                  <span key={item} className="mx-8 text-6xl md:text-8xl font-bold text-muted/20 tracking-tighter">
                    {item}
                    <span className="mx-8 text-accent">•</span>
                  </span>
                ))}
              </div>
            ))}
          </motion.div>
        </motion.div>
        </div>
      </ScrollReveal>
    </section>
  )
}
