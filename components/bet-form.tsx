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
import {
  calculatePotentialPayout,
  formatCurrency,
  assessFairValue,
} from "@/lib/calculations"

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
  })
  .superRefine((data, ctx) => {
    if (data.category !== "action") {
      if (!data.odds) {
        ctx.addIssue({
          path: ["odds"],
          code: "custom",
          message: "Quote muss mindestens 1.01 sein",
        })
      }
      if (!data.stake) {
        ctx.addIssue({
          path: ["stake"],
          code: "custom",
          message: "Einsatz eingeben",
        })
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
  odds_against: string
  stake: string
  tip: string
  event_datetime: string
}

type FormValues = z.output<typeof formSchema>

// ── Fair-Value Styles ─────────────────────────────────────────────────────────

const FAIR_VALUE_STYLES = {
  great: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-400", Icon: Flame },
  fair:  { bg: "bg-green-500/10 border-green-500/20",  text: "text-green-400",  Icon: CheckCircle2 },
  poor:  { bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400", Icon: AlertTriangle },
}

// ── Kategorie-Config ──────────────────────────────────────────────────────────

const CATEGORY_CONFIG = {
  sport: { Icon: Trophy, label: "Sport-Wette", color: "text-blue-400" },
  casino: { Icon: Dices, label: "Casino", color: "text-purple-400" },
  action: { Icon: Sparkles, label: "Aktion / Info", color: "text-amber-400" },
} as const

// ── Component ─────────────────────────────────────────────────────────────────

export function BetForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      odds_against: "",
      stake: "",
      tip: "",
      event_datetime: "",
    },
  })

  const category = form.watch("category")
  const oddsStr = form.watch("odds")
  const oddsAgainstStr = form.watch("odds_against")
  const stakeStr = form.watch("stake")

  const odds = parseFloat(oddsStr)
  const oddsAgainst = oddsAgainstStr ? parseFloat(oddsAgainstStr) : null
  const stake = parseFloat(stakeStr)

  const isAction = category === "action"
  const isSport = category === "sport"
  const sportList = isSport ? SPORTS : CASINO_GAMES
  const betTypeList = isSport ? SPORT_BET_TYPES : ACTION_TYPES

  const potentialPayout =
    !isAction && !isNaN(odds) && !isNaN(stake) && odds > 0 && stake > 0
      ? calculatePotentialPayout(stake, odds)
      : null

  const fairValue =
    !isAction && !isNaN(odds) && odds >= 1.01
      ? assessFairValue(
          odds,
          oddsAgainst && !isNaN(oddsAgainst) && oddsAgainst >= 1.01
            ? oddsAgainst
            : null
        )
      : null

  // Reset sport/bet_type when category changes
  useEffect(() => {
    form.setValue("sport", "")
    form.setValue("bet_type", "")
  }, [category, form])

  // Restore member name from localStorage
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
        body: JSON.stringify(typedValues),
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

        {/* ── Kategorie (3 Buttons) ── */}
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
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors ${
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
                  <SelectTrigger>
                    <SelectValue placeholder="Name auswählen…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-(--radix-select-trigger-width)">
                  {MEMBERS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Sportart / Casino-Spiel (nicht bei reiner Aktion) ── */}
        {!isAction && (
          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  {isSport
                    ? <Trophy className="h-3.5 w-3.5" />
                    : <Dices className="h-3.5 w-3.5" />}
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
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {s.label}
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

        {/* ── Event / Aktion ── */}
        <FormField
          control={form.control}
          name="match_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                {isAction
                  ? <Sparkles className="h-3.5 w-3.5" />
                  : <Trophy className="h-3.5 w-3.5" />}
                {isAction ? "Aktionsname" : isSport ? "Spiel / Event" : "Event / Aktion"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isAction
                      ? "z.B. 60 Freispiele bei Book of Legacy – Bwin"
                      : isSport
                      ? "z.B. Bayern München vs Dortmund"
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
                  <SelectTrigger>
                    <SelectValue placeholder="Anbieter wählen…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="min-w-(--radix-select-trigger-width)">
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Wett-Typ & Aktions-Typ (nur bei Sport/Casino) ── */}
        {!isAction && (
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="bet_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" />
                    {isSport ? "Wett-Typ" : "Spielmodus"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {betTypeList.map((bt) => {
                        const Icon = bt.Icon
                        return (
                          <SelectItem key={bt.value} value={bt.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              {bt.label}
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
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="min-w-(--radix-select-trigger-width)">
                      {ACTION_TYPES.map((a) => {
                        const Icon = a.Icon
                        return (
                          <SelectItem key={a.value} value={a.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5 shrink-0" />
                              {a.label}
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

        {/* ── Aktions-Typ (nur bei reiner Aktion) ── */}
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
                    <SelectTrigger>
                      <SelectValue placeholder="Aktionsart wählen…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="min-w-(--radix-select-trigger-width)">
                    {ACTION_TYPES.map((a) => {
                      const Icon = a.Icon
                      return (
                        <SelectItem key={a.value} value={a.value}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {a.label}
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

        {/* ── Quote, Gegenquote & Einsatz (nur bei Sport/Casino) ── */}
        {!isAction && (
          <div className="grid grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="odds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Quote
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="1.01" placeholder="2.40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="odds_against"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5" /> Gegenquote
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="1.01" placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Euro className="h-3.5 w-3.5" /> Einsatz (€)
                  </FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0.01" placeholder="10.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* ── Fair-Value / EV (nur bei Sport/Casino mit Quote) ── */}
        {fairValue && (
          <div className={`rounded-lg border px-4 py-3 space-y-2 ${FAIR_VALUE_STYLES[fairValue.rating].bg}`}>
            <div className="flex items-center justify-between">
              <span className={`flex items-center gap-2 text-sm font-semibold ${FAIR_VALUE_STYLES[fairValue.rating].text}`}>
                {(() => {
                  const { Icon } = FAIR_VALUE_STYLES[fairValue.rating]
                  return <Icon className="h-4 w-4" />
                })()}
                {fairValue.label}
              </span>
              <span className={`text-sm font-mono font-bold ${FAIR_VALUE_STYLES[fairValue.rating].text}`}>
                EV {fairValue.expectedValue >= 0 ? "+" : ""}{(fairValue.expectedValue * 100).toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-background/40 rounded-md px-2 py-1.5 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Impl. WS</p>
                <p className="font-mono font-semibold">{fairValue.impliedProbability.toFixed(1)}%</p>
              </div>
              <div className="bg-background/40 rounded-md px-2 py-1.5 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Faire WS</p>
                <p className="font-mono font-semibold">{fairValue.fairProbability.toFixed(1)}%</p>
              </div>
              <div className="bg-background/40 rounded-md px-2 py-1.5 text-center">
                <p className="text-muted-foreground leading-none mb-0.5">Marge</p>
                <p className="font-mono font-semibold">
                  {fairValue.bookmakerMargin !== null
                    ? `${fairValue.bookmakerMargin.toFixed(1)}%`
                    : "~5%"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-snug">{fairValue.description}</p>
          </div>
        )}

        {/* ── Gewinn-Vorschau (nur bei Sport/Casino) ── */}
        {potentialPayout !== null && (
          <div className="flex items-center justify-between rounded-lg bg-green-500/10 border border-green-500/20 px-4 py-3">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Möglicher Gewinn
            </span>
            <span className="font-semibold text-green-400 font-mono">
              {formatCurrency(potentialPayout)}
            </span>
          </div>
        )}

        {/* ── Beschreibung / Tipp ── */}
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
                    isAction
                      ? "z.B. Einzahlung €100 → 60 Freispiele auf Book of Legacy, kein Mindest-Umsatz!"
                      : isSport
                      ? "z.B. Bayern gewinnt, Over 2.5 Tore…"
                      : "z.B. Einzahlung €20 → €20 Freiwette, kein Umsatz nötig!"
                  }
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Datum & Uhrzeit (optional bei Aktionen) ── */}
        <FormField
          control={form.control}
          name="event_datetime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {isAction ? "Gültig bis (optional)" : "Datum & Uhrzeit"}
              </FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          <Zap className="h-4 w-4 mr-2" />
          {isSubmitting
            ? "Wird geteilt…"
            : isAction
            ? "Aktion teilen"
            : "Tipp teilen"}
        </Button>
      </form>
    </Form>
  )
}
