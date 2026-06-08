"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { motion } from "framer-motion"
import { shootConfetti, shootFireConfetti } from "./confetti-burst"
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
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"
import { FireIcon } from "./fire-icon"
import { formatCurrency, formatOdds, calculateDalhoff } from "@/lib/calculations"
import { SPORTS, CASINO_GAMES, ACTION_TYPES, SPORT_BET_TYPES } from "@/lib/constants"
import type { Bet } from "@/lib/types"
import { BetCommentSection } from "./bet-comment-section"

interface BetCardProps {
  bet: Bet
  index?: number
  hypeCount?: number
  onHype?: (betId: string) => void
}

function getSportIcon(sport: string, category: string): LucideIcon {
  const list = category === "casino" ? CASINO_GAMES : SPORTS
  return list.find((s) => s.value === sport)?.Icon ?? TrendingUp
}
function getActionIcon(actionType: string): LucideIcon {
  return ACTION_TYPES.find((a) => a.value === actionType)?.Icon ?? Sparkles
}
function getBetTypeIcon(betType: string, category: string): LucideIcon {
  if (category === "sport") return SPORT_BET_TYPES.find((b) => b.value === betType)?.Icon ?? TrendingUp
  return ACTION_TYPES.find((a) => a.value === betType)?.Icon ?? TrendingUp
}

const DALHOFF_CONFIG = {
  value:       { Icon: Flame,         color: "#4ade80", bg: "rgba(26,140,46,0.12)", border: "rgba(26,140,46,0.25)" },
  neutral:     { Icon: CheckCircle2,  color: "#60a5fa", bg: "rgba(29,93,254,0.12)", border: "rgba(29,93,254,0.25)" },
  disadvantage:{ Icon: AlertTriangle, color: "#e8c020", bg: "rgba(232,192,32,0.12)", border: "rgba(232,192,32,0.25)" },
}

const CATEGORY_STYLE = {
  sport:  { bg: "rgba(26,140,46,0.18)",  color: "#4ade80",  ring: "rgba(26,140,46,0.35)"  },
  casino: { bg: "rgba(29,93,254,0.18)",  color: "#818cf8",  ring: "rgba(29,93,254,0.35)"  },
  action: { bg: "rgba(255,215,0,0.15)",  color: "#FFD700",  ring: "rgba(255,215,0,0.30)"  },
}

const cardVariants = {
  hidden: { opacity: 0, x: -16, scale: 0.97 },
  show: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
}

export function BetCard({ bet, index = 0, hypeCount = 0, onHype }: BetCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(bet.status)
  const [isJustWon, setIsJustWon] = useState(false)
  const [isHypeActive, setIsHypeActive] = useState(false)
  const prevStatusRef = useRef(bet.status)
  const prevHypeRef = useRef(0)
  const [upvotes, setUpvotes] = useState(bet.upvotes ?? 0)
  const [downvotes, setDownvotes] = useState(bet.downvotes ?? 0)
  const [myVote, setMyVote] = useState<"up" | "down" | null>(null)
  const [voterId, setVoterId] = useState<string | null>(null)

  // Fire glow only plays for 3.5s when status FIRST changes to "won"
  useEffect(() => {
    if (status === "won" && prevStatusRef.current !== "won") {
      setIsJustWon(true)
      const t = setTimeout(() => setIsJustWon(false), 3500)
      return () => clearTimeout(t)
    }
    prevStatusRef.current = status
  }, [status])

  useEffect(() => {
    if (hypeCount > prevHypeRef.current) {
      prevHypeRef.current = hypeCount
      shootFireConfetti()
      setIsHypeActive(true)
      const t = setTimeout(() => setIsHypeActive(false), 2500)
      return () => clearTimeout(t)
    }
  }, [hypeCount])

  useEffect(() => {
    let id = localStorage.getItem("wett-voter-id")
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("wett-voter-id", id) }
    setVoterId(id)
  }, [])

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
    if (newStatus === "won") shootConfetti()
    try {
      const res = await fetch(`/api/bets/${bet.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) setStatus(prev)
    } catch { setStatus(prev) } finally { setIsUpdating(false) }
  }

  async function vote(type: "up" | "down") {
    if (!voterId) return
    const prev = { upvotes, downvotes, myVote }
    if (myVote === type) {
      setMyVote(null)
      if (type === "up") setUpvotes((v) => v - 1); else setDownvotes((v) => v - 1)
    } else {
      if (myVote !== null) { if (myVote === "up") setUpvotes((v) => v - 1); else setDownvotes((v) => v - 1) }
      setMyVote(type)
      if (type === "up") setUpvotes((v) => v + 1); else setDownvotes((v) => v + 1)
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

  function hype() {
    onHype?.(bet.id)
  }

  const isCasino  = bet.category === "casino"
  const isAction  = bet.category === "action"
  const isSport   = bet.category === "sport"
  const hasOdds   = isSport && bet.odds != null && bet.odds > 0
  const hasStake  = bet.stake != null && bet.stake > 0
  const showBettingDetails = isSport && (hasOdds || hasStake)

  const quotes = [bet.odds, bet.odds_draw, bet.odds_against].filter(
    (q): q is number => q !== null && q !== undefined && q >= 1.01
  )
  const dalhoff = quotes.length >= 2 ? calculateDalhoff(quotes) : null
  const dConfig = dalhoff ? DALHOFF_CONFIG[dalhoff.rating] : null

  const SportIcon  = isAction ? Sparkles : getSportIcon(bet.sport, bet.category)
  const ActionIcon = getActionIcon(bet.action_type)
  const BetTypeIcon = getBetTypeIcon(bet.bet_type, bet.category)
  const catStyle = CATEGORY_STYLE[bet.category]

  // Border + glow by status
  const borderClass = isAction
    ? "wm-border-action"
    : status === "won"
    ? "wm-border-won"
    : status === "lost"
    ? "wm-border-lost"
    : "wm-border-pending"

  const glowClass = status === "won"
    ? "wm-glow-green"
    : status === "lost"
    ? "wm-glow-red"
    : ""

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.012, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.985 }}
      className={`rounded-2xl overflow-hidden ${borderClass} ${glowClass}`}
      style={{
        background: "linear-gradient(160deg, oklch(0.13 0.028 240) 0%, oklch(0.10 0.022 240) 100%)",
        border: "1px solid oklch(0.22 0.03 240)",
        borderLeftWidth: "3px",
      }}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Category icon — fire glow for 3.5s after winning */}
          <motion.div
            animate={isJustWon
              ? {
                  rotate: [0, -8, 8, -4, 4, 0, -3, 3, 0],
                  boxShadow: [
                    "0 0 12px rgba(255,140,0,0.4)",
                    "0 0 32px rgba(255,80,0,0.8)",
                    "0 0 18px rgba(255,160,0,0.6)",
                    "0 0 30px rgba(255,60,0,0.75)",
                    "0 0 14px rgba(255,120,0,0.5)",
                    "0 0 28px rgba(255,90,0,0.7)",
                    `0 0 12px ${catStyle.ring}`,
                  ],
                }
              : isHypeActive
              ? {
                  scale: [1, 1.18, 0.92, 1.1, 1],
                  boxShadow: [
                    "0 0 10px rgba(255,102,0,0.5)",
                    "0 0 28px rgba(255,80,0,0.85)",
                    "0 0 16px rgba(255,140,0,0.6)",
                    "0 0 22px rgba(255,60,0,0.7)",
                    `0 0 10px ${catStyle.ring}`,
                  ],
                }
              : { boxShadow: `0 0 10px ${catStyle.ring}` }
            }
            transition={isJustWon || isHypeActive
              ? { duration: isJustWon ? 3.5 : 2.5, ease: "easeOut" }
              : { duration: 0.4 }
            }
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: catStyle.bg }}
          >
            <SportIcon className="h-5 w-5" style={{ color: catStyle.color }} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold leading-tight truncate text-foreground">{bet.match_name}</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {bet.provider}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {bet.member_name}
                  </span>
                  {bet.action_type && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="flex items-center gap-1">
                        <ActionIcon className="h-3 w-3" />
                        {bet.action_type}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isJustWon && <FireIcon size={18} />}
                <StatusBadge status={status} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 space-y-3">

        {/* Tip text */}
        {bet.tip && (
          <p className="text-sm leading-relaxed text-foreground/85">{bet.tip}</p>
        )}

        {/* Sport details grid */}
        {showBettingDetails && (
          <div
            className="rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-3"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              backdropFilter: "blur(8px)",
            }}
          >
            {bet.bet_type && (
              <div className="flex items-center gap-2">
                <BetTypeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Wett-Typ</p>
                  <p className="font-semibold text-xs">{bet.bet_type}</p>
                </div>
              </div>
            )}
            {bet.sport && (
              <div className="flex items-center gap-2">
                <SportIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Sport</p>
                  <p className="font-semibold text-xs">{bet.sport}</p>
                </div>
              </div>
            )}
            {hasOdds && (
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">Quote</p>
                  <div className="flex items-center gap-1.5">
                    <p className="font-mono font-black text-sm" style={{ color: "#FFD700" }}>
                      {formatOdds(bet.odds!)}
                    </p>
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
                  <p className="font-semibold text-xs">{formatCurrency(bet.stake!)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Casino chips */}
        {isCasino && (bet.sport || bet.bet_type) && (
          <div className="flex flex-wrap gap-1.5">
            {bet.sport && (
              <span
                className="text-[11px] rounded-full px-2.5 py-0.5 font-medium"
                style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}
              >
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

        {/* Dalhoff */}
        {dalhoff && dConfig && (
          <div
            className="rounded-xl px-3 py-2.5"
            style={{ background: dConfig.bg, border: `1px solid ${dConfig.border}` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: dConfig.color }}>
                <dConfig.Icon className="h-3.5 w-3.5" />
                {dalhoff.label}
              </span>
              <span className="text-xs font-mono font-black" style={{ color: dConfig.color }}>
                {dalhoff.margin >= 0 ? "+" : ""}{dalhoff.marginPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{dalhoff.description}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col gap-1.5 pt-1">
          {/* Date + Votes row */}
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
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => vote("up")}
                disabled={!voterId}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors"
                style={myVote === "up"
                  ? { background: "rgba(26,140,46,0.20)", color: "#4ade80", fontWeight: 600 }
                  : { color: "var(--muted-foreground)" }
                }
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span className="font-mono">{upvotes}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => vote("down")}
                disabled={!voterId}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors"
                style={myVote === "down"
                  ? { background: "rgba(212,32,32,0.20)", color: "#f87171", fontWeight: 600 }
                  : { color: "var(--muted-foreground)" }
                }
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span className="font-mono">{downvotes}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.82 }}
                onClick={hype}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                style={isHypeActive
                  ? { background: "rgba(255,102,0,0.25)", color: "#ff8800", border: "1px solid rgba(255,102,0,0.45)" }
                  : { background: "rgba(255,102,0,0.10)", color: "#ff7722", border: "1px solid rgba(255,102,0,0.20)" }
                }
              >
                <Flame className="h-3.5 w-3.5" />
                Anfeuern
              </motion.button>
            </div>
          </div>

          {/* Status action buttons */}
          {!isAction && status === "pending" && (
            <div className="flex items-center gap-2 mt-0.5">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => updateStatus("won")}
                  className="w-full h-8 text-xs gap-1.5 rounded-xl font-bold"
                  style={{
                    background: "rgba(26,140,46,0.15)",
                    border: "1px solid rgba(26,140,46,0.35)",
                    color: "#4ade80",
                  }}
                >
                  <Check className="h-3.5 w-3.5" /> Gewonnen
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="flex-1">
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={isUpdating}
                  onClick={() => updateStatus("lost")}
                  className="w-full h-8 text-xs gap-1.5 rounded-xl font-bold"
                  style={{
                    background: "rgba(212,32,32,0.15)",
                    border: "1px solid rgba(212,32,32,0.35)",
                    color: "#f87171",
                  }}
                >
                  <X className="h-3.5 w-3.5" /> Verloren
                </Button>
              </motion.div>
            </div>
          )}

          {!isAction && status !== "pending" && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <Button
                size="xs"
                variant="ghost"
                disabled={isUpdating}
                onClick={() => updateStatus("pending")}
                className="h-7 px-2 text-xs text-muted-foreground gap-1 rounded-full hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>
          )}
        </div>

        {/* Comments */}
        <BetCommentSection betId={bet.id} />
      </div>
    </motion.div>
  )
}
