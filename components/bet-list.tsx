"use client"

import { useState } from "react"
import { format, isToday, isThisWeek, isSameDay } from "date-fns"
import { de } from "date-fns/locale"
import { Loader2, Inbox, CalendarDays } from "lucide-react"
import { useBets } from "@/hooks/use-bets"
import { BetCard } from "./bet-card"
import { PullToRefresh } from "./pull-to-refresh"
import type { Bet } from "@/lib/types"

type FilterMode = "today" | "week" | "all" | "custom"

const FILTER_LABELS: Record<FilterMode, string> = {
  today: "Heute",
  week:  "Woche",
  all:   "Alle",
  custom: "Datum",
}

function getRefDate(bet: Bet): Date {
  return new Date(bet.event_datetime ?? bet.created_at)
}

function filterBets(bets: Bet[], mode: FilterMode, customDate: Date | null): Bet[] {
  if (mode === "all") return bets
  return bets.filter((bet) => {
    const ref = getRefDate(bet)
    if (mode === "today") return isToday(ref)
    if (mode === "week") return isThisWeek(ref, { weekStartsOn: 1 })
    if (mode === "custom" && customDate) return isSameDay(ref, customDate)
    return true
  })
}

export function BetList() {
  const { bets, isLoading, error, refresh } = useBets()
  const [filterMode, setFilterMode] = useState<FilterMode>("today")
  const [customDate, setCustomDate] = useState<Date | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive text-sm">{error}</div>
    )
  }

  const filtered = filterBets(bets, filterMode, customDate)

  // Group by reference date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, bet) => {
    const key = format(getRefDate(bet), "EEEE, dd. MMMM yyyy", { locale: de })
    acc[key] = acc[key] ?? []
    acc[key].push(bet)
    return acc
  }, {})

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(["today", "week", "all"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterMode === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setFilterMode("custom")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterMode === "custom"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <CalendarDays className="h-3 w-3" />
              {filterMode === "custom" && customDate
                ? format(customDate, "dd.MM.", { locale: de })
                : "Datum"}
            </button>
            {filterMode === "custom" && (
              <input
                type="date"
                className="text-xs bg-muted/60 border border-border/40 rounded-full px-2 py-1 text-foreground w-32"
                onChange={(e) => {
                  if (e.target.value) setCustomDate(new Date(e.target.value))
                }}
              />
            )}
          </div>
        </div>

        {/* Empty State */}
        {Object.keys(grouped).length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Inbox className="h-10 w-10" />
            <p className="text-sm">
              {filterMode === "today"
                ? "Keine Tipps für heute"
                : filterMode === "week"
                ? "Keine Tipps diese Woche"
                : "Keine Tipps gefunden"}
            </p>
            {filterMode !== "all" && (
              <button
                onClick={() => setFilterMode("all")}
                className="text-xs text-primary underline"
              >
                Alle anzeigen
              </button>
            )}
          </div>
        )}

        {/* Grouped Bets */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateBets]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
                {date}
              </h3>
              {dateBets.map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </PullToRefresh>
  )
}
