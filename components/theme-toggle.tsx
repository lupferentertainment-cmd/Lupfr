'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

/** Play a short click sound via Web Audio (no asset). Optional; fails silently if unsupported. */
function playClickSound(): void {
  if (typeof window === 'undefined') return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.04)
  } catch {
    // Optional: no-op if AudioContext not allowed or unavailable
  }
}

export function ThemeToggle({ withSound = false, className }: { withSound?: boolean; className?: string }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const isDark = resolvedTheme === 'dark'
  const toggle = useCallback(() => {
    const next = isDark ? 'light' : 'dark'
    setTheme(next)
    if (withSound) playClickSound()
  }, [isDark, setTheme, withSound])

  if (!mounted) {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        aria-hidden
      >
        <Moon className="size-4 text-muted-foreground" aria-hidden />
        <Switch checked={false} disabled className="opacity-70" />
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isDark ? (
        <Sun className="size-4 text-muted-foreground shrink-0" aria-hidden />
      ) : (
        <Moon className="size-4 text-muted-foreground shrink-0" aria-hidden />
      )}
      <Switch
        aria-label={isDark ? 'Turn light on' : 'Turn light off'}
        checked={!isDark}
        onCheckedChange={toggle}
        className="data-[state=checked]:bg-accent"
      />
    </div>
  )
}
