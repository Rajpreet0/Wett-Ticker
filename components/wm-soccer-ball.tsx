"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect } from "react"

function SoccerBallSVG({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sg" cx="36%" cy="33%" r="68%" fx="36%" fy="33%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#d8d8d8" />
          <stop offset="100%" stopColor="#a0a0a0" />
        </radialGradient>
        <clipPath id="sc">
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#sg)" stroke="#555" strokeWidth="2" />
      {/* Center pentagon */}
      <polygon points="50,27 65,38 60,56 40,56 35,38" fill="#111" clipPath="url(#sc)" />
      {/* Top-right patch */}
      <polygon points="65,38 79,28 86,44 73,56 60,56" fill="#111" clipPath="url(#sc)" />
      {/* Bottom-right patch */}
      <polygon points="60,56 73,56 66,74 50,76 44,60" fill="#111" clipPath="url(#sc)" />
      {/* Bottom-left patch */}
      <polygon points="40,56 44,60 28,74 14,60 27,44" fill="#111" clipPath="url(#sc)" />
      {/* Top-left patch */}
      <polygon points="35,38 27,44 14,28 21,14 36,22" fill="#111" clipPath="url(#sc)" />
      {/* Shine highlight */}
      <ellipse cx="37" cy="35" rx="10" ry="7" fill="white" fillOpacity="0.45" clipPath="url(#sc)" />
    </svg>
  )
}

export function WmFlyingBall() {
  const controls = useAnimation()

  useEffect(() => {
    async function fly() {
      // randomize path slightly each time
      const fromLeft = Math.random() > 0.5
      const yMid1 = 15 + Math.random() * 30
      const yMid2 = 50 + Math.random() * 30

      await controls.start({
        x: fromLeft ? ["-12vw", "30vw", "65vw", "112vw"] : ["112vw", "65vw", "30vw", "-12vw"],
        y: [`${yMid2}vh`, `${yMid1}vh`, `${yMid2 + 10}vh`, `${yMid1 - 5}vh`],
        rotate: fromLeft ? [0, 360, 720, 1080] : [0, -360, -720, -1080],
        transition: {
          duration: 5 + Math.random() * 3,
          ease: "easeInOut",
          times: [0, 0.33, 0.66, 1],
        },
      })
    }

    let timeout: ReturnType<typeof setTimeout>
    const loop = async () => {
      await new Promise((r) => { timeout = setTimeout(r, 8000 + Math.random() * 12000) })
      await fly()
      loop()
    }
    loop()
    return () => clearTimeout(timeout)
  }, [controls])

  return (
    <motion.div
      animate={controls}
      className="fixed pointer-events-none z-50"
      style={{ top: 0, left: 0, opacity: 0.85, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
    >
      <SoccerBallSVG size={44} />
    </motion.div>
  )
}
