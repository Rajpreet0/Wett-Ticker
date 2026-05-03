import {
  Footprints,
  CircleDot,
  IceCream2,
  Cpu,
  Swords,
  Car,
  Medal,
  Gamepad2,
  CircleDashed,
  Spade,
  Monitor,
  TrendingUp,
  Dices,
  Gift,
  ShieldCheck,
  Banknote,
  Rocket,
  CircleDollarSign,
  RefreshCw,
  Ticket,
  Sparkles,
  Star,
  Trophy,
  BarChart2,
  Target,
  Scale,
  Repeat2,
  Zap,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"

export const MEMBERS = [
  "Raj",
  "Ben",
  "Aime",
  "Felix"
]

// ─── Kategorien ──────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { value: "sport", label: "Sport-Wette", Icon: Trophy },
  { value: "casino", label: "Casino", Icon: Dices },
  { value: "action", label: "Aktion / Info", Icon: Sparkles },
] as const

export type Category = (typeof CATEGORIES)[number]["value"]

// ─── Sport ───────────────────────────────────────────────────────────────────

export const SPORTS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "Fußball", label: "Fußball", Icon: Footprints },
  { value: "Tennis", label: "Tennis", Icon: CircleDot },
  { value: "Basketball", label: "Basketball", Icon: CircleDot },
  { value: "Eishockey", label: "Eishockey", Icon: IceCream2 },
  { value: "American Football", label: "American Football", Icon: Cpu },
  { value: "Boxen", label: "Boxen / MMA", Icon: Swords },
  { value: "Formel 1", label: "Formel 1", Icon: Car },
  { value: "Sonstige", label: "Sonstige", Icon: Medal },
]

// ─── Casino-Spiele ────────────────────────────────────────────────────────────

export const CASINO_GAMES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "Slots", label: "Slots / Spielautomaten", Icon: Gamepad2 },
  { value: "Roulette", label: "Roulette", Icon: CircleDashed },
  { value: "Blackjack", label: "Blackjack", Icon: Spade },
  { value: "Poker", label: "Poker", Icon: Spade },
  { value: "Live Casino", label: "Live Casino", Icon: Monitor },
  { value: "Crash Game", label: "Crash Game", Icon: TrendingUp },
  { value: "Sonstige", label: "Sonstige Casino", Icon: Dices },
]

// ─── Anbieter ────────────────────────────────────────────────────────────────

export const PROVIDERS: { value: string; label: string }[] = [
  { value: "Betway", label: "Betway" },
  { value: "Tipico", label: "Tipico" },
  { value: "Bet365", label: "Bet365" },
  { value: "Bwin", label: "Bwin" },
  { value: "Winamax", label: "Winamax" },
  { value: "Interwetten", label: "Interwetten" },
  { value: "Betano", label: "Betano" },
  { value: "Merkur", label: "Merkur" },
  { value: "Oddset", label: "Oddset"},
  { value: "Sonstige", label: "Sonstige" },
]

// ─── Wett-Typen (Sport) ───────────────────────────────────────────────────────

export const SPORT_BET_TYPES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "1X2", label: "Sieg / Unentschieden / Niederlage", Icon: Trophy },
  { value: "Over/Under", label: "Over / Under", Icon: BarChart2 },
  { value: "Beide Teams treffen", label: "Beide Teams treffen", Icon: Target },
  { value: "Handicap", label: "Handicap", Icon: Scale },
  { value: "Korrekte Score", label: "Korrektes Ergebnis", Icon: Target },
  { value: "Double Chance", label: "Double Chance", Icon: Repeat2 },
  { value: "Anytime Scorer", label: "Torschütze (jederzeit)", Icon: Zap },
  { value: "Sonstige", label: "Sonstige", Icon: HelpCircle },
]

// ─── Aktions-Typen ────────────────────────────────────────────────────────────

export const ACTION_TYPES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "Freiwette", label: "Freiwette", Icon: Gift },
  { value: "Gratiswette", label: "Gratiswette (kein Risiko)", Icon: ShieldCheck },
  { value: "Cashback", label: "Cashback-Aktion", Icon: Banknote },
  { value: "Boost", label: "Quote Boost", Icon: Rocket },
  { value: "Einzahlungsbonus", label: "Einzahlungsbonus", Icon: CircleDollarSign },
  { value: "Reload Bonus", label: "Reload Bonus", Icon: RefreshCw },
  { value: "Turnierticket", label: "Turnierticket", Icon: Ticket },
  { value: "Freispiele", label: "Freispiele (Casino)", Icon: Gamepad2 },
  { value: "No Wager", label: "Bonus ohne Umsatz", Icon: Sparkles },
  { value: "Sonstige Aktion", label: "Sonstige Aktion", Icon: Star },
]