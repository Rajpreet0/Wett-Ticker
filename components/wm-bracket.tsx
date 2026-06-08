"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Swords, GitBranch, ChevronDown, ChevronUp, RefreshCw, X, TrendingUp, Loader2 } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiGame {
  _id: string
  id: string
  home_team_id: string
  away_team_id: string
  home_score: string
  away_score: string
  home_team_name_en: string
  away_team_name_en: string
  home_team_label?: string
  away_team_label?: string
  group?: string
  matchday?: string
  local_date: string
  finished: string
  type: "group" | "R32" | "R16" | "QF" | "SF" | "3RD" | "FINAL"
}

interface ApiResponse {
  games: ApiGame[]
}

// ─── Flags & Abbreviations ────────────────────────────────────────────────────

const FLAG: Record<string, string> = {
  Mexico: "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czech Republic": "🇨🇿",
  Canada: "🇨🇦", "Bosnia and Herzegovina": "🇧🇦", Qatar: "🇶🇦", Switzerland: "🇨🇭",
  Brazil: "🇧🇷", Morocco: "🇲🇦", Haiti: "🇭🇹", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "United States": "🇺🇸", Paraguay: "🇵🇾", Australia: "🇦🇺", Turkey: "🇹🇷",
  Germany: "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", Ecuador: "🇪🇨",
  Netherlands: "🇳🇱", Japan: "🇯🇵", Sweden: "🇸🇪", Tunisia: "🇹🇳",
  Belgium: "🇧🇪", Egypt: "🇪🇬", Iran: "🇮🇷", "New Zealand": "🇳🇿",
  Spain: "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", Uruguay: "🇺🇾",
  France: "🇫🇷", Senegal: "🇸🇳", Iraq: "🇮🇶", Norway: "🇳🇴",
  Argentina: "🇦🇷", Algeria: "🇩🇿", Austria: "🇦🇹", Jordan: "🇯🇴",
  Portugal: "🇵🇹", "Democratic Republic of the Congo": "🇨🇩", Uzbekistan: "🇺🇿", Colombia: "🇨🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croatia: "🇭🇷", Ghana: "🇬🇭", Panama: "🇵🇦",
}

const SHORT: Record<string, string> = {
  "Bosnia and Herzegovina": "Bosnien", "Czech Republic": "Tschechien",
  "South Africa": "S. Afrika", "South Korea": "S. Korea",
  "New Zealand": "N. Seeland", "Saudi Arabia": "S. Arabien",
  "Ivory Coast": "Elfenbeinküste", "Democratic Republic of the Congo": "DR Kongo",
  "Cape Verde": "Kap Verde", "United States": "USA",
}

function short(name: string) { return SHORT[name] ?? name }
function flag(name: string) { return FLAG[name] ?? "🏳" }

// ─── Data fetching hook ───────────────────────────────────────────────────────

function useGames() {
  const [games, setGames] = useState<ApiGame[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  async function load() {
    setError(false)
    setLoading(true)
    try {
      const res = await fetch("/api/wm-games")
      if (!res.ok) throw new Error()
      const json: ApiResponse = await res.json()
      setGames(json.games)
      setLastFetch(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  return { games, loading, error, refresh: load, lastFetch }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDate(local_date: string) {
  // format: "06/11/2026 13:00"
  const [datePart] = local_date.split(" ")
  const [month, day] = datePart.split("/")
  return `${day}.${month}`
}

function teamName(g: ApiGame, side: "home" | "away") {
  return side === "home"
    ? g.home_team_name_en || g.home_team_label || "?"
    : g.away_team_name_en || g.away_team_label || "?"
}

const KO_META: Record<string, { label: string; color: string; order: number }> = {
  R32:   { label: "Runde der letzten 32", color: "#60a5fa", order: 1 },
  R16:   { label: "Achtelfinale",         color: "#a78bfa", order: 2 },
  QF:    { label: "Viertelfinale",        color: "#f472b6", order: 3 },
  SF:    { label: "Halbfinale",           color: "#fb923c", order: 4 },
  "3RD": { label: "Spiel um Platz 3",    color: "#94a3b8", order: 5 },
  FINAL: { label: "Finale",              color: "#FFD700", order: 6 },
}

// ─── Odds Popup ───────────────────────────────────────────────────────────────

interface OddsBookmaker { name: string; home: string | null; draw: string | null; away: string | null }
interface OddsData { bookmakers: OddsBookmaker[]; fixture_id: number | null; cached?: boolean; stale?: boolean }

function OddsPopup({ game, onClose }: { game: ApiGame; onClose: () => void }) {
  const [odds, setOdds] = useState<OddsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const home = teamName(game, "home")
  const away = teamName(game, "away")
  const done = game.finished === "TRUE"

  useEffect(() => {
    const params = new URLSearchParams({
      game_id: game.id,
      home,
      away,
    })
    fetch(`/api/wm-odds?${params}`)
      .then(r => r.json())
      .then(d => { setOdds(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [game.id])

  // Close on backdrop click
  const onBackdrop = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onBackdrop}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg, oklch(0.15 0.03 240) 0%, oklch(0.11 0.025 240) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: "#4ade80" }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4ade80" }}>Wettquoten</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Match info */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl">{flag(home)}</span>
              <span className="text-sm font-bold truncate">{short(home)}</span>
            </div>
            {done ? (
              <span className="text-sm font-black font-mono px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                {game.home_score} : {game.away_score}
              </span>
            ) : (
              <div className="text-center shrink-0">
                <div className="text-[10px] text-muted-foreground font-mono">{parseDate(game.local_date)}</div>
                <div className="text-xs font-bold text-muted-foreground/60">vs</div>
              </div>
            )}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-sm font-bold truncate text-right">{short(away)}</span>
              <span className="text-xl">{flag(away)}</span>
            </div>
          </div>
          {game.group && (
            <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">
              Gruppe {game.group} · Spieltag {game.matchday}
            </p>
          )}
        </div>

        {/* Odds body */}
        <div className="px-4 py-3">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground/60 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              Quoten werden geladen…
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-red-400/70 py-6">Quoten nicht verfügbar</p>
          )}

          {!loading && !error && odds && odds.bookmakers.length === 0 && (
            <p className="text-center text-xs text-muted-foreground/50 py-6 italic">
              Noch keine Quoten verfügbar
            </p>
          )}

          {!loading && !error && odds && odds.bookmakers.length > 0 && (
            <div className="space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-4 gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-1">
                <span>Anbieter</span>
                <span className="text-center">1</span>
                <span className="text-center">X</span>
                <span className="text-center">2</span>
              </div>
              {odds.bookmakers.map(bm => (
                <div
                  key={bm.name}
                  className="grid grid-cols-4 gap-1 items-center rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <span className="text-[11px] font-semibold text-foreground/80 truncate">{bm.name}</span>
                  {[bm.home, bm.draw, bm.away].map((val, i) => (
                    <span
                      key={i}
                      className="text-center text-xs font-black rounded-lg py-1"
                      style={{
                        color: val ? "#f8fafc" : "#475569",
                        background: val ? "rgba(74,222,128,0.12)" : "transparent",
                      }}
                    >
                      {val ?? "–"}
                    </span>
                  ))}
                </div>
              ))}
              {odds.stale && (
                <p className="text-[10px] text-muted-foreground/40 text-center pt-1">Quoten möglicherweise veraltet</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBadge({ home, away, finished }: { home: string; away: string; finished: string }) {
  const done = finished === "TRUE"
  const h = parseInt(home)
  const a = parseInt(away)
  const draw = h === a

  if (!done) return <span className="text-[10px] font-mono text-muted-foreground/40">–:–</span>

  return (
    <span
      className="text-[11px] font-black font-mono px-1.5 py-0.5 rounded-md"
      style={{ background: "rgba(255,255,255,0.08)", color: done ? "#fff" : "#64748b" }}
    >
      <span style={{ color: !draw && h > a ? "#4ade80" : undefined }}>{home}</span>
      <span className="text-muted-foreground mx-0.5">:</span>
      <span style={{ color: !draw && a > h ? "#4ade80" : undefined }}>{away}</span>
    </span>
  )
}

function GroupCard({ groupId, games, onSelectGame }: { groupId: string; games: ApiGame[]; onSelectGame: (g: ApiGame) => void }) {
  const [open, setOpen] = useState(false)
  const teams = [...new Set(games.flatMap(g => [
    g.home_team_name_en, g.away_team_name_en,
  ]))].slice(0, 4)

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.13 0.028 240) 0%, oklch(0.10 0.022 240) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTopWidth: "2px",
        borderTopColor: "rgba(26,140,46,0.50)",
      }}
    >
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-black leading-none" style={{ color: "#4ade80" }}>
            {groupId}
          </span>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#4a5a7a" }}
          >
            Spiele {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        <div className="space-y-1">
          {teams.map(team => (
            <div key={team} className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{flag(team)}</span>
              <span className="text-[11px] font-medium text-foreground/80 truncate leading-none">{short(team)}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div
              className="mx-3 mb-3 rounded-xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {games.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => onSelectGame(g)}
                  className="w-full flex items-center gap-1 px-2 py-1.5 text-[10px] transition-colors hover:bg-white/5 active:bg-white/10"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
                >
                  <span className="font-mono text-muted-foreground w-8 shrink-0">{parseDate(g.local_date)}</span>
                  <span className="shrink-0">{flag(g.home_team_name_en)}</span>
                  <span className="truncate text-foreground/75 flex-1 text-left">{short(g.home_team_name_en)}</span>
                  <ScoreBadge home={g.home_score} away={g.away_score} finished={g.finished} />
                  <span className="truncate text-foreground/75 flex-1 text-right">{short(g.away_team_name_en)}</span>
                  <span className="shrink-0">{flag(g.away_team_name_en)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── KO List view ─────────────────────────────────────────────────────────────

function KOMatchRow({ g, onSelectGame }: { g: ApiGame; onSelectGame: (g: ApiGame) => void }) {
  const home = teamName(g, "home")
  const away = teamName(g, "away")
  const done = g.finished === "TRUE"
  return (
    <button
      onClick={() => onSelectGame(g)}
      className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5 active:bg-white/10"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <span className="font-mono text-[10px] text-muted-foreground/50 w-8 shrink-0">{parseDate(g.local_date)}</span>
      <span className="shrink-0 text-sm">{flag(home)}</span>
      <span className={`text-xs flex-1 truncate text-left ${done ? "text-foreground/90" : "text-muted-foreground/60 italic"}`}>
        {short(home)}
      </span>
      <ScoreBadge home={g.home_score} away={g.away_score} finished={g.finished} />
      <span className={`text-xs flex-1 text-right truncate ${done ? "text-foreground/90" : "text-muted-foreground/60 italic"}`}>
        {short(away)}
      </span>
      <span className="shrink-0 text-sm">{flag(away)}</span>
    </button>
  )
}

function KORound({ type, games, onSelectGame }: { type: string; games: ApiGame[]; onSelectGame: (g: ApiGame) => void }) {
  const meta = KO_META[type] ?? { label: type, color: "#888", order: 9 }
  const [open, setOpen] = useState(type === "FINAL" || type === "SF")

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.13 0.028 240) 0%, oklch(0.10 0.022 240) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeftWidth: "3px",
        borderLeftColor: meta.color,
      }}
    >
      <button className="w-full flex items-center justify-between px-4 py-3" onClick={() => setOpen(v => !v)}>
        <div>
          <p className="font-bold text-sm text-left" style={{ color: meta.color }}>{meta.label}</p>
          <p className="text-[10px] text-muted-foreground/60 text-left">
            {games.length} {games.length === 1 ? "Spiel" : "Spiele"}
            {games.some(g => g.finished === "TRUE") && (
              <span className="ml-1.5 text-green-400/70">• Ergebnisse verfügbar</span>
            )}
          </p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1.5">
              {games.length > 0
                ? games.map(g => <KOMatchRow key={g.id} g={g} onSelectGame={onSelectGame} />)
                : Array.from({ length: KO_META[type] ? 0 : 1 }).map((_, i) => (
                  <div key={i} className="text-xs text-muted-foreground/40 italic px-2 py-2">noch offen</div>
                ))
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Tree/Bracket view ────────────────────────────────────────────────────────

function BracketMatchBox({
  g,
  color,
  compact = false,
}: {
  g: ApiGame | null
  color: string
  compact?: boolean
}) {
  const home = g ? teamName(g, "home") : null
  const away = g ? teamName(g, "away") : null
  const done = g?.finished === "TRUE"
  const hScore = g ? parseInt(g.home_score) : null
  const aScore = g ? parseInt(g.away_score) : null

  return (
    <div
      className="rounded-xl overflow-hidden shrink-0"
      style={{
        width: compact ? 130 : 150,
        background: "oklch(0.12 0.025 240)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderLeftWidth: 3,
        borderLeftColor: color,
      }}
    >
      {[
        { name: home, score: hScore, opponentScore: aScore },
        { name: away, score: aScore, opponentScore: hScore },
      ].map(({ name, score, opponentScore }, i) => {
        const won = done && score !== null && opponentScore !== null && score > opponentScore
        return (
          <div
            key={i}
            className="flex items-center gap-1 px-2 py-1"
            style={{
              borderTop: i > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined,
              background: won ? "rgba(74,222,128,0.07)" : undefined,
            }}
          >
            <span className="text-sm shrink-0">{name ? flag(name) : "🏳"}</span>
            <span
              className="text-[10px] flex-1 truncate leading-tight"
              style={{ color: won ? "#4ade80" : name ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)" }}
            >
              {name ? short(name) : "?"}
            </span>
            {done && score !== null && (
              <span
                className="text-[11px] font-black font-mono ml-auto shrink-0"
                style={{ color: won ? "#4ade80" : "rgba(255,255,255,0.5)" }}
              >
                {score}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function BracketConnector({ count }: { count: number }) {
  return (
    <div className="flex flex-col justify-around" style={{ width: 20, height: count * 70 }}>
      {Array.from({ length: count / 2 }).map((_, i) => (
        <div key={i} className="flex flex-col items-start" style={{ height: 140 }}>
          <div style={{ height: "50%", width: 10, borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
          <div style={{ height: "50%", width: 10, borderRight: "1px solid rgba(255,255,255,0.12)", borderTop: "1px solid rgba(255,255,255,0.12)" }} />
        </div>
      ))}
    </div>
  )
}

const KO_ORDER = ["R32", "R16", "QF", "SF", "FINAL"]

function BracketTreeView({ koGames }: { koGames: ApiGame[] }) {
  const byType: Record<string, ApiGame[]> = {}
  for (const g of koGames) {
    if (!byType[g.type]) byType[g.type] = []
    byType[g.type].push(g)
  }

  // Determine which rounds actually have games
  const rounds = KO_ORDER.filter(t => byType[t]?.length)

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-stretch gap-0" style={{ minWidth: rounds.length * 180 }}>
        {rounds.map((type, ri) => {
          const meta = KO_META[type]
          const games = byType[type] ?? []
          const isLast = ri === rounds.length - 1

          return (
            <div key={type} className="flex items-stretch">
              {/* Round column */}
              <div className="flex flex-col" style={{ minWidth: 155 }}>
                {/* Column header */}
                <div className="text-center mb-2 px-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>

                {/* Match boxes, vertically centered */}
                <div
                  className="flex flex-col justify-around flex-1"
                  style={{ gap: 8, paddingTop: games.length > 1 ? 35 / games.length : 0 }}
                >
                  {games.map(g => (
                    <BracketMatchBox key={g.id} g={g} color={meta.color} />
                  ))}
                </div>
              </div>

              {/* Connector to next round */}
              {!isLast && games.length > 1 && (
                <div className="self-center" style={{ paddingTop: 24 }}>
                  <BracketConnector count={games.length} />
                </div>
              )}
              {!isLast && games.length <= 1 && (
                <div style={{ width: 20 }} />
              )}
            </div>
          )
        })}
      </div>
      <p className="text-center text-[10px] text-muted-foreground/30 mt-4">
        ← scrollbar wenn nötig · Baumansicht der K.O.-Phase
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WmBracket() {
  const { games, loading, error, refresh, lastFetch } = useGames()
  const [view, setView] = useState<"groups" | "ko" | "tree">("groups")
  const [selectedGame, setSelectedGame] = useState<ApiGame | null>(null)

  const groupGames = games.filter(g => g.type === "group")
  const koGames = games.filter(g => g.type !== "group")

  // Build group map
  const groupMap: Record<string, ApiGame[]> = {}
  for (const g of groupGames) {
    if (!g.group) continue
    if (!groupMap[g.group]) groupMap[g.group] = []
    groupMap[g.group].push(g)
  }
  const groupIds = Object.keys(groupMap).sort()

  // Build KO map by type
  const koByType: Record<string, ApiGame[]> = {}
  for (const g of koGames) {
    if (!koByType[g.type]) koByType[g.type] = []
    koByType[g.type].push(g)
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selectedGame && (
          <OddsPopup game={selectedGame} onClose={() => setSelectedGame(null)} />
        )}
      </AnimatePresence>
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div />
        <button
          onClick={() => refresh()}
          disabled={loading}
          className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-all"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: loading ? "#64748b" : "#94a3b8",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          {lastFetch ? `Aktualisiert ${lastFetch.toLocaleTimeString("de", { hour: "2-digit", minute: "2-digit" })}` : "Laden…"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="text-center text-xs py-3 rounded-xl"
          style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          API nicht erreichbar – Daten möglicherweise veraltet
        </div>
      )}

      {/* View switcher */}
      <div
        className="flex rounded-xl p-0.5"
        style={{ background: "rgba(13,26,36,0.82)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <button
          onClick={() => setView("groups")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={view === "groups"
            ? { background: "rgba(26,140,46,0.22)", color: "#4ade80", border: "1px solid rgba(26,140,46,0.38)" }
            : { color: "#4a5a7a" }}
        >
          <Users className="h-3.5 w-3.5" />
          Gruppen
        </button>
        <button
          onClick={() => setView("ko")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={view === "ko"
            ? { background: "rgba(26,140,46,0.22)", color: "#4ade80", border: "1px solid rgba(26,140,46,0.38)" }
            : { color: "#4a5a7a" }}
        >
          <Swords className="h-3.5 w-3.5" />
          K.O.-Liste
        </button>
        <button
          onClick={() => setView("tree")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={view === "tree"
            ? { background: "rgba(26,140,46,0.22)", color: "#4ade80", border: "1px solid rgba(26,140,46,0.38)" }
            : { color: "#4a5a7a" }}
        >
          <GitBranch className="h-3.5 w-3.5" />
          Baum
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <AnimatePresence mode="wait">
          {view === "groups" && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {groupIds.map(id => (
                  <GroupCard key={id} groupId={id} games={groupMap[id]} onSelectGame={setSelectedGame} />
                ))}
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-3 pb-1">
                12 Gruppen · 48 Teams · Gruppenphase 11.–27. Juni
              </p>
            </motion.div>
          )}

          {view === "ko" && (
            <motion.div
              key="ko"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-2"
            >
              {KO_ORDER.filter(t => koByType[t]).map(type => (
                <KORound key={type} type={type} games={koByType[type] ?? []} onSelectGame={setSelectedGame} />
              ))}
              {KO_ORDER.filter(t => !koByType[t]).map(type => (
                <KORound key={type} type={type} games={[]} onSelectGame={setSelectedGame} />
              ))}
              <p className="text-center text-[10px] text-muted-foreground/40 mt-1 pb-1">
                32 Mannschaften · K.O.-Phase ab 1. Juli
              </p>
            </motion.div>
          )}

          {view === "tree" && (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {koGames.length === 0 ? (
                <div
                  className="text-center py-12 rounded-2xl text-sm text-muted-foreground/50"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  Die K.O.-Phase beginnt am 1. Juli – Baumansicht dann verfügbar
                </div>
              ) : (
                <BracketTreeView koGames={koGames} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
