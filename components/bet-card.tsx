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
  MessageSquare,
  Euro,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { formatCurrency, formatOdds, assessFairValue } from "@/lib/calculations"
import { SPORTS, CASINO_GAMES, ACTION_TYPES, SPORT_BET_TYPES } from "@/lib/constants"
import type { Bet } from "@/lib/types"

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

const FAIR_VALUE_CONFIG = {
  great: { Icon: Flame,        className: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  fair:  { Icon: CheckCircle2, className: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
  poor:  { Icon: AlertTriangle,className: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20"},
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
  const [memberName, setMemberName] = useState<string | null>(null)

  useEffect(() => {
    setMemberName(localStorage.getItem("wett-ticker-member"))
  }, [])

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
    if (!memberName) return

    const prev = { upvotes, downvotes, myVote }

    // Optimistic update
    if (myVote === type) {
      // Undo
      setMyVote(null)
      if (type === "up") setUpvotes((v) => v - 1)
      else setDownvotes((v) => v - 1)
    } else {
      if (myVote !== null) {
        // Switch
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
        body: JSON.stringify({ type, member_name: memberName }),
      })
      if (res.ok) {
        const data = await res.json()
        setUpvotes(data.upvotes)
        setDownvotes(data.downvotes)
      }
    } catch {
      // Revert on error
      setUpvotes(prev.upvotes)
      setDownvotes(prev.downvotes)
      setMyVote(prev.myVote)
    }
  }

  const isCasino = bet.category === "casino"
  const isAction = bet.category === "action"
  const hasOdds = bet.odds != null && bet.odds > 0
  const hasStake = bet.stake != null && bet.stake > 0
  const showBettingDetails = !isAction && (hasOdds || hasStake)

  const fairValue = hasOdds ? assessFairValue(bet.odds!, bet.odds_against ?? null) : null
  const fvConfig = fairValue ? FAIR_VALUE_CONFIG[fairValue.rating] : null

  const SportIcon = isAction ? Sparkles : getSportIcon(bet.sport, bet.category)
  const ActionIcon = getActionIcon(bet.action_type)
  const BetTypeIcon = getBetTypeIcon(bet.bet_type, bet.category)

  return (
    <Card
      className={`border-border/50 overflow-hidden ${
        status === "won"
          ? "border-green-500/30"
          : status === "lost"
          ? "border-red-500/20"
          : isAction
          ? "border-amber-500/20"
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

        {/* ── Details Grid (nur bei Sport/Casino mit Daten) ── */}
        {showBettingDetails && (
          <div className="bg-muted/30 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-3">
            {bet.bet_type && (
              <div className="flex items-center gap-2">
                <BetTypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                    {isCasino ? "Spielmodus" : "Wett-Typ"}
                  </p>
                  <p className="font-medium text-xs">{bet.bet_type}</p>
                </div>
              </div>
            )}

            {bet.sport && (
              <div className="flex items-center gap-2">
                <SportIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                    {isCasino ? "Spiel" : "Sport"}
                  </p>
                  <p className="font-medium text-xs">{bet.sport}</p>
                </div>
              </div>
            )}

            {hasOdds && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Quote</p>
                  <p className="font-mono font-bold text-sm">{formatOdds(bet.odds!)}</p>
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

        {/* ── Beschreibung / Tipp ── */}
        <div className="flex items-start gap-2 rounded-lg bg-muted/20 px-3 py-2">
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">{bet.tip}</p>
        </div>

        {/* ── Fair-Value (nur wenn Quote vorhanden) ── */}
        {fairValue && fvConfig && (
          <div className={`rounded-lg border px-3 py-2 space-y-1.5 ${fvConfig.bg}`}>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${fvConfig.className}`}>
                <fvConfig.Icon className="h-3.5 w-3.5" />
                {fairValue.label}
              </span>
              <span className={`text-xs font-mono font-bold ${fvConfig.className}`}>
                EV {fairValue.expectedValue >= 0 ? "+" : ""}{(fairValue.expectedValue * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <div className="bg-background/30 rounded px-1.5 py-1 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Impl. WS</p>
                <p className="font-mono font-semibold">{fairValue.impliedProbability.toFixed(1)}%</p>
              </div>
              <div className="bg-background/30 rounded px-1.5 py-1 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Faire WS</p>
                <p className="font-mono font-semibold">{fairValue.fairProbability.toFixed(1)}%</p>
              </div>
              <div className="bg-background/30 rounded px-1.5 py-1 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Marge</p>
                <p className="font-mono font-semibold">
                  {fairValue.bookmakerMargin !== null ? `${fairValue.bookmakerMargin.toFixed(1)}%` : "~5%"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Möglicher Gewinn (nur wenn Quote + Einsatz) ── */}
        {hasOdds && hasStake && bet.potential_payout != null && (
          <div className="flex items-center justify-between rounded-lg bg-green-500/8 border border-green-500/15 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              Möglicher Gewinn
            </span>
            <span className="font-semibold text-green-400 font-mono text-sm">
              {formatCurrency(bet.potential_payout)}
            </span>
          </div>
        )}

        {/* ── Footer: Datum + Status-Buttons + Votes ── */}
        <div className="flex items-center justify-between pt-1 gap-2">
          {/* Links: Datum */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Calendar className="h-3 w-3" />
            <span>
              {bet.event_datetime
                ? format(new Date(bet.event_datetime), "dd.MM.yy HH:mm", { locale: de })
                : format(new Date(bet.created_at), "dd.MM.yy", { locale: de })}
            </span>
          </div>

          {/* Rechts: Votes + Status-Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Upvote */}
            <button
              onClick={() => vote("up")}
              disabled={!memberName}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                myVote === "up"
                  ? "bg-green-500/20 text-green-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span className="font-mono">{upvotes}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => vote("down")}
              disabled={!memberName}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                myVote === "down"
                  ? "bg-red-500/20 text-red-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span className="font-mono">{downvotes}</span>
            </button>

            {/* Status-Buttons (nur bei Wetten, nicht bei reinen Aktionen) */}
            {!isAction && status === "pending" && (
              <>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => updateStatus("won")}
                  className="h-7 px-2 text-xs text-green-400 hover:text-green-300 hover:bg-green-500/10 gap-1"
                >
                  <Check className="h-3 w-3" />
                  Gewonnen
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => updateStatus("lost")}
                  className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                >
                  <X className="h-3 w-3" />
                  Verloren
                </Button>
              </>
            )}

            {!isAction && status !== "pending" && (
              <>
                <div className="w-px h-4 bg-border mx-0.5" />
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => updateStatus("pending")}
                  className="h-7 px-2 text-xs text-muted-foreground gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
