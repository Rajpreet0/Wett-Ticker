"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Comment } from "@/lib/types"

export function useComments(betId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/bets/${betId}/comments`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? `Fehler beim Laden (${res.status})`)
        return
      }
      const data = await res.json()
      setComments(data)
    } catch {
      setError("Verbindungsfehler")
    } finally {
      setIsLoading(false)
    }
  }, [betId])

  useEffect(() => {
    fetchComments()

    const supabase = createClient()
    const channel = supabase
      .channel(`comments-${betId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `bet_id=eq.${betId}`,
        },
        (payload) => {
          setComments((prev) => {
            if (prev.some((c) => c.id === (payload.new as Comment).id)) return prev
            return [...prev, payload.new as Comment]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [betId, fetchComments])

  async function addComment(memberName: string, content: string): Promise<boolean> {
    const optimistic: Comment = {
      id: `opt-${Date.now()}`,
      bet_id: betId,
      member_name: memberName,
      content,
      created_at: new Date().toISOString(),
    }
    setComments((prev) => [...prev, optimistic])

    try {
      const res = await fetch(`/api/bets/${betId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_name: memberName, content }),
      })
      if (!res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
        return false
      }
      const created: Comment = await res.json()
      setComments((prev) =>
        prev.map((c) => (c.id === optimistic.id ? created : c))
      )
      return true
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
      return false
    }
  }

  return { comments, isLoading, error, addComment }
}
