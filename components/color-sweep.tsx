"use client"

import { motion } from "framer-motion"

const SWEEPS = [
  { color: "rgba(26,140,46,0.22)",  width: "45%", duration: 8,  delay: 2,  rtl: false },
  { color: "rgba(29,93,254,0.18)",  width: "38%", duration: 10, delay: 0,  rtl: true  },
  { color: "rgba(255,215,0,0.16)",  width: "42%", duration: 9,  delay: 7,  rtl: false },
  { color: "rgba(212,32,32,0.14)",  width: "32%", duration: 11, delay: 13, rtl: true  },
]

export function ColorSweep() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 40 }}
      aria-hidden
    >
      {SWEEPS.map((s, i) => (
        <motion.div
          key={i}
          className="absolute inset-y-0"
          style={{
            width: s.width,
            background: `linear-gradient(90deg, transparent 0%, ${s.color} 50%, transparent 100%)`,
          }}
          initial={{ x: s.rtl ? "250%" : "-60%" }}
          animate={{ x: s.rtl ? "-60%" : "250%" }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: 16 + i * 4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
