"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export function useHypeChannel(onHype: (betId: string) => void) {
  const cbRef = useRef(onHype)
  cbRef.current = onHype
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel("hype-events", { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "hype" }, ({ payload }) => {
        if (payload?.betId) cbRef.current(payload.betId)
      })
      .subscribe()
    channelRef.current = ch
    return () => { supabase.removeChannel(ch) }
  }, [])

  function sendHype(betId: string) {
    channelRef.current?.send({
      type: "broadcast",
      event: "hype",
      payload: { betId },
    })
  }

  return { sendHype }
}
