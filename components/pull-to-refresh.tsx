"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

const THRESHOLD = 72 // px to pull before triggering
const MAX_PULL = 100

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const el = containerRef.current
    if (!el) return
    // Only start pull if at top of scroll
    if (el.scrollTop > 0) return
    startYRef.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startYRef.current === null || isRefreshing) return
      const delta = e.touches[0].clientY - startYRef.current
      if (delta <= 0) {
        setPullDistance(0)
        return
      }
      // Rubber-band resistance
      const distance = Math.min(delta * 0.5, MAX_PULL)
      setPullDistance(distance)
    },
    [isRefreshing]
  )

  const handleTouchEnd = useCallback(async () => {
    if (startYRef.current === null) return
    startYRef.current = null

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true)
      setPullDistance(THRESHOLD)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [pullDistance, onRefresh])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener("touchstart", handleTouchStart, { passive: true })
    el.addEventListener("touchmove", handleTouchMove, { passive: true })
    el.addEventListener("touchend", handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener("touchstart", handleTouchStart)
      el.removeEventListener("touchmove", handleTouchMove)
      el.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const progress = Math.min(pullDistance / THRESHOLD, 1)
  const isTriggered = pullDistance >= THRESHOLD

  return (
    <div ref={containerRef} className="overflow-y-auto h-full">
      {/* Pull indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: isRefreshing ? THRESHOLD : pullDistance }}
      >
        {(pullDistance > 8 || isRefreshing) && (
          <div
            className="flex items-center gap-2 text-xs text-muted-foreground"
            style={{ opacity: isRefreshing ? 1 : progress }}
          >
            <Loader2
              className="h-4 w-4"
              style={{
                transform: isRefreshing ? undefined : `rotate(${progress * 180}deg)`,
                animation: isRefreshing ? "spin 1s linear infinite" : undefined,
              }}
            />
            <span>{isRefreshing ? "Aktualisieren…" : isTriggered ? "Loslassen" : "Ziehen zum Aktualisieren"}</span>
          </div>
        )}
      </div>

      {children}
    </div>
  )
}
