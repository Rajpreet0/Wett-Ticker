import { CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react"
import type { Bet } from "@/lib/types"

interface StatusBadgeProps {
  status: Bet["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "won") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 wm-glow-gold"
        style={{
          background: "linear-gradient(135deg, #FFD70033 0%, #1a8c2e33 100%)",
          border: "1px solid #FFD70055",
          color: "#FFD700",
        }}
      >
        <CheckCircle2 className="h-3 w-3" />
        Gewonnen
      </span>
    )
  }
  if (status === "lost") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
        style={{
          background: "#d4202022",
          border: "1px solid #d4202055",
          color: "#f87171",
        }}
      >
        <XCircle className="h-3 w-3" />
        Verloren
      </span>
    )
  }
  if (status === "info") {
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
        style={{
          background: "#FFD70022",
          border: "1px solid #FFD70044",
          color: "#FFD700",
        }}
      >
        <Sparkles className="h-3 w-3" />
        Aktion
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0"
      style={{
        background: "#1d5dfe22",
        border: "1px solid #1d5dfe44",
        color: "#60a5fa",
      }}
    >
      {/* Pulsing dot for open bets */}
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400" />
      </span>
      Offen
    </span>
  )
}
