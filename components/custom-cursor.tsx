"use client"

import { useEffect, useState } from "react"
import { motion, useSpring } from "framer-motion"

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const springConfig = { damping: 25, stiffness: 400 }
  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)
  const trailSpring = { damping: 20, stiffness: 150 }
  const trailX = useSpring(0, trailSpring)
  const trailY = useSpring(0, trailSpring)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      trailX.set(e.clientX)
      trailY.set(e.clientY)
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    const handleMouseEnter = () => {
      setIsVisible(true)
    }

    // Check for interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = Boolean(
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.classList.contains("cursor-pointer")
      )
      
      setIsHovering(isInteractive)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("mouseenter", handleMouseEnter)
    window.addEventListener("mouseover", handleElementHover)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mouseenter", handleMouseEnter)
      window.removeEventListener("mouseover", handleElementHover)
    }
  }, [cursorX, cursorY, trailX, trailY])

  // Don't render on mobile/touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null
  }

  return (
    <>
      {/* Main Cursor */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
        }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground gpu-accelerate"
          animate={{
            scale: isHovering ? 4.67 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      </motion.div>

      {/* Trailing Cursor - spring-follow for smooth lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] hidden md:block -translate-x-1/2 -translate-y-1/2"
        style={{ x: trailX, y: trailY }}
      >
        <motion.div
          className="w-10 h-10 rounded-full border-2 border-accent/60 gpu-accelerate"
          animate={{
            opacity: isVisible ? 0.5 : 0,
            scale: isHovering ? 1.3 : 1,
          }}
          transition={{ duration: 0.25 }}
        />
      </motion.div>
    </>
  )
}
