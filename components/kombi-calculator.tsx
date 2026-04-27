"use client"

import { useState } from "react"
import { Plus, Trash2, TrendingUp, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

function uid() { return Math.random().toString(36).slice(2) }

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

// ── EV Calculator ─────────────────────────────────────────────────────────────

interface BookmakerEntry { id: string; name: string; quote: string; overround: string }

function EVSection() {
  const [myQuote, setMyQuote] = useState("")
  const [bookmakers, setBookmakers] = useState<BookmakerEntry[]>([
    { id: uid(), name: "", quote: "", overround: "" },
    { id: uid(), name: "", quote: "", overround: "" },
  ])

  function addBookmaker() {
    if (bookmakers.length < 8)
      setBookmakers((p) => [...p, { id: uid(), name: "", quote: "", overround: "" }])
  }
  function removeBookmaker(id: string) {
    if (bookmakers.length > 1) setBookmakers((p) => p.filter((b) => b.id !== id))
  }
  function updateBookmaker(id: string, field: keyof Omit<BookmakerEntry, "id">, value: string) {
    setBookmakers((p) => p.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }

  const parsedMyQuote = parseFloat(myQuote.replace(",", "."))
  const myQuoteValid = !isNaN(parsedMyQuote) && parsedMyQuote >= 1.01

  const fairProbs = bookmakers
    .map((b) => ({
      name: b.name,
      q: parseFloat(b.quote.replace(",", ".")),
      or: parseFloat(b.overround.replace(",", ".")),
    }))
    .filter((b) => !isNaN(b.q) && b.q >= 1.01 && !isNaN(b.or) && b.or >= 1)
    .map((b) => ({ ...b, p: 1 / (b.q * b.or) }))

  const realProb =
    fairProbs.length > 0
      ? fairProbs.reduce((sum, b) => sum + b.p, 0) / fairProbs.length
      : null

  const ev = myQuoteValid && realProb != null ? parsedMyQuote * realProb - 1 : null

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-1.5">Deine Quote (zu spielen)</p>
        <input
          value={myQuote}
          onChange={(e) => setMyQuote(e.target.value)}
          placeholder="z.B. 3.95"
          inputMode="decimal"
          className="w-full text-xl font-mono bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
        />
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Vergleichs-Anbieter (gleiche Wette)</p>
        <div className="space-y-2">
          {bookmakers.map((b, idx) => {
            const q = parseFloat(b.quote.replace(",", "."))
            const or = parseFloat(b.overround.replace(",", "."))
            const quoteValid = !isNaN(q) && q >= 1.01
            const overroundValid = !isNaN(or) && or >= 1
            return (
              <div key={b.id} className="flex items-center gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                <input
                  value={b.name}
                  onChange={(e) => updateBookmaker(b.id, "name", e.target.value)}
                  placeholder="Anbieter"
                  className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                />
                <input
                  value={b.quote}
                  onChange={(e) => updateBookmaker(b.id, "quote", e.target.value)}
                  placeholder="Quote"
                  inputMode="decimal"
                  className={`w-18 text-xs font-mono bg-muted/40 border rounded-full px-2 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                    quoteValid ? "border-green-500/30 text-green-400" : "border-border/40"
                  }`}
                />
                <input
                  value={b.overround}
                  onChange={(e) => updateBookmaker(b.id, "overround", e.target.value)}
                  placeholder="Overr."
                  inputMode="decimal"
                  className={`w-18 text-xs font-mono bg-muted/40 border rounded-full px-2 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                    overroundValid ? "border-blue-500/30 text-blue-400" : "border-border/40"
                  }`}
                />
                <button
                  onClick={() => removeBookmaker(b.id)}
                  disabled={bookmakers.length <= 1}
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
        <button
          onClick={addBookmaker}
          disabled={bookmakers.length >= 8}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 ml-7 mt-3"
        >
          <Plus className="h-3.5 w-3.5" />
          Anbieter hinzufügen ({bookmakers.length}/8)
        </button>
      </div>

      {ev != null && realProb != null && (
        <Card className="rounded-2xl border-border/40 bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <div className="bg-muted/30 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Anbieter</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Quote</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Overround</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">faire p</th>
                  </tr>
                </thead>
                <tbody>
                  {fairProbs.map((b, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 truncate max-w-17.5">{b.name || `Anbieter ${i + 1}`}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{b.q.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{b.or.toFixed(4)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                        {(b.p * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Reale Wahrscheinlichkeit (Ø)</span>
              <span className="font-mono text-sm font-semibold">{(realProb * 100).toFixed(2)}%</span>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Faire Quote</span>
              <span className="font-mono text-sm text-muted-foreground">{(1 / realProb).toFixed(2)}</span>
            </div>

            <div
              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                ev > 0 ? "bg-green-500/8 border-green-500/20" : "bg-red-500/8 border-red-500/20"
              }`}
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Expected Value
              </span>
              <div className="text-right">
                <div className={`font-mono font-bold text-lg ${ev > 0 ? "text-green-400" : "text-red-400"}`}>
                  {ev > 0 ? "+" : ""}{(ev * 100).toFixed(2)}%
                </div>
                <div className={`text-xs font-mono ${ev > 0 ? "text-green-400/70" : "text-red-400/70"}`}>
                  {ev > 0 ? "+" : ""}{ev.toFixed(3)} € pro 1 € Einsatz
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ExplanationBox
        title="Wie wird der EV berechnet?"
        text={`1. Faire Wahrscheinlichkeit pro Anbieter\n   p = 1 / (Quote × Overround)\n\n   Den Overround berechnest du mit dem Dalhoff-Tab.\n   Typisch: 1.05–1.12\n\n2. Reale Wahrscheinlichkeit\n   Durchschnitt aller p-Werte der eingegebenen Anbieter.\n\n3. EV = (Deine Quote × Reale WS) − 1\n\n   Positiv (+EV) → Value Bet, du hast langfristig Vorteil.\n   Negativ (−EV) → kein Value, Buchmacher hat Vorteil.\n\nBeispiel:\n   Anbieter A: Quote 3.20 · Overround 1.1018 → p = 28.36%\n   Anbieter B: Quote 3.40 · Overround 1.0920 → p = 27.20%\n   Reale WS: (28.36 + 27.20) / 2 = 27.78%\n   Faire Quote: 1 / 0.2778 = 3.60\n   Deine Quote: 3.95\n   EV = (3.95 × 0.2778) − 1 = +9.73%`}
      />
    </div>
  )
}

// ── Overround / Dalhoff ───────────────────────────────────────────────────────

interface OutcomeEntry { id: string; label: string; quote: string }

function DalhoffSection() {
  const [outcomes, setOutcomes] = useState<OutcomeEntry[]>([
    { id: uid(), label: "Sieg", quote: "" },
    { id: uid(), label: "Unentschieden", quote: "" },
    { id: uid(), label: "Niederlage", quote: "" },
  ])

  function addOutcome() {
    if (outcomes.length < 10)
      setOutcomes((p) => [...p, { id: uid(), label: "", quote: "" }])
  }
  function removeOutcome(id: string) {
    if (outcomes.length > 2) setOutcomes((p) => p.filter((o) => o.id !== id))
  }
  function updateOutcome(id: string, field: keyof Omit<OutcomeEntry, "id">, value: string) {
    setOutcomes((p) => p.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
  }

  const parsed = outcomes
    .map((o) => ({ ...o, q: parseFloat(o.quote.replace(",", ".")) }))
    .filter((o) => !isNaN(o.q) && o.q >= 1.01)

  const overround = parsed.length >= 2 ? parsed.reduce((sum, o) => sum + 1 / o.q, 0) : null
  const margin = overround != null ? (overround - 1) * 100 : null

  const margenColor =
    margin == null ? "" :
    margin < 3 ? "text-green-400" :
    margin < 7 ? "text-yellow-400" : "text-red-400"

  const margenBg =
    margin == null ? "" :
    margin < 3 ? "bg-green-500/8 border-green-500/20" :
    margin < 7 ? "bg-yellow-500/8 border-yellow-500/20" : "bg-red-500/8 border-red-500/20"

  const margenLabel =
    margin == null ? "" :
    margin < 3 ? "Sehr faire Quoten" :
    margin < 7 ? "Normale Marge" : "Hohe Marge"

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Alle Quoten eines Spiels bei <span className="font-medium text-foreground">einem</span> Anbieter eingeben (z.B. Sieg / X / Niederlage).
      </p>

      <div className="space-y-2">
        {outcomes.map((o, idx) => {
          const q = parseFloat(o.quote.replace(",", "."))
          const valid = !isNaN(q) && q >= 1.01
          return (
            <div key={o.id} className="flex items-center gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <input
                value={o.label}
                onChange={(e) => updateOutcome(o.id, "label", e.target.value)}
                placeholder={`Ausgang ${idx + 1}`}
                className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
              />
              <div className="relative shrink-0 w-24">
                <input
                  value={o.quote}
                  onChange={(e) => updateOutcome(o.id, "quote", e.target.value)}
                  placeholder="Quote"
                  inputMode="decimal"
                  className={`w-full text-xs font-mono bg-muted/40 border rounded-full px-2.5 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                    valid ? "border-green-500/30 text-green-400" : "border-border/40"
                  }`}
                />
                {valid && (
                  <span className="absolute -bottom-3.5 left-0 right-0 text-[9px] text-center text-muted-foreground">
                    {((1 / q) * 100).toFixed(1)}%
                  </span>
                )}
              </div>
              <button
                onClick={() => removeOutcome(o.id)}
                disabled={outcomes.length <= 2}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>

      <button
        onClick={addOutcome}
        disabled={outcomes.length >= 10}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 ml-7"
      >
        <Plus className="h-3.5 w-3.5" />
        Ausgang hinzufügen ({outcomes.length}/10)
      </button>

      {overround != null && margin != null && (
        <Card className="rounded-2xl border-border/40 bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <div className="bg-muted/30 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Ausgang</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Quote</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">1 / Q</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">impl. WS</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((o, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 truncate max-w-17.5">{o.label || `Ausgang ${i + 1}`}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{o.q.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                        {(1 / o.q).toFixed(4)}
                      </td>
                      <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                        {((1 / o.q) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/20">
                    <td className="px-3 py-1.5 font-medium text-foreground/80" colSpan={2}>Summe</td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold">{overround.toFixed(4)}</td>
                    <td className="px-3 py-1.5 text-right font-mono font-semibold">
                      {(overround * 100).toFixed(1)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground">Overround</span>
              <span className="font-mono text-sm font-semibold">{overround.toFixed(4)}</span>
            </div>

            <div className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${margenBg}`}>
              <span className={`text-sm font-semibold ${margenColor}`}>{margenLabel}</span>
              <div className="text-right">
                <div className={`font-mono font-bold text-lg ${margenColor}`}>
                  +{margin.toFixed(2)}%
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Buchmacher-Marge
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ExplanationBox
        title="Satz des Dalhoffs (Overround berechnen)"
        text={`Formel: Overround = 1/Q₁ + 1/Q₂ + … + 1/Qₙ\n\nDu gibst alle Quoten eines Spiels bei einem Anbieter ein. Die Summe der Kehrwerte ergibt den Overround — also wie viel der Buchmacher insgesamt "einbaut".\n\nMarge (%) = (Overround − 1) × 100\n\nBeispiel (3-Weg-Markt):\n   Sieg 1.50 → 1/1.50 = 0.6667\n   Unent. 3.50 → 1/3.50 = 0.2857\n   Niederlage 4.20 → 1/4.20 = 0.2381\n   Overround = 0.6667 + 0.2857 + 0.2381 = 1.1905\n   Marge = (1.1905 − 1) × 100 = 19.05%\n\nDiesen Overround-Wert verwendest du im EV-Rechner.`}
      />
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

type Tab = "ev" | "dalhoff"

export function KombiCalculator() {
  const [tab, setTab] = useState<Tab>("ev")

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 bg-muted/40 rounded-full p-1">
        {(["ev", "dalhoff"] as Tab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {id === "ev" ? "EV-Rechner" : "Overround / Dalhoff"}
          </button>
        ))}
      </div>

      {tab === "ev"      && <EVSection />}
      {tab === "dalhoff" && <DalhoffSection />}
    </div>
  )
}
