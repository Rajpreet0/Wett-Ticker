"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Building2, User, CalendarRange, Calendar, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { ACTION_TYPES } from "@/lib/constants"
import type { Bet } from "@/lib/types"
import { isActionVisible } from "@/hooks/use-actions"

interface ActionCardProps {
  action: Bet
}

const WEEKDAY_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]

function getWeekdayLabel(action: Bet): string | null {
  if (action.action_weekdays) {
    const days = action.action_weekdays
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 0 && n <= 6)
      .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b))
      .map((n) => WEEKDAY_SHORT[n])
    return days.length > 0 ? days.join(", ") : null
  }
  if (action.action_montags_only) return "Mo"
  return null
}

export function ActionCard({ action }: ActionCardProps) {
  const ActionIcon = ACTION_TYPES.find((a) => a.value === action.action_type)?.Icon ?? Sparkles
  const isActive = isActionVisible(action)
  const hasRange = action.action_start_date || action.action_end_date
  const weekdayLabel = getWeekdayLabel(action)

  return (
    <motion.div
      whileHover={{ scale: 1.012, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.985 }}
      className="rounded-2xl overflow-hidden wm-border-action"
      style={{
        background: "linear-gradient(160deg, oklch(0.13 0.028 240) 0%, oklch(0.10 0.022 240) 100%)",
        border: "1px solid oklch(0.22 0.03 240)",
        borderLeftWidth: "3px",
      }}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(255,215,0,0.15)",
              boxShadow: "0 0 12px rgba(255,215,0,0.25)",
            }}
          >
            <ActionIcon className="h-5 w-5" style={{ color: "#FFD700" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold leading-tight">{action.match_name}</p>
              <span
                className="shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={isActive ? {
                  background: "rgba(26,140,46,0.18)",
                  border: "1px solid rgba(26,140,46,0.35)",
                  color: "#4ade80",
                } : {
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: "var(--muted-foreground)",
                }}
              >
                {isActive ? "✓ Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {action.provider}
              </span>
              <span className="opacity-40">·</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {action.member_name}
              </span>
              {action.action_type && (
                <>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1">
                    <ActionIcon className="h-3 w-3" />
                    {action.action_type}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {action.tip && (
          <p
            className="text-sm text-foreground/85 rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {action.tip}
          </p>
        )}

        {/* Date range + schedule */}
        <div className="flex flex-wrap gap-2">
          {hasRange && (
            <div
              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "var(--muted-foreground)",
              }}
            >
              <CalendarRange className="h-3 w-3" />
              <span>
                {action.action_start_date
                  ? format(new Date(action.action_start_date), "dd.MM.yy", { locale: de })
                  : "jetzt"}
                {" – "}
                {action.action_end_date
                  ? format(new Date(action.action_end_date), "dd.MM.yy", { locale: de })
                  : "unbegrenzt"}
              </span>
            </div>
          )}

          {weekdayLabel && (
            <div
              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
              style={{
                background: "rgba(255,215,0,0.12)",
                border: "1px solid rgba(255,215,0,0.25)",
                color: "#FFD700",
              }}
            >
              <Calendar className="h-3 w-3" />
              <span>{weekdayLabel}</span>
            </div>
          )}

          {!hasRange && !weekdayLabel && (
            <div
              className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "var(--muted-foreground)",
              }}
            >
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(action.created_at), "dd.MM.yy", { locale: de })}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
