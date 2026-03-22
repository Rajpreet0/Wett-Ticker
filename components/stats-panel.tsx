"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/calculations"
import type { MemberStats } from "@/lib/types"

export function StatsPanel() {
  const [stats, setStats] = useState<MemberStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-sm py-8">
        Keine Statistiken vorhanden
      </p>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mitglied</TableHead>
            <TableHead className="text-center">Tipps</TableHead>
            <TableHead className="text-center">G / V</TableHead>
            <TableHead className="text-center">Trefferquote</TableHead>
            <TableHead className="text-right">Gewinn/Verlust</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats
            .sort((a, b) => b.net_profit - a.net_profit)
            .map((s) => (
              <TableRow key={s.member_name}>
                <TableCell className="font-medium">{s.member_name}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {s.total_bets}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-green-400">{s.won}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-red-400">{s.lost}</span>
                </TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      s.win_rate >= 50
                        ? "text-green-400"
                        : s.win_rate > 0
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                    }
                  >
                    {s.win_rate.toFixed(0)}%
                  </span>
                </TableCell>
                <TableCell className="text-right font-mono">
                  <span
                    className={
                      s.net_profit > 0
                        ? "text-green-400"
                        : s.net_profit < 0
                        ? "text-red-400"
                        : "text-muted-foreground"
                    }
                  >
                    {s.net_profit > 0 ? "+" : ""}
                    {formatCurrency(s.net_profit)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  )
}
