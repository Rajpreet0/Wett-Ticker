"use client"

import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Loader2, Inbox } from "lucide-react"
import { useBets } from "@/hooks/use-bets"
import { BetCard } from "./bet-card"

export function BetList() {
  const { bets, isLoading, error } = useBets()

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

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
        <Inbox className="h-10 w-10" />
        <p className="text-sm">Noch keine Tipps eingetragen</p>
      </div>
    )
  }

  // Group by date
  const grouped = bets.reduce<Record<string, typeof bets>>((acc, bet) => {
    const key = format(new Date(bet.created_at), "EEEE, dd. MMMM yyyy", {
      locale: de,
    })
    acc[key] = acc[key] ?? []
    acc[key].push(bet)
    return acc
  }, {})

  return (
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
  )
}
