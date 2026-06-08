"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"

const WM_COLORS = ["#1a8c2e", "#1d5dfe", "#FFD700", "#d42020", "#ffffff", "#e8c020"]

export function shootConfetti() {
  const fire = (angle: number, originX: number) => {
    confetti({
      particleCount: 90,
      angle,
      spread: 58,
      origin: { x: originX, y: 0.72 },
      colors: WM_COLORS,
      gravity: 1.1,
      scalar: 1.1,
      ticks: 220,
    })
  }

  fire(60, 0)
  fire(120, 1)

  // second burst slightly delayed
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 90,
      spread: 100,
      origin: { x: 0.5, y: 0.6 },
      colors: WM_COLORS,
      gravity: 0.9,
      scalar: 0.85,
      ticks: 180,
      shapes: ["circle", "square"],
    })
  }, 250)
}

/** Mount this component to auto-fire confetti once */
export function ConfettiBurst() {
  useEffect(() => {
    shootConfetti()
  }, [])
  return null
}
