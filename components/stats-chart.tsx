"use client"

import { useEffect, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import type { MemberStats } from "@/lib/types"

export function StatsChart() {
  const [stats, setStats] = useState<MemberStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="h-52 w-full rounded-2xl animate-pulse" style={{ background: "#0d1a24" }} />
  )

  if (stats.length === 0) return (
    <div className="h-52 w-full rounded-2xl flex items-center justify-center" style={{ background: "#0d1a24", border: "1px solid #1e3050" }}>
      <p className="text-sm" style={{ color: "#4a5a7a" }}>Noch keine Daten vorhanden</p>
    </div>
  )

  const data = stats
    .sort((a, b) => b.net_profit - a.net_profit)
    .map((s) => ({ name: s.member_name, profit: parseFloat(s.net_profit.toFixed(2)) }))

  return (
    <div className="h-52 w-full rounded-2xl p-3" style={{ background: "#0d1a24", border: "1px solid #1e3050" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#6b7a99", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6b7a99" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0d1a24",
              border: "1px solid rgba(26,140,46,0.4)",
              borderRadius: "12px",
              fontSize: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            }}
            labelStyle={{ color: "#FFD700", fontWeight: 700 }}
            formatter={(value) => [`€${Number(value).toFixed(2)}`, "Gewinn/Verlust"]}
            cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
          />
          <Bar dataKey="profit" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.profit >= 0 ? "#1a8c2e" : "#d42020"} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
