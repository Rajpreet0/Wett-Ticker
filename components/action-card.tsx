"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Building2, User, CalendarRange, Calendar, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
      .sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)) // Mo…So order
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
    <Card className="rounded-2xl border-border/40 border-l-4 border-l-amber-500/60 shadow-sm overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <ActionIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{action.match_name}</p>
              <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-green-500/15 text-green-400"
                    : "bg-muted/60 text-muted-foreground"
                }`}
              >
                {isActive ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {action.provider}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {action.member_name}
              </span>
              {action.action_type && (
                <>
                  <span>·</span>
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
          <p className="text-sm text-foreground/80 bg-muted/20 rounded-xl px-3 py-2.5">{action.tip}</p>
        )}

        {/* Date range + schedule */}
        <div className="flex flex-wrap gap-2">
          {hasRange && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1">
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
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 rounded-full px-3 py-1">
              <Calendar className="h-3 w-3" />
              <span>{weekdayLabel}</span>
            </div>
          )}

          {!hasRange && !weekdayLabel && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(action.created_at), "dd.MM.yy", { locale: de })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
