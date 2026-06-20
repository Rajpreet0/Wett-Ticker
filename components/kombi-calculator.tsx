"use client"

import { useState } from "react"
import { Plus, Trash2, TrendingUp, Info, BrushCleaning } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "./ui/checkbox"

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
  const [myStake, setMyStake] = useState("")
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
      <div className="flex gap-4">
          <div>
              <p className="text-xs text-muted-foreground mb-1.5">Deine Quote (zu spielen)</p>
              <input
                value={myQuote}
                onChange={(e) => setMyQuote(e.target.value)}
                placeholder="z.B. 3.95"
                inputMode="decimal"
                className="w-full text-lg font-mono bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
              />
          </div>
          <div>
              <p className="text-xs text-muted-foreground mb-1.5">Dein Einsatz</p>
              <input
                value={myStake}
                onChange={(e) => setMyStake(e.target.value)}
                placeholder="z.B. 10,00€"
                inputMode="decimal"
                className="w-full text-lg font-mono bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
              />
          </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Vergleichs-Anbieter (gleiche Wette)</p>
        <div className="space-y-3">
          {bookmakers.map((b, idx) => {
            const q = parseFloat(b.quote.replace(",", "."))
            const or = parseFloat(b.overround.replace(",", "."))
            const quoteValid = !isNaN(q) && q >= 1.01
            const overroundValid = !isNaN(or) && or >= 1
            return (
              <div key={b.id} className="space-y-1.5">
                {/* Row 1: badge + name + delete */}
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-muted/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <input
                    value={b.name}
                    onChange={(e) => updateBookmaker(b.id, "name", e.target.value)}
                    placeholder="Anbieter"
                    className="flex-1 text-xs bg-muted/40 border border-border/40 rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => removeBookmaker(b.id)}
                    disabled={bookmakers.length <= 1}
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {/* Row 2: quote + overround */}
                <div className="flex items-center gap-2 pl-7">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted-foreground pl-2">Quote</span>
                    <input
                      value={b.quote}
                      onChange={(e) => updateBookmaker(b.id, "quote", e.target.value)}
                      placeholder="z.B. 3.20"
                      inputMode="decimal"
                      className={`w-full text-xs font-mono bg-muted/40 border rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                        quoteValid ? "border-green-500/30 text-green-400" : "border-border/40"
                      }`}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <span className="text-[9px] text-muted-foreground pl-2">Overround</span>
                    <input
                      value={b.overround}
                      onChange={(e) => updateBookmaker(b.id, "overround", e.target.value)}
                      placeholder="z.B. 1.10"
                      inputMode="decimal"
                      className={`w-full text-xs font-mono bg-muted/40 border rounded-full px-3 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                        overroundValid ? "border-blue-500/30 text-blue-400" : "border-border/40"
                      }`}
                    />
                  </div>
                </div>
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
            <div className="bg-muted/30 rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-70">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Anbieter</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Quote</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">Overr.</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">faire p</th>
                  </tr>
                </thead>
                <tbody>
                  {fairProbs.map((b, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 truncate max-w-20">{b.name || `A${i + 1}`}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{b.q.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{b.or.toFixed(3)}</td>
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
            <div className="flex items-center justify-between ">
              <span className="text-xs text-muted-foreground font-bold ">
                Erwarteter Gewinn pro {myStake} Einsatz
              </span>
              <div className="text-right">
               {myStake ? 
                  (ev*parseInt(myStake)).toFixed(2) + " €" 
                : 
                  (" ")
               } 
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

  const [checkedTax, setCheckedTax] = useState(false);
  
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

  function removeQuotes() {
    setOutcomes((prev) => prev.map((o) => ({...o, quote: ""})));
  }

  const TAX = 0.053

  const parsed = outcomes
    .map((o) => ({ ...o, q: parseFloat(o.quote.replace(",", ".")) }))
    .filter((o) => !isNaN(o.q) && o.q >= 1.01)
    .map((o) => ({ ...o, q: checkedTax ? o.q / (1 + TAX) : o.q }))

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
      
      <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Alle Quoten eines Spiels bei <span className="font-medium text-foreground">einem</span> Anbieter eingeben (z.B. Sieg / X / Niederlage).
          </p>
          <button 
            className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-30"
            onClick={() => removeQuotes()}
            >
            <BrushCleaning className="h-3.5 w-3.5"/>
          </button>
      </div>

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
              <input
                value={o.quote}
                onChange={(e) => updateOutcome(o.id, "quote", e.target.value)}
                placeholder="Quote"
                inputMode="decimal"
                className={`shrink-0 w-16 text-xs font-mono bg-muted/40 border rounded-full px-2 py-2 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center ${
                  valid ? "border-green-500/30 text-green-400" : "border-border/40"
                }`}
              />
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

      <div className="flex gap-4 items-center">
        <Checkbox checked={checkedTax} onCheckedChange={setCheckedTax}/>
        <p
         className="text-xs text-muted-foreground hover:text-foreground"
          >5.3% Steuer?</p>
      </div>

      {overround != null && margin != null && (
        <Card className="rounded-2xl border-border/40 bg-muted/20">
          <CardContent className="p-4 space-y-3">
            <div className="bg-muted/30 rounded-xl overflow-x-auto">
              <table className="w-full text-xs min-w-70">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left px-3 py-1.5 text-muted-foreground font-medium">Ausgang</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">
                      Quote{checkedTax ? " (netto)" : ""}
                    </th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">1 / Q</th>
                    <th className="text-right px-3 py-1.5 text-muted-foreground font-medium">WS%</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.map((o, i) => (
                    <tr key={i} className="border-b border-border/20 last:border-0">
                      <td className="px-3 py-1.5 truncate max-w-20">{o.label || `A${i + 1}`}</td>
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

// ── Steuer Rechner ────────────────────────────────────────────────────────────
function SteuerSection() {

  // Qnetto = 1 + (Q-1) * 0,947
  const [myQuote, setMyQuote] = useState("");

  const parsedMyQuote = parseFloat(myQuote.replace(",", "."))
  const myQuoteValid = !isNaN(parsedMyQuote) && parsedMyQuote >= 1.01

  const qNetto = myQuoteValid ? 1 + (parsedMyQuote - 1) * 0.947 : null

  return (
    <div className="space-y-4">
        <div>
            <p className="text-xs text-muted-foreground mb-1.5">Deine Quote (zu spielen)</p>
            <input
              value={myQuote}
              onChange={(e) => setMyQuote(e.target.value)}
              placeholder="z.B. 3.95"
              inputMode="decimal"
              className="w-full text-lg font-mono bg-muted/40 border border-border/40 rounded-2xl px-4 py-3 outline-none focus:border-primary/50 placeholder:text-muted-foreground text-center"
            />
        </div>

        {qNetto != null && (
          <Card className="rounded-2xl border-border/40 bg-muted/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Brutto-Quote</span>
                <span className="font-mono text-sm text-muted-foreground">{parsedMyQuote.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-xs text-muted-foreground">Steuer (5,3 %)</span>
                <span className="font-mono text-sm text-red-400">
                  −{((parsedMyQuote - 1) * 0.053).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/8 px-3 py-2.5">
                <span className="text-xs text-muted-foreground">
                  Netto-Quote <span className="text-muted-foreground/60">(nach Steuer)</span>
                </span>
                <span className="font-mono font-bold text-lg text-blue-400">{qNetto.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <ExplanationBox
          title="Wie wird die Netto-Quote berechnet?"
          text={`Formel: Q_netto = 1 + (Q − 1) × 0,947\n\nIn Deutschland wird eine Sportwettensteuer von 5,3 % auf den Gewinnanteil erhoben. Dadurch reduziert sich dein effektiver Gewinn.\n\nBeispiel:\n   Brutto-Quote: 3,95\n   Gewinnanteil: 3,95 − 1 = 2,95\n   Nach Steuer:  2,95 × 0,947 = 2,7437\n   Netto-Quote:  1 + 2,7437 = 3,7437\n\nDiese Netto-Quote zeigt, was du nach Abzug der Steuer effektiv erhältst.`}
        />
    </div>
  )
}


// ── Main Component ────────────────────────────────────────────────────────────

type Tab = "ev" | "dalhoff" | "steuer"

export function KombiCalculator() {
  const [tab, setTab] = useState<Tab>("ev")

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 bg-muted/40 rounded-full p-1">
        {(["ev", "dalhoff", "steuer"] as Tab[]).map((id) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {id === "ev" && "EV-Rechner"}
            {id === "dalhoff" && "Overround / Dalhoff"}
            {id === "steuer" && "Steuer Rechner"}
          </button>
        ))}
      </div>

      {tab === "ev"      && <EVSection />}
      {tab === "dalhoff" && <DalhoffSection />}
      {tab === "steuer" && <SteuerSection/>}
    </div>
  )
}
