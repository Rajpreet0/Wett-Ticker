"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import {
  Calendar,
  TrendingUp,
  User,
  CheckCircle2,
  AlertTriangle,
  Flame,
  RotateCcw,
  Check,
  X,
  Building2,
  Euro,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { formatCurrency, formatOdds, calculateDalhoff } from "@/lib/calculations"
import { SPORTS, CASINO_GAMES, ACTION_TYPES, SPORT_BET_TYPES } from "@/lib/constants"
import type { Bet } from "@/lib/types"
import { BetCommentSection } from "./bet-comment-section"

interface BetCardProps {
  bet: Bet
}

function getSportIcon(sport: string, category: string): LucideIcon {
  const list = category === "casino" ? CASINO_GAMES : SPORTS
  return list.find((s) => s.value === sport)?.Icon ?? TrendingUp
}

function getActionIcon(actionType: string): LucideIcon {
  return ACTION_TYPES.find((a) => a.value === actionType)?.Icon ?? Sparkles
}

function getBetTypeIcon(betType: string, category: string): LucideIcon {
  if (category === "sport") {
    return SPORT_BET_TYPES.find((b) => b.value === betType)?.Icon ?? TrendingUp
  }
  return ACTION_TYPES.find((a) => a.value === betType)?.Icon ?? TrendingUp
}

const DALHOFF_CONFIG = {
  value:       { Icon: Flame,         className: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
  neutral:     { Icon: CheckCircle2,  className: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"   },
  disadvantage:{ Icon: AlertTriangle, className: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20"},
}

const CATEGORY_BG = {
  sport:  "bg-blue-500/15 text-blue-400",
  casino: "bg-purple-500/15 text-purple-400",
  action: "bg-amber-500/15 text-amber-400",
}

export function BetCard({ bet }: BetCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(bet.status)
  const [upvotes, setUpvotes] = useState(bet.upvotes ?? 0)
  const [downvotes, setDownvotes] = useState(bet.downvotes ?? 0)
  const [myVote, setMyVote] = useState<"up" | "down" | null>(null)
  const [voterId, setVoterId] = useState<string | null>(null)

  // Get or create a persistent anonymous voter ID
  useEffect(() => {
    let id = localStorage.getItem("wett-voter-id")
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem("wett-voter-id", id)
    }
    setVoterId(id)
  }, [])

  // Load current user's vote on mount
  useEffect(() => {
    if (!voterId) return
    fetch(`/api/bets/${bet.id}/vote`)
      .then((r) => r.json())
      .then((data: { upvotes: number; downvotes: number; voters: { member: string; type: "up" | "down" }[] }) => {
        const mine = data.voters.find((v) => v.member === voterId)
        setMyVote(mine?.type ?? null)
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
      })
      .catch(() => {})
  }, [voterId, bet.id])

  async function updateStatus(newStatus: "won" | "lost" | "pending") {
    const prev = status
    setStatus(newStatus)
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/bets/${bet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) setStatus(prev)
    } catch {
      setStatus(prev)
    } finally {
      setIsUpdating(false)
    }
  }

  async function vote(type: "up" | "down") {
    if (!voterId) return

    const prev = { upvotes, downvotes, myVote }

    // Optimistic update
    if (myVote === type) {
      setMyVote(null)
      if (type === "up") setUpvotes((v) => v - 1)
      else setDownvotes((v) => v - 1)
    } else {
      if (myVote !== null) {
        if (myVote === "up") setUpvotes((v) => v - 1)
        else setDownvotes((v) => v - 1)
      }
      setMyVote(type)
      if (type === "up") setUpvotes((v) => v + 1)
      else setDownvotes((v) => v + 1)
    }

    try {
      const res = await fetch(`/api/bets/${bet.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, member_name: voterId }),
      })
      if (res.ok) {
        const data = await res.json()
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
      }
    } catch {
      setUpvotes(prev.upvotes)
      setDownvotes(prev.downvotes)
      setMyVote(prev.myVote)
    }
  }

  const isCasino  = bet.category === "casino"
  const isAction  = bet.category === "action"
  const isSport   = bet.category === "sport"
  const hasOdds   = isSport && bet.odds != null && bet.odds > 0
  const hasStake  = bet.stake != null && bet.stake > 0
  const showBettingDetails = isSport && (hasOdds || hasStake)

  // Dalhoff calculation from all available quotes
  const quotes = [bet.odds, bet.odds_draw, bet.odds_against].filter(
    (q): q is number => q !== null && q !== undefined && q >= 1.01
  )
  const dalhoff = quotes.length >= 2 ? calculateDalhoff(quotes) : null
  const dConfig = dalhoff ? DALHOFF_CONFIG[dalhoff.rating] : null

  const SportIcon = isAction ? Sparkles : getSportIcon(bet.sport, bet.category)
  const ActionIcon = getActionIcon(bet.action_type)
  const BetTypeIcon = getBetTypeIcon(bet.bet_type, bet.category)

  return (
    <Card
      className={`rounded-2xl border-border/40 shadow-sm overflow-hidden ${
        status === "won"
          ? "border-green-500/30"
          : status === "lost"
          ? "border-red-500/20"
          : isAction
          ? "border-l-4 border-amber-500/50"
          : ""
      }`}
    >
      {/* ── Kopfzeile ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${CATEGORY_BG[bet.category]}`}>
            <SportIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold leading-tight truncate">{bet.match_name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {bet.provider}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {bet.member_name}
                  </span>
                  {bet.action_type && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {bet.action_type}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      <CardContent className="px-4 pb-4 space-y-3">

        {/* ── Beschreibung / Tipp — Hauptteil ── */}
        {bet.tip && (
          <p className="text-sm leading-relaxed text-foreground/90">{bet.tip}</p>
        )}

        {/* ── Details Grid (nur Sport) ── */}
        {showBettingDetails && (
          <div className="bg-muted/30 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-3">
            {bet.bet_type && (
              <div className="flex items-center gap-2">
                <BetTypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Wett-Typ</p>
                  <p className="font-medium text-xs">{bet.bet_type}</p>
                </div>
              </div>
            )}

            {bet.sport && (
              <div className="flex items-center gap-2">
                <SportIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Sport</p>
                  <p className="font-medium text-xs">{bet.sport}</p>
                </div>
              </div>
            )}

            {hasOdds && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Quote</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono font-bold text-sm">{formatOdds(bet.odds!)}</p>
                    {bet.odds_draw != null && (
                      <span className="font-mono text-xs text-muted-foreground">
                        / {formatOdds(bet.odds_draw)} / {bet.odds_against ? formatOdds(bet.odds_against) : "—"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {hasStake && (
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Einsatz</p>
                  <p className="font-medium text-xs">{formatCurrency(bet.stake!)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Casino: Spielmodus als kleine Chips ── */}
        {isCasino && (bet.sport || bet.bet_type) && (
          <div className="flex flex-wrap gap-1.5">
            {bet.sport && (
              <span className="text-[11px] bg-purple-500/10 text-purple-400 rounded-full px-2.5 py-0.5">
                {bet.sport}
              </span>
            )}
            {bet.bet_type && (
              <span className="text-[11px] bg-muted/50 text-muted-foreground rounded-full px-2.5 py-0.5">
                {bet.bet_type}
              </span>
            )}
          </div>
        )}

        {/* ── Dalhoff (nur wenn ≥ 2 Quoten vorhanden) ── */}
        {dalhoff && dConfig && (
          <div className={`rounded-xl border px-3 py-2.5 ${dConfig.bg}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${dConfig.className}`}>
                <dConfig.Icon className="h-3.5 w-3.5" />
                {dalhoff.label}
              </span>
              <span className={`text-xs font-mono font-bold ${dConfig.className}`}>
                {dalhoff.margin >= 0 ? "+" : ""}{dalhoff.marginPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{dalhoff.description}</p>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex flex-col gap-1.5 pt-1">
          {/* Zeile 1: Datum + Votes */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Calendar className="h-3 w-3" />
              <span>
                {bet.event_datetime
                  ? format(new Date(bet.event_datetime), "dd.MM.yy HH:mm", { locale: de })
                  : format(new Date(bet.created_at), "dd.MM.yy", { locale: de })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => vote("up")}
                disabled={!voterId}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                  myVote === "up"
                    ? "bg-green-500/20 text-green-400 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="font-mono">{upvotes}</span>
              </button>

              <button
                onClick={() => vote("down")}
                disabled={!voterId}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                  myVote === "down"
                    ? "bg-red-500/20 text-red-400 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="font-mono">{downvotes}</span>
              </button>
            </div>
          </div>

          {/* Zeile 2: Status-Buttons */}
          {!isAction && status === "pending" && (
            <div className="flex items-center gap-1.5">
              <Button
                size="xs"
                variant="ghost"
                disabled={isUpdating}
                onClick={() => updateStatus("won")}
                className="flex-1 h-7 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1 border border-green-500/20 rounded-full"
              >
                <Check className="h-3 w-3" />
                Gewonnen
              </Button>
              <Button
                size="xs"
                variant="ghost"
                disabled={isUpdating}
                onClick={() => updateStatus("lost")}
                className="flex-1 h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1 border border-red-500/20 rounded-full"
              >
                <X className="h-3 w-3" />
                Verloren
              </Button>
            </div>
          )}

          {!isAction && status !== "pending" && (
            <div className="flex items-center gap-1.5">
              <Button
                size="xs"
                variant="ghost"
                disabled={isUpdating}
                onClick={() => updateStatus("pending")}
                className="h-7 px-2 text-xs text-muted-foreground gap-1 rounded-full"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* ── Kommentare ── */}
        <BetCommentSection betId={bet.id} />
      </CardContent>
    </Card>
  )
}
