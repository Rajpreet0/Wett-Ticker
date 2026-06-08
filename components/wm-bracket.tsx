"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Swords, ChevronDown, ChevronUp } from "lucide-react"

const FLAG: Record<string, string> = {
  Mexico: "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷", "Czech Republic": "🇨🇿",
  Canada: "🇨🇦", "Bosnia & Herzegovina": "🇧🇦", Qatar: "🇶🇦", Switzerland: "🇨🇭",
  Brazil: "🇧🇷", Morocco: "🇲🇦", Haiti: "🇭🇹", Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA: "🇺🇸", Paraguay: "🇵🇾", Australia: "🇦🇺", Turkey: "🇹🇷",
  Germany: "🇩🇪", "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", Ecuador: "🇪🇨",
  Netherlands: "🇳🇱", Japan: "🇯🇵", Sweden: "🇸🇪", Tunisia: "🇹🇳",
  Belgium: "🇧🇪", Egypt: "🇪🇬", Iran: "🇮🇷", "New Zealand": "🇳🇿",
  Spain: "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦", Uruguay: "🇺🇾",
  France: "🇫🇷", Senegal: "🇸🇳", Iraq: "🇮🇶", Norway: "🇳🇴",
  Argentina: "🇦🇷", Algeria: "🇩🇿", Austria: "🇦🇹", Jordan: "🇯🇴",
  Portugal: "🇵🇹", "DR Congo": "🇨🇩", Uzbekistan: "🇺🇿", Colombia: "🇨🇴",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", Croatia: "🇭🇷", Ghana: "🇬🇭", Panama: "🇵🇦",
}

const SHORT: Record<string, string> = {
  "Bosnia & Herzegovina": "Bosnien",
  "Czech Republic": "Tschechien",
  "South Africa": "S. Afrika",
  "South Korea": "S. Korea",
  "New Zealand": "N. Zealand",
  "Saudi Arabia": "S. Arabien",
  "Ivory Coast": "Elfenbein",
  "DR Congo": "DR Kongo",
  "Cape Verde": "Kap Verde",
}

function short(name: string) {
  return SHORT[name] ?? name
}

interface Match { date: string; home: string; away: string }
interface Group { id: string; teams: string[]; matches: Match[] }

const GROUPS: Group[] = [
  {
    id: "A", teams: ["Mexico", "South Africa", "South Korea", "Czech Republic"],
    matches: [
      { date: "11.06", home: "Mexico", away: "South Africa" },
      { date: "11.06", home: "South Korea", away: "Czech Republic" },
      { date: "18.06", home: "Czech Republic", away: "South Africa" },
      { date: "18.06", home: "Mexico", away: "South Korea" },
      { date: "24.06", home: "Czech Republic", away: "Mexico" },
      { date: "24.06", home: "South Africa", away: "South Korea" },
    ],
  },
  {
    id: "B", teams: ["Canada", "Bosnia & Herzegovina", "Qatar", "Switzerland"],
    matches: [
      { date: "12.06", home: "Canada", away: "Bosnia & Herzegovina" },
      { date: "13.06", home: "Qatar", away: "Switzerland" },
      { date: "18.06", home: "Switzerland", away: "Bosnia & Herzegovina" },
      { date: "18.06", home: "Canada", away: "Qatar" },
      { date: "24.06", home: "Switzerland", away: "Canada" },
      { date: "24.06", home: "Bosnia & Herzegovina", away: "Qatar" },
    ],
  },
  {
    id: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"],
    matches: [
      { date: "13.06", home: "Brazil", away: "Morocco" },
      { date: "13.06", home: "Haiti", away: "Scotland" },
      { date: "19.06", home: "Scotland", away: "Morocco" },
      { date: "19.06", home: "Brazil", away: "Haiti" },
      { date: "24.06", home: "Scotland", away: "Brazil" },
      { date: "24.06", home: "Morocco", away: "Haiti" },
    ],
  },
  {
    id: "D", teams: ["USA", "Paraguay", "Australia", "Turkey"],
    matches: [
      { date: "12.06", home: "USA", away: "Paraguay" },
      { date: "13.06", home: "Australia", away: "Turkey" },
      { date: "19.06", home: "USA", away: "Australia" },
      { date: "19.06", home: "Turkey", away: "Paraguay" },
      { date: "25.06", home: "Turkey", away: "USA" },
      { date: "25.06", home: "Paraguay", away: "Australia" },
    ],
  },
  {
    id: "E", teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
    matches: [
      { date: "14.06", home: "Germany", away: "Curaçao" },
      { date: "14.06", home: "Ivory Coast", away: "Ecuador" },
      { date: "20.06", home: "Germany", away: "Ivory Coast" },
      { date: "20.06", home: "Ecuador", away: "Curaçao" },
      { date: "25.06", home: "Curaçao", away: "Ivory Coast" },
      { date: "25.06", home: "Ecuador", away: "Germany" },
    ],
  },
  {
    id: "F", teams: ["Netherlands", "Japan", "Sweden", "Tunisia"],
    matches: [
      { date: "14.06", home: "Netherlands", away: "Japan" },
      { date: "14.06", home: "Sweden", away: "Tunisia" },
      { date: "20.06", home: "Netherlands", away: "Sweden" },
      { date: "20.06", home: "Tunisia", away: "Japan" },
      { date: "25.06", home: "Japan", away: "Sweden" },
      { date: "25.06", home: "Tunisia", away: "Netherlands" },
    ],
  },
  {
    id: "G", teams: ["Belgium", "Egypt", "Iran", "New Zealand"],
    matches: [
      { date: "15.06", home: "Belgium", away: "Egypt" },
      { date: "15.06", home: "Iran", away: "New Zealand" },
      { date: "21.06", home: "Belgium", away: "Iran" },
      { date: "21.06", home: "New Zealand", away: "Egypt" },
      { date: "26.06", home: "Egypt", away: "Iran" },
      { date: "26.06", home: "New Zealand", away: "Belgium" },
    ],
  },
  {
    id: "H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
    matches: [
      { date: "15.06", home: "Spain", away: "Cape Verde" },
      { date: "15.06", home: "Saudi Arabia", away: "Uruguay" },
      { date: "21.06", home: "Spain", away: "Saudi Arabia" },
      { date: "21.06", home: "Uruguay", away: "Cape Verde" },
      { date: "26.06", home: "Cape Verde", away: "Saudi Arabia" },
      { date: "26.06", home: "Uruguay", away: "Spain" },
    ],
  },
  {
    id: "I", teams: ["France", "Senegal", "Iraq", "Norway"],
    matches: [
      { date: "16.06", home: "France", away: "Senegal" },
      { date: "16.06", home: "Iraq", away: "Norway" },
      { date: "22.06", home: "France", away: "Iraq" },
      { date: "22.06", home: "Norway", away: "Senegal" },
      { date: "26.06", home: "Norway", away: "France" },
      { date: "26.06", home: "Senegal", away: "Iraq" },
    ],
  },
  {
    id: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"],
    matches: [
      { date: "16.06", home: "Argentina", away: "Algeria" },
      { date: "16.06", home: "Austria", away: "Jordan" },
      { date: "22.06", home: "Argentina", away: "Austria" },
      { date: "22.06", home: "Jordan", away: "Algeria" },
      { date: "27.06", home: "Algeria", away: "Austria" },
      { date: "27.06", home: "Jordan", away: "Argentina" },
    ],
  },
  {
    id: "K", teams: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
    matches: [
      { date: "17.06", home: "Portugal", away: "DR Congo" },
      { date: "17.06", home: "Uzbekistan", away: "Colombia" },
      { date: "23.06", home: "Portugal", away: "Uzbekistan" },
      { date: "23.06", home: "Colombia", away: "DR Congo" },
      { date: "27.06", home: "Colombia", away: "Portugal" },
      { date: "27.06", home: "DR Congo", away: "Uzbekistan" },
    ],
  },
  {
    id: "L", teams: ["England", "Croatia", "Ghana", "Panama"],
    matches: [
      { date: "17.06", home: "England", away: "Croatia" },
      { date: "17.06", home: "Ghana", away: "Panama" },
      { date: "23.06", home: "England", away: "Ghana" },
      { date: "23.06", home: "Panama", away: "Croatia" },
      { date: "27.06", home: "Panama", away: "England" },
      { date: "27.06", home: "Croatia", away: "Ghana" },
    ],
  },
]

const KO_ROUNDS = [
  { name: "Runde der letzten 32", date: "1.–7. Juli", matchCount: 16, color: "#60a5fa" },
  { name: "Achtelfinale", date: "9.–13. Juli", matchCount: 8, color: "#a78bfa" },
  { name: "Viertelfinale", date: "15.–18. Juli", matchCount: 4, color: "#f472b6" },
  { name: "Halbfinale", date: "22.–23. Juli", matchCount: 2, color: "#fb923c" },
  { name: "Spiel um Platz 3", date: "26. Juli", matchCount: 1, color: "#94a3b8" },
  { name: "Finale", date: "27. Juli", matchCount: 1, color: "#FFD700" },
]

function GroupCard({ group }: { group: Group }) {
  const [open, setOpen] = useState(false)
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
      {/* Group header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-2xl font-black leading-none"
            style={{ color: "#4ade80" }}
          >
            {group.id}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "#4a5a7a" }}
          >
            Spiele
            {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Teams */}
        <div className="space-y-1">
          {group.teams.map((team) => (
            <div key={team} className="flex items-center gap-1.5">
              <span className="text-sm leading-none">{FLAG[team] ?? "🏳"}</span>
              <span className="text-[11px] font-medium text-foreground/80 truncate leading-none">{team}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expandable match list */}
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
              {group.matches.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1.5 text-[10px]"
                  style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,0.05)" : undefined }}
                >
                  <span className="font-mono text-muted-foreground w-8 shrink-0">{m.date}</span>
                  <span className="shrink-0">{FLAG[m.home] ?? "🏳"}</span>
                  <span className="truncate text-foreground/75 flex-1">{short(m.home)}</span>
                  <span className="text-muted-foreground font-bold shrink-0">–</span>
                  <span className="truncate text-foreground/75 flex-1 text-right">{short(m.away)}</span>
                  <span className="shrink-0">{FLAG[m.away] ?? "🏳"}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function KORound({ round }: { round: typeof KO_ROUNDS[number] }) {
  const [open, setOpen] = useState(round.name === "Finale")
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.13 0.028 240) 0%, oklch(0.10 0.022 240) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeftWidth: "3px",
        borderLeftColor: round.color,
      }}
    >
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold text-sm text-left" style={{ color: round.color }}>{round.name}</p>
            <p className="text-[10px] text-muted-foreground text-left">{round.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${round.color}20`, color: round.color }}
          >
            {round.matchCount} {round.matchCount === 1 ? "Spiel" : "Spiele"}
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
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
              {Array.from({ length: round.matchCount }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground/50 italic">noch offen</span>
                    <span className="text-xs font-bold text-muted-foreground/30">–</span>
                    <span className="text-xs text-muted-foreground/50 italic">noch offen</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WmBracket() {
  const [view, setView] = useState<"groups" | "ko">("groups")

  return (
    <div className="space-y-4">
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
            : { color: "#4a5a7a" }
          }
        >
          <Users className="h-3.5 w-3.5" />
          Gruppen
        </button>
        <button
          onClick={() => setView("ko")}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
          style={view === "ko"
            ? { background: "rgba(26,140,46,0.22)", color: "#4ade80", border: "1px solid rgba(26,140,46,0.38)" }
            : { color: "#4a5a7a" }
          }
        >
          <Swords className="h-3.5 w-3.5" />
          K.O.-Runde
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {view === "groups" ? (
          <motion.div
            key="groups"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="grid grid-cols-2 gap-2">
              {GROUPS.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground/40 mt-3 pb-1">
              12 Gruppen · 48 Teams · Gruppenphase 11.–27. Juni
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="ko"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-2"
          >
            {KO_ROUNDS.map((r) => (
              <KORound key={r.name} round={r} />
            ))}
            <p className="text-center text-[10px] text-muted-foreground/40 mt-1 pb-1">
              32 Mannschaften · K.O.-Phase ab 1. Juli
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
