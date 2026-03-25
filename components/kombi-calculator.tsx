"use client"

import { useState } from "react"
import { Plus, Trash2, TrendingUp, Euro, Calculator, Flame, CheckCircle2, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, calculateDalhoff } from "@/lib/calculations"

// ── Kombi Calculator ──────────────────────────────────────────────────────────

interface Leg { id: string; label: string; odds: string }
function uid() { return Math.random().toString(36).slice(2) }

function KombiSection() {
  const [legs, setLegs] = useState<Leg[]>([
    { id: uid(), label: "", odds: "" },
    { id: uid(), label: "", odds: "" },
  ])
  const [stake, setStake] = useState("")

  function addLeg() { if (legs.length < 10) setLegs((p) => [...p, { id: uid(), label: "", odds: "" }]) }
  function removeLeg(id: string) { if (legs.length > 1) setLegs((p) => p.filter((l) => l.id !== id)) }
  function updateLeg(id: string, f: "label" | "odds", v: string) {
    setLegs((p) => p.map((l) => (l.id === id ? { ...l, [f]: v } : l)))
  }

  const parsed = legs.map((l) => ({ ...l, num: parseFloat(l.odds.replace(",", ".")) }))
  const valid  = parsed.filter((l) => !isNaN(l.num) && l.num >= 1.01)
  const combined   = valid.length > 0 ? valid.reduce((p, l) => p * l.num, 1) : null
  const parsedStake = parseFloat(stake.replace(",", "."))
  const payout = combined != null && !isNaN(parsedStake) && parsedStake > 0 ? parsedStake * combined : null
  const profit = payout != null ? payout - parsedStake : null
  const impliedProb = valid.length > 0 ? valid.reduce((p, l) => p * (1 / l.num), 1) * 100 : null

  return (
    <div className="space-y-3">
      <div className="space-y-2.5">
        {legs.map((leg, idx) => {
          const num = parseFloat(leg.odds.replace(",", "."))
          const isValid = !isNaN(num) && num >= 1.01
          const implP = isValid ? (1 / num) * 100 : null
          return (
            <div key={leg.id} className="flex items-center gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <input
                value={leg.label}
                onChange={(e) => updateLeg(leg.id, "label", e.target.value)}
                placeholder={`Tipp ${idx + 1}`}
                className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
              />
              <div className="relative shrink-0 w-20">
                <input
                  value={leg.odds}
                  onChange={(e) => updateLeg(leg.id, "odds", e.target.value)}
                  placeholder="Quote"
                  inputMode="decimal"
                  className={`w-full text-xs font-mono bg-muted/40 border rounded-full px-2.5 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                    isValid ? "border-green-500/30 text-green-400" : "border-border/40"
                  }`}
                />
                {isValid && implP != null && (
                  <span className="absolute -bottom-3.5 left-0 right-0 text-[9px] text-center text-muted-foreground">
                    {implP.toFixed(1)}%
                  </span>
                )}
              </div>
              <button
                onClick={() => removeLeg(leg.id)}
                disabled={legs.length <= 1}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={addLeg}
        disabled={legs.length >= 10}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 ml-7 mt-4"
      >
        <Plus className="h-3.5 w-3.5" />
        Tipp hinzufügen ({legs.length}/10)
      </button>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground shrink-0 flex items-center gap-1.5">
          <Euro className="h-3.5 w-3.5" /> Einsatz
        </label>
        <input
          value={stake}
          onChange={(e) => setStake(e.target.value)}
          placeholder="0.00"
          inputMode="decimal"
          className="flex-1 text-sm font-mono bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
        />
      </div>

      {valid.length >= 2 && (
        <Card className="rounded-2xl border-border/40 bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Kombi-Quote
              </span>
              <span className="font-mono font-bold text-lg">{combined!.toFixed(2)}</span>
            </div>
            {payout != null && (
              <div className="flex items-center justify-between rounded-xl bg-green-500/8 border border-green-500/15 px-3 py-2">
                <span className="text-xs text-muted-foreground">Möglicher Gewinn</span>
                <span className="font-mono font-bold text-green-400">{formatCurrency(payout)}</span>
              </div>
            )}
            {profit != null && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Reingewinn</span>
                <span className={`font-mono text-sm font-semibold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {profit >= 0 ? "+" : ""}{formatCurrency(profit)}
                </span>
              </div>
            )}
            {impliedProb != null && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Kombi-Wahrscheinlichkeit</span>
                <span className="font-mono text-xs text-muted-foreground">{impliedProb.toFixed(2)}%</span>
              </div>
            )}
            <div className="bg-muted/30 rounded-xl overflow-hidden mt-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">#</th>
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Tipp</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Quote</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">WS%</th>
                  </tr>
                </thead>
                <tbody>
                  {valid.map((leg, idx) => (
                    <tr key={leg.id} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-1.5 truncate max-w-[100px]">{leg.label || `Tipp ${idx + 1}`}</td>
                      <td className="px-3 py-1.5 text-right font-mono font-semibold">{leg.num.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                        {((1 / leg.num) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <ExplanationBox
        title="Was ist eine Kombi-Wette?"
        text="Du multiplizierst alle Quoten miteinander. Jeder Tipp muss gewinnen — daher sinkt die Wahrscheinlichkeit stark, aber die Quote steigt stark. Faustformel: Kombi-WS% = Produkt aller impliziten Einzelwahrscheinlichkeiten."
      />
    </div>
  )
}

// ── Dalhoff Section ───────────────────────────────────────────────────────────

const DALHOFF_CONFIG = {
  value:        { Icon: Flame,         color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"   },
  neutral:      { Icon: CheckCircle2,  color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"     },
  disadvantage: { Icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
}

function DalhoffSection() {
  const [quotes, setQuotes] = useState(["", "", ""])

  const parsed = quotes
    .map((q) => parseFloat(q.replace(",", ".")))
    .filter((q) => !isNaN(q) && q >= 1.01)

  const result = parsed.length >= 2 ? calculateDalhoff(parsed) : null
  const cfg = result ? DALHOFF_CONFIG[result.rating] : null

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Mind. 2 Quoten eingeben (z.B. Sieg / Unentschieden / Niederlage)</p>
      <div className="grid grid-cols-3 gap-2">
        {(["Sieg / Ja", "Unentschieden", "Niederlage / Nein"] as const).map((label, i) => (
          <div key={i}>
            <p className="text-[10px] text-muted-foreground mb-1">{label}</p>
            <input
              value={quotes[i]}
              onChange={(e) => setQuotes((p) => { const n = [...p]; n[i] = e.target.value; return n })}
              placeholder="1.80"
              inputMode="decimal"
              className="w-full text-sm font-mono bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
            />
          </div>
        ))}
      </div>

      {result && cfg && (
        <div className={`rounded-xl border px-4 py-3 space-y-2 ${cfg.bg}`}>
          <div className="flex items-center justify-between">
            <span className={`flex items-center gap-2 text-sm font-semibold ${cfg.color}`}>
              <cfg.Icon className="h-4 w-4" />
              {result.label}
            </span>
            <span className={`font-mono font-bold ${cfg.color}`}>
              {result.margin >= 0 ? "+" : ""}{result.marginPercent.toFixed(2)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{result.description}</p>
          <div className="flex gap-2 flex-wrap pt-1">
            {parsed.map((q, i) => (
              <span key={i} className="text-[11px] bg-black/20 rounded-full px-2.5 py-0.5 font-mono">
                {q.toFixed(2)} → {((1 / q) * 100).toFixed(1)}%
              </span>
            ))}
          </div>
        </div>
      )}

      <ExplanationBox
        title="Satz des Dalhoffs (Buchmacher-Marge)"
        text={`Formel: (1/Q₁ + 1/Q₂ + … + 1/Qₙ) − 1\n\nNegativ = du hast einen Vorteil (Value Bet). Positiv = Buchmacher hat einen Vorteil (Normalfall). Je höher der Wert, desto mehr verdient der Buchmacher langfristig an dir.`}
      />
    </div>
  )
}

// ── Implied Probability Section ───────────────────────────────────────────────

function ProbSection() {
  const [oddsInput, setOddsInput] = useState("")
  const num = parseFloat(oddsInput.replace(",", "."))
  const isValid = !isNaN(num) && num >= 1.01
  const impliedProb = isValid ? (1 / num) * 100 : null
  const fairOdds    = isValid ? (1 / (impliedProb! / 100)) : null

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Buchmacher-Quote eingeben</p>
        <input
          value={oddsInput}
          onChange={(e) => setOddsInput(e.target.value)}
          placeholder="2.50"
          inputMode="decimal"
          className="w-full text-xl font-mono bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
        />
      </div>

      {isValid && impliedProb != null && (
        <Card className="rounded-2xl border-border/40 bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Implizite Wahrscheinlichkeit</span>
              <span className="font-mono font-bold text-2xl text-primary">{impliedProb.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(impliedProb, 100)}%` }}
              />
            </div>
            {fairOdds != null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Faire Quote (ohne Marge)</span>
                <span className="font-mono text-foreground/80">{fairOdds.toFixed(2)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ExplanationBox
        title="Implizite Wahrscheinlichkeit"
        text={`Formel: 1 / Quote × 100\n\nEine Quote von 2.00 entspricht 50% impliziter Wahrscheinlichkeit. Der Buchmacher baut eine Marge ein, sodass die Summe aller Wahrscheinlichkeiten eines Spiels über 100% liegt — das ist sein Gewinn.`}
      />
    </div>
  )
}

// ── Shared Explanation Box ────────────────────────────────────────────────────

function ExplanationBox({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-border/40 bg-muted/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-left"
      >
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium">{title}</span>
      </button>
      {open && (
        <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
          {text}
        </p>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

type Tab = "kombi" | "dalhoff" | "prob"

const TABS: { id: Tab; label: string; icon: typeof Calculator }[] = [
  { id: "kombi",   label: "Kombi",         icon: Calculator },
  { id: "dalhoff", label: "Dalhoff-Marge", icon: TrendingUp },
  { id: "prob",    label: "Wahrscheinlichkeit", icon: TrendingUp },
]

export function KombiCalculator() {
  const [tab, setTab] = useState<Tab>("kombi")

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1.5 bg-muted/40 rounded-full p-1">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "kombi"   && <KombiSection />}
      {tab === "dalhoff" && <DalhoffSection />}
      {tab === "prob"    && <ProbSection />}
    </div>
  )
}
