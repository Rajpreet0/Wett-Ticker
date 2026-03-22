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

const formSchema = z.object({
  member_name: z.string().min(1, "Bitte wähle deinen Namen"),
  category: z.enum(["sport", "casino"]),
  sport: z.string().min(1, "Bitte wähle eine Kategorie"),
  match_name: z.string().min(2, "Bitte gib das Event / die Aktion ein"),
  provider: z.string().min(1, "Bitte wähle einen Anbieter"),
  bet_type: z.string().min(1, "Bitte wähle einen Wett-Typ"),
  action_type: z.string().min(1, "Bitte wähle eine Aktionsart"),
  odds: z
    .string()
    .min(1, "Quote eingeben")
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(1.01, "Quote muss mindestens 1.01 sein")),
  odds_against: z
    .string()
    .optional()
    .transform((v) => (v && v !== "" ? parseFloat(v) : null))
    .pipe(z.number().min(1.01).nullable()),
  stake: z
    .string()
    .min(1, "Einsatz eingeben")
    .transform((v) => parseFloat(v))
    .pipe(z.number().min(0.01, "Einsatz muss mindestens 0,01 € sein")),
  tip: z.string().min(1, "Bitte beschreibe die Aktion / deinen Tipp"),
  event_datetime: z.string().min(1, "Bitte wähle Datum und Uhrzeit"),
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

const FAIR_VALUE_STYLES = {
  great: {
    bg: "bg-orange-500/10 border-orange-500/20",
    text: "text-orange-400",
    Icon: Flame,
  },
  fair: {
    bg: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
    Icon: CheckCircle2,
  },
  poor: {
    bg: "bg-yellow-500/10 border-yellow-500/20",
    text: "text-yellow-400",
    Icon: AlertTriangle,
  },
}

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

  const potentialPayout =
    !isNaN(odds) && !isNaN(stake) && odds > 0 && stake > 0
      ? calculatePotentialPayout(stake, odds)
      : null

  const fairValue =
    !isNaN(odds) && odds >= 1.01
      ? assessFairValue(odds, oddsAgainst && !isNaN(oddsAgainst) && oddsAgainst >= 1.01 ? oddsAgainst : null)
      : null

  const prevCategory = form.watch("category")
  useEffect(() => {
    form.setValue("sport", "")
    form.setValue("bet_type", "")
  }, [prevCategory, form])

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
      toast.success("Aktion eingetragen", {
        description: `${typedValues.match_name} @ ${typedValues.odds} (${typedValues.provider})`,
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

  const isSport = category === "sport"
  const sportList = isSport ? SPORTS : CASINO_GAMES
  const betTypeList = isSport ? SPORT_BET_TYPES : ACTION_TYPES

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* ── Kategorie Toggle ── */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategorie</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {(["sport", "casino"] as const).map((cat) => {
                  const isActive = field.value === cat
                  const Icon = cat === "sport" ? Trophy : Dices
                  const label = cat === "sport" ? "Sport-Wette" : "Casino"
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => field.onChange(cat)}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
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

        {/* ── Sportart / Casino-Spiel ── */}
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

        {/* ── Event / Aktion ── */}
        <FormField
          control={form.control}
          name="match_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" />
                {isSport ? "Spiel / Event" : "Aktionsname"}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    isSport
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
                <Building2 className="h-3.5 w-3.5" /> Wettanbieter
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

        {/* ── Wett-Typ & Aktions-Typ ── */}
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
                  <SelectContent className="min-w-xs">
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
                  <SelectContent className="min-w-xs">
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

        {/* ── Quote, Gegenquote & Einsatz ── */}
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

        {/* ── Fair-Value / EV Anzeige ── */}
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

        {/* ── Gewinn-Vorschau ── */}
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

        {/* ── Tipp / Beschreibung ── */}
        <FormField
          control={form.control}
          name="tip"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {isSport ? "Dein Tipp" : "Aktionsbeschreibung"}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isSport
                      ? "z.B. Bayern gewinnt, Over 2.5 Tore…"
                      : "z.B. Einzahlung €20, bekomme €20 Freiwette – kein Umsatz nötig!"
                  }
                  className="resize-none"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Datum & Uhrzeit ── */}
        <FormField
          control={form.control}
          name="event_datetime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" /> Datum & Uhrzeit
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
          {isSubmitting ? "Wird eingetragen…" : "Aktion teilen"}
        </Button>
      </form>
    </Form>
  )
}