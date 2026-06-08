"use client"

import { motion } from "framer-motion"

interface FireIconProps {
  size?: number
  className?: string
}

export function FireIcon({ size = 24, className = "" }: FireIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id="fireBase" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#ff2200" />
          <stop offset="60%" stopColor="#ff6600" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="fireMid" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#ff8800" />
          <stop offset="60%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="fireCore" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="70%" stopColor="#ffaa00" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      {/* Outer flame */}
      <motion.path
        d="M12 2 C10 6 6 7 7 12 C7 16 9 18 12 22 C15 18 17 16 17 12 C18 7 14 6 12 2Z"
        fill="url(#fireBase)"
        animate={{ scaleY: [1, 1.06, 0.96, 1.04, 1], skewX: [0, -2, 1, -1, 0] }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50% 90%" }}
      />
      {/* Mid flame */}
      <motion.path
        d="M12 6 C10.5 9 8.5 10 9 13.5 C9 16.5 10.5 18.5 12 21 C13.5 18.5 15 16.5 15 13.5 C15.5 10 13.5 9 12 6Z"
        fill="url(#fireMid)"
        animate={{ scaleY: [1, 1.08, 0.94, 1.05, 1], skewX: [0, 2, -1, 1, 0] }}
        transition={{ duration: 0.75, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        style={{ transformOrigin: "50% 90%" }}
      />
      {/* Inner core */}
      <motion.path
        d="M12 10 C11 12 10.5 13.5 11 15.5 C11 17.5 11.5 18.5 12 20 C12.5 18.5 13 17.5 13 15.5 C13.5 13.5 13 12 12 10Z"
        fill="url(#fireCore)"
        animate={{ scaleY: [1, 1.1, 0.92, 1.06, 1] }}
        transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        style={{ transformOrigin: "50% 90%" }}
      />
    </svg>
  )
}

/** Animated fire ring that can wrap any element */
export function FireRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 10px 2px rgba(255,100,0,0.4)",
            "0 0 22px 6px rgba(255,50,0,0.6)",
            "0 0 14px 3px rgba(255,150,0,0.5)",
            "0 0 20px 5px rgba(255,80,0,0.55)",
            "0 0 10px 2px rgba(255,100,0,0.4)",
          ],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {children}
    </div>
  )
}
