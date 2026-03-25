"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Bet } from "@/lib/types"

export function isActionVisible(action: Bet, today: Date = new Date()): boolean {
  const start = action.action_start_date ? new Date(action.action_start_date) : null
  const end   = action.action_end_date   ? new Date(action.action_end_date)   : null

  // Normalize to date-only comparison
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  if (start) {
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    if (d < s) return false
  }
  if (end) {
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    if (d > e) return false
  }

  // Check weekdays restriction (new: action_weekdays = "0,1,2,3,4,5,6")
  if (action.action_weekdays) {
    const allowedDays = action.action_weekdays.split(",").map((n) => parseInt(n.trim(), 10))
    return allowedDays.includes(d.getDay())
  }

  // Legacy: action_montags_only = only Monday
  if (action.action_montags_only) {
    return d.getDay() === 1
  }

  return true
}

export function useActions() {
  const [allActions, setAllActions] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchActions() {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("category", "action")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setAllActions(data as Bet[])
      }
      setIsLoading(false)
    }

    fetchActions()

    const channel = supabase
      .channel("actions-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bets" },
        (payload) => {
          const newBet = payload.new as Bet
          if (newBet.category === "action") {
            setAllActions((prev) => [newBet, ...prev])
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bets" },
        (payload) => {
          const updatedBet = payload.new as Bet
          if (updatedBet.category === "action") {
            setAllActions((prev) =>
              prev.map((b) => (b.id === updatedBet.id ? updatedBet : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const today = new Date()
  const activeActions = allActions.filter((a) => isActionVisible(a, today))

  async function refresh() {
    const supabase = createClient()
    const { data } = await supabase
      .from("bets")
      .select("*")
      .eq("category", "action")
      .order("created_at", { ascending: false })
    if (data) setAllActions(data as Bet[])
  }

  return { allActions, activeActions, isLoading, refresh }
}
