"use client"

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { MemberStats } from "@/lib/types"

export function StatsChart() {
  const [stats, setStats] = useState<MemberStats[]>([])

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
  }, [])

  if (stats.length === 0) return null

  const data = stats
    .sort((a, b) => b.net_profit - a.net_profit)
    .map((s) => ({
      name: s.member_name,
      profit: parseFloat(s.net_profit.toFixed(2)),
    }))

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `€${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) => [`€${Number(value).toFixed(2)}`, "Gewinn/Verlust"]}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.profit >= 0 ? "#4ade80" : "#f87171"}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
