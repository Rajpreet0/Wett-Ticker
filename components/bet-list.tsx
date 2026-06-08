"use client"

import { useState } from "react"
import { format, isToday, isThisWeek, isSameDay } from "date-fns"
import { de } from "date-fns/locale"
import { Loader2, Inbox, CalendarDays } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useBets } from "@/hooks/use-bets"
import { useHypeChannel } from "@/hooks/use-hype-channel"
import { BetCard } from "./bet-card"
import { PullToRefresh } from "./pull-to-refresh"
import type { Bet } from "@/lib/types"

type FilterMode = "today" | "week" | "all" | "custom"

const FILTER_LABELS: Record<FilterMode, string> = {
  today:  "Heute",
  week:   "Woche",
  all:    "Alle",
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

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
}

export function BetList() {
  const { bets, isLoading, error, refresh } = useBets()
  const [filterMode, setFilterMode] = useState<FilterMode>("today")
  const [customDate, setCustomDate] = useState<Date | null>(null)
  const [hypeCounts, setHypeCounts] = useState<Record<string, number>>({})

  const { sendHype } = useHypeChannel((betId) => {
    setHypeCounts((prev) => ({ ...prev, [betId]: (prev[betId] ?? 0) + 1 }))
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-7 w-7 text-primary" />
        </motion.div>
        <p className="text-xs text-muted-foreground">Tipps werden geladen…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive text-sm">{error}</div>
    )
  }

  const filtered = filterBets(bets, filterMode, customDate)

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
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterMode(f)}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={filterMode === f ? {
                background: "linear-gradient(135deg, rgba(26,140,46,0.30) 0%, rgba(29,93,254,0.20) 100%)",
                border: "1px solid rgba(26,140,46,0.45)",
                color: "#4ade80",
              } : {
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--muted-foreground)",
              }}
            >
              {FILTER_LABELS[f]}
            </motion.button>
          ))}
          <div className="flex items-center gap-1 shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterMode("custom")}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
              style={filterMode === "custom" ? {
                background: "linear-gradient(135deg, rgba(26,140,46,0.30) 0%, rgba(29,93,254,0.20) 100%)",
                border: "1px solid rgba(26,140,46,0.45)",
                color: "#4ade80",
              } : {
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--muted-foreground)",
              }}
            >
              <CalendarDays className="h-3 w-3" />
              {filterMode === "custom" && customDate
                ? format(customDate, "dd.MM.", { locale: de })
                : "Datum"}
            </motion.button>
            {filterMode === "custom" && (
              <input
                type="date"
                className="text-xs rounded-full px-2.5 py-1 text-foreground w-32"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                onChange={(e) => { if (e.target.value) setCustomDate(new Date(e.target.value)) }}
              />
            )}
          </div>
        </div>

        {/* Empty State */}
        <AnimatePresence>
          {Object.keys(grouped).length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Inbox className="h-12 w-12 opacity-40" />
              </motion.div>
              <p className="text-sm">
                {filterMode === "today" ? "Keine Tipps für heute" :
                  filterMode === "week" ? "Keine Tipps diese Woche" : "Keine Tipps gefunden"}
              </p>
              {filterMode !== "all" && (
                <button
                  onClick={() => setFilterMode("all")}
                  className="text-xs font-semibold underline"
                  style={{ color: "#1a8c2e" }}
                >
                  Alle anzeigen
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grouped Bets */}
        <motion.div
          className="space-y-6"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {Object.entries(grouped).map(([date, dateBets]) => (
            <motion.div key={date} variants={itemVariants} className="space-y-3">
              {/* Date separator */}
              <div className="flex items-center gap-2 px-1">
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
                <h3
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(26,140,46,0.12)",
                    border: "1px solid rgba(26,140,46,0.20)",
                    color: "#4ade80",
                  }}
                >
                  {date}
                </h3>
                <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              {/* Cards */}
              <motion.div className="space-y-3" variants={listVariants}>
                {dateBets.map((bet, i) => (
                  <motion.div key={bet.id} variants={itemVariants} custom={i}>
                    <BetCard bet={bet} index={i} hypeCount={hypeCounts[bet.id] ?? 0} onHype={sendHype} />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </PullToRefresh>
  )
}
