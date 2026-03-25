"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Bet } from "@/lib/types"

export function useBets() {
  const [bets, setBets] = useState<Bet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchBets() {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .neq("category", "action")
        .order("created_at", { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setBets(data as Bet[])
      }
      setIsLoading(false)
    }

    fetchBets()

    const channel = supabase
      .channel("bets-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bets" },
        (payload) => {
          setBets((prev) => [payload.new as Bet, ...prev])
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bets" },
        (payload) => {
          setBets((prev) =>
            prev.map((b) =>
              b.id === (payload.new as Bet).id ? (payload.new as Bet) : b
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function refresh() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .neq("category", "action")
      .order("created_at", { ascending: false })
    if (!error && data) setBets(data as Bet[])
  }

  return { bets, isLoading, error, refresh }
}
