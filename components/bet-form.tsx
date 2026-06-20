"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  TrendingUp,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Flame,
  User,
  Trophy,
  Dices,
  Building2,
  CalendarDays,
  CalendarRange,
  MessageSquare,
  Star,
  BarChart2,
  Euro,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  MEMBERS,
  SPORTS,
  CASINO_GAMES,
  PROVIDERS,
  SPORT_BET_TYPES,
  ACTION_TYPES,
  type Category,
} from "@/lib/constants"
import { calculateDalhoff } from "@/lib/calculations"

// ── Schema ────────────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    member_name: z.string().min(1, "Bitte wähle deinen Namen"),
    category: z.enum(["sport", "casino", "action"]),
    sport: z.string().optional(),
    match_name: z.string().min(2, "Bitte gib das Event / die Aktion ein"),
    provider: z.string().min(1, "Bitte wähle einen Anbieter"),
    bet_type: z.string().optional(),
    action_type: z.string().optional(),
    odds: z
      .string()
      .optional()
      .transform((v) => (v && v !== "" ? parseFloat(v) : null))
      .pipe(z.number().min(1.01).nullable()),
    odds_draw: z
      .string()
      .optional()
      .transform((v) => (v && v !== "" ? parseFloat(v) : null))
      .pipe(z.number().min(1.01).nullable()),
    odds_against: z
      .string()
      .optional()
      .transform((v) => (v && v !== "" ? parseFloat(v) : null))
      .pipe(z.number().min(1.01).nullable()),
    stake: z
      .string()
      .optional()
      .transform((v) => (v && v !== "" ? parseFloat(v) : null))
      .pipe(z.number().min(0.01).nullable()),
    tip: z.string().min(1, "Bitte beschreibe die Aktion / deinen Tipp"),
    event_datetime: z.string().optional(),
    action_start_date: z.string().optional(),
    action_end_date: z.string().optional(),
    action_weekdays: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "sport") {
      if (!data.odds) {
        ctx.addIssue({ path: ["odds"], code: "custom", message: "Quote muss mindestens 1.01 sein" })
      }
      if (!data.stake) {
        ctx.addIssue({ path: ["stake"], code: "custom", message: "Einsatz eingeben" })
      }
    }
  })

type FormInput = {
  member_name: string
  category: Category
  sport: string
  match_name: string
  provider: string
  bet_type: string
  action_type: string
  odds: string
  odds_draw: string
  odds_against: string
  stake: string
  tip: string
  event_datetime: string
  action_start_date: string
  action_end_date: string
  action_weekdays: string
}

type FormValues = z.output<typeof formSchema>

// ── Weekday config (JS: 0=Sun, 1=Mon … 6=Sat) ────────────────────────────────

const WEEKDAYS = [
  { day: 1, label: "Mo" },
  { day: 2, label: "Di" },
  { day: 3, label: "Mi" },
  { day: 4, label: "Do" },
  { day: 5, label: "Fr" },
  { day: 6, label: "Sa" },
  { day: 0, label: "So" },
]

// ── Dalhoff Styles ────────────────────────────────────────────────────────────

const DALHOFF_STYLES = {
  value:       { bg: "bg-green-500/10 border-green-500/20",   text: "text-green-400",  Icon: Flame         },
  neutral:     { bg: "bg-blue-500/10 border-blue-500/20",     text: "text-blue-400",   Icon: CheckCircle2  },
  disadvantage:{ bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400", Icon: AlertTriangle },
}

// ── Kategorie-Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  sport:  { Icon: Trophy,   label: "Sport-Wette",   color: "text-blue-400"   },
  casino: { Icon: Dices,    label: "Casino",        color: "text-purple-400" },
  action: { Icon: Sparkles, label: "Aktion / Info", color: "text-amber-400"  },
} as const

// ── Component ─────────────────────────────────────────────────────────────────

const RATING_LABELS = ["", "Schlecht", "Naja", "Ok", "Gut", "Top Value!"]

export function BetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)

  const form = useForm<FormInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      member_name: "",
      category: "sport",
      sport: "",
      match_name: "",
      provider: "",
      bet_type: "",
      action_type: "",
      odds: "",
      odds_draw: "",
      odds_against: "",
      stake: "",
      tip: "",
      event_datetime: "",
      action_start_date: "",
      action_end_date: "",
      action_weekdays: "",
    },
  })

  const category = form.watch("category")
  const betType  = form.watch("bet_type")
  const oddsStr        = form.watch("odds")
  const oddsDrawStr    = form.watch("odds_draw")
  const oddsAgainstStr = form.watch("odds_against")

  const odds        = parseFloat(oddsStr)
  const oddsDraw    = oddsDrawStr ? parseFloat(oddsDrawStr) : null
  const oddsAgainst = oddsAgainstStr ? parseFloat(oddsAgainstStr) : null

  const isAction  = category === "action"
  const isSport   = category === "sport"
  const is1X2     = isSport && betType === "1X2"
  const sportList   = isSport ? SPORTS : CASINO_GAMES
  const betTypeList = isSport ? SPORT_BET_TYPES : ACTION_TYPES

  const quotesForDalhoff: number[] = []
  if (!isNaN(odds) && odds >= 1.01) quotesForDalhoff.push(odds)
  if (is1X2 && oddsDraw && !isNaN(oddsDraw) && oddsDraw >= 1.01) quotesForDalhoff.push(oddsDraw)
  if (!isNaN(Number(oddsAgainst)) && Number(oddsAgainst) >= 1.01) quotesForDalhoff.push(Number(oddsAgainst))
  const dalhoff = !isAction && quotesForDalhoff.length >= 2 ? calculateDalhoff(quotesForDalhoff) : null

  function toggleDay(day: number) {
    setSelectedDays((prev) => {
      const next = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      form.setValue("action_weekdays", next.length > 0 ? next.join(",") : "")
      return next
    })
  }

  // Reset category-dependent fields
  useEffect(() => {
    form.setValue("sport", "")
    form.setValue("bet_type", "")
    form.setValue("odds_draw", "")
    setSelectedDays([])
    form.setValue("action_weekdays", "")
  }, [category, form])

  useEffect(() => {
    if (!is1X2) form.setValue("odds_draw", "")
  }, [betType, is1X2, form])

  useEffect(() => {
    const saved = localStorage.getItem("wett-ticker-member")
    if (saved) form.setValue("member_name", saved)
  }, [form])

  async function onSubmit(values: unknown) {
    const typedValues = values as FormValues
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...typedValues, ...(rating > 0 ? { rating } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Fehler beim Speichern")
      }
      localStorage.setItem("wett-ticker-member", typedValues.member_name)
      toast.success("Eingetragen!", {
        description: `${typedValues.match_name}${typedValues.odds ? ` @ ${typedValues.odds}` : ""} (${typedValues.provider})`,
      })
      form.reset()
      setSelectedDays([])
      setRating(0)
      form.setValue("member_name", typedValues.member_name)
      form.setValue("category", typedValues.category as Category)
    } catch (err) {
      toast.error("Fehler", {
        description: err instanceof Error ? err.message : "Unbekannter Fehler",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Kategorie ── */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategorie</FormLabel>
              <div className="grid grid-cols-3 gap-2">
                {(["sport", "casino", "action"] as const).map((cat) => {
                  const { Icon, label, color } = CATEGORY_CONFIG[cat]
                  const isActive = field.value === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => field.onChange(cat)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "" : color}`} />
                      {label}
                    </button>
                  )
                })}
              </div>
            </FormItem>
          )}
        />

        {/* ── Name ── */}
        <FormField
          control={form.control}
          name="member_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Dein Name
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Name auswählen…" /></SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-(--radix-select-trigger-width)">
                  {MEMBERS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Sportart / Casino-Spiel ── */}
        {!isAction && (
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  {isSport ? <Trophy className="h-3.5 w-3.5" /> : <Dices className="h-3.5 w-3.5" />}
                  {isSport ? "Sportart" : "Casino-Spiel"}
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isSport ? "Sportart wählen…" : "Spiel wählen…"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="min-w-(--radix-select-trigger-width)">
                    {sportList.map((s) => {
                      const Icon = s.Icon
                      return (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0" />{s.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ── Event / Aktionsname ── */}
        <FormField
          control={form.control}
          name="match_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                {isAction ? <Sparkles className="h-3.5 w-3.5" /> : <Trophy className="h-3.5 w-3.5" />}
                {isAction ? "Aktionsname" : isSport ? "Spiel / Event" : "Event / Aktion"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isAction ? "z.B. 60 Freispiele bei Book of Legacy – Bwin"
                    : isSport ? "z.B. Bayern München vs Dortmund"
                    : "z.B. 50 Freispiele auf Book of Dead"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Anbieter ── */}
        <FormField
          control={form.control}
          name="provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" /> Anbieter
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Anbieter wählen…" /></SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-(--radix-select-trigger-width)">
                  {PROVIDERS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Wett-Typ & Aktions-Typ (Sport/Casino) ── */}
        {!isAction && (
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="bet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" />{isSport ? "Wett-Typ" : "Spielmodus"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Wählen…" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {betTypeList.map((bt) => {
                        const Icon = bt.Icon
                        return (
                          <SelectItem key={bt.value} value={bt.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 shrink-0" />{bt.label}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5" /> Aktions-Typ
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Wählen…" /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {ACTION_TYPES.map((a) => {
                        const Icon = a.Icon
                        return (
                          <SelectItem key={a.value} value={a.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 shrink-0" />{a.label}
                            </span>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ── Aktions-Typ (reine Aktion) ── */}
        {isAction && (
          <FormField
            control={form.control}
            name="action_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5" /> Art der Aktion
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Aktionsart wählen…" /></SelectTrigger>
                  </FormControl>
                  <SelectContent className="min-w-(--radix-select-trigger-width)">
                    {ACTION_TYPES.map((a) => {
                      const Icon = a.Icon
                      return (
                        <SelectItem key={a.value} value={a.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0" />{a.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ── Quoten & Einsatz (nur Sport) ── */}
        {isSport && (
          <>
            {is1X2 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" /> Quoten (alle 3 für Dalhoff-Formel)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <FormField control={form.control} name="odds" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Sieg (1)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="1.01" placeholder="2.10" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="odds_draw" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Unentschieden (X)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="1.01" placeholder="3.40" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="odds_against" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Niederlage (2)</FormLabel>
                      <FormControl><Input type="number" step="0.01" min="1.01" placeholder="3.60" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="stake" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Euro className="h-3.5 w-3.5" /> Einsatz (€)
                    </FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0.01" placeholder="10.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <FormField control={form.control} name="odds" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Quote
                    </FormLabel>
                    <FormControl><Input type="number" step="0.01" min="1.01" placeholder="2.40" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="odds_against" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" /> Gegenquote
                    </FormLabel>
                    <FormControl><Input type="number" step="0.01" min="1.01" placeholder="Optional" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stake" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Euro className="h-3.5 w-3.5" /> Einsatz (€)
                    </FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0.01" placeholder="10.00" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            )}
          </>
        )}

        {/* ── Dalhoff Live-Vorschau ── */}
        {dalhoff && (
          <div className={`rounded-xl border px-4 py-3 space-y-1.5 ${DALHOFF_STYLES[dalhoff.rating].bg}`}>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-2 text-sm font-semibold ${DALHOFF_STYLES[dalhoff.rating].text}`}>
                {(() => { const { Icon } = DALHOFF_STYLES[dalhoff.rating]; return <Icon className="h-4 w-4" /> })()}
                {dalhoff.label}
              </span>
              <span className={`text-sm font-mono font-bold ${DALHOFF_STYLES[dalhoff.rating].text}`}>
                {dalhoff.margin >= 0 ? "+" : ""}{dalhoff.marginPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{dalhoff.description}</p>
          </div>
        )}

        {/* ── Beschreibung ── */}
        <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {isAction ? "Beschreibung" : isSport ? "Dein Tipp" : "Aktionsbeschreibung"}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isAction ? "z.B. Einzahlung €100 → 60 Freispiele, kein Mindest-Umsatz!"
                    : isSport ? "z.B. Bayern gewinnt, Over 2.5 Tore…"
                    : "z.B. Einzahlung €20 → €20 Freiwette, kein Umsatz nötig!"
                  }
                  className="resize-none" rows={3} {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Datum & Uhrzeit (Sport/Casino) ── */}
        {!isAction && (
          <FormField
            control={form.control}
            name="event_datetime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> Datum & Uhrzeit
                </FormLabel>
                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* ── Aktionszeitraum (nur Aktionen) ── */}
        {isAction && (
          <div className="space-y-3 rounded-xl bg-amber-500/5 border border-amber-500/15 px-3 py-3">
            <p className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
              <CalendarRange className="h-3.5 w-3.5" /> Aktionszeitraum (optional)
            </p>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="action_start_date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Von</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="action_end_date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Bis</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Weekday picker */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Aktiv an bestimmten Tagen (leer = täglich)
              </p>
              <div className="flex gap-1.5">
                {WEEKDAYS.map(({ day, label }) => {
                  const active = selectedDays.includes(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        active
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          : "bg-muted/40 text-muted-foreground border border-border/40 hover:border-border/70"
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
              {selectedDays.length > 0 && (
                <p className="text-[11px] text-amber-400/70 mt-1.5">
                  Aktiv: {WEEKDAYS.filter(w => selectedDays.includes(w.day)).map(w => w.label).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Bewertung ── */}
        <div className="space-y-1.5">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" /> Bewertung
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </p>
          <div
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => {
              const filled = n <= (hoverRating || rating)
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating((prev) => prev === n ? 0 : n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className="h-7 w-7 transition-colors"
                    style={filled
                      ? { fill: "#FFD700", color: "#FFD700" }
                      : { fill: "transparent", color: "var(--muted-foreground)" }
                    }
                  />
                </button>
              )
            })}
            {(hoverRating || rating) > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {RATING_LABELS[hoverRating || rating]}
              </span>
            )}
          </div>
        </div>

        <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
          <Zap className="h-4 w-4 mr-2" />
          {isSubmitting ? "Wird geteilt…" : isAction ? "Aktion teilen" : "Tipp teilen"}
        </Button>
      </form>
    </Form>
  )
}
