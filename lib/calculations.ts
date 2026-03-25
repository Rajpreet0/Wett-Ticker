import type { Bet, MemberStats } from "./types"

export function calculatePotentialPayout(stake: number, odds: number): number {
  return stake * odds
}

export function calculateNetProfit(bets: Bet[]): number {
  const wonPayout = bets
    .filter((b) => b.status === "won")
    .reduce((sum, b) => sum + (b.potential_payout ?? 0), 0)
  const totalStaked = bets
    .filter((b) => b.status !== "pending")
    .reduce((sum, b) => sum + (b.stake ?? 0), 0)
  return wonPayout - totalStaked
}

export function calculateROI(netProfit: number, totalStaked: number): number {
  if (totalStaked === 0) return 0
  return (netProfit / totalStaked) * 100
}

// ─── Fair-Value / Expected Value ─────────────────────────────────────────────

export type FairValueRating = "great" | "fair" | "poor"

export interface FairValueResult {
  impliedProbability: number   // rohe impl. WS aus Buchmacher-Quote (0–100 %)
  fairProbability: number      // vig-bereinigte "echte" WS (0–100 %)
  bookmakerMargin: number | null // Buchmacher-Marge in % (nur mit Gegenquote)
  expectedValue: number        // EV pro €1 Einsatz (positiv = Vorteil für Spieler)
  rating: FairValueRating
  label: string
  description: string
}

/**
 * Bewertet eine Wette mit Expected-Value-Logik.
 *
 * MIT Gegenquote (odds_against):
 *   Overround = 1/odds + 1/odds_against   (Buchmacher-Gesamt-Wahrscheinlichkeit)
 *   Marge     = Overround - 1             (z.B. 0.05 = 5 % Marge)
 *   Faire WS  = (1/odds) / Overround      (vig-bereinigt)
 *   EV        = (faire_WS × Netto-Gewinn) - ((1 - faire_WS) × Einsatz)
 *             = faire_WS × (odds - 1) - (1 - faire_WS)
 *
 * OHNE Gegenquote (Schätzung):
 *   Typische Buchmacher-Marge ≈ 5 %
 *   impl. WS  = 1 / odds
 *   faire WS  = impl. WS / 1.05
 *   EV        = wie oben mit fairer WS
 *
 * EV > 0 → mathematischer Vorteil für den Spieler (+EV)
 * EV < 0 → Buchmacher-Vorteil (fast immer der Fall)
 * EV = -5 % ist typisch für Standardwetten
 */
export function assessFairValue(
  odds: number,
  oddsAgainst?: number | null
): FairValueResult {
  const impliedProbability = (1 / odds) * 100

  let bookmakerMargin: number | null = null
  let fairProbability: number

  if (oddsAgainst && oddsAgainst >= 1.01) {
    // Echte Marge aus beiden Quoten berechnen
    const overround = 1 / odds + 1 / oddsAgainst
    bookmakerMargin = (overround - 1) * 100
    fairProbability = (1 / odds / overround) * 100
  } else {
    // Konservative Schätzung: Standard-Marge 5 %
    fairProbability = impliedProbability / 1.05
  }

  // EV pro €1 Einsatz: fair_p × Netto-Gewinn − (1 − fair_p) × Verlust
  const fp = fairProbability / 100
  const expectedValue = fp * (odds - 1) - (1 - fp) * 1

  // Beschreibungstext mit Gegenquoten-Info
  const marginText =
    bookmakerMargin !== null
      ? `Buchmacher-Marge: ${bookmakerMargin.toFixed(1)} %`
      : "Marge geschätzt (ca. 5 %)"

  const evText =
    expectedValue >= 0
      ? `+${(expectedValue * 100).toFixed(1)} % EV — Vorteil für dich`
      : `${(expectedValue * 100).toFixed(1)} % EV — Vorteil für den Buchmacher`

  if (expectedValue > 0.02) {
    return {
      impliedProbability,
      fairProbability,
      bookmakerMargin,
      expectedValue,
      rating: "great",
      label: "Positiver EV",
      description: `${evText} · ${marginText}`,
    }
  }

  if (expectedValue >= -0.07) {
    return {
      impliedProbability,
      fairProbability,
      bookmakerMargin,
      expectedValue,
      rating: "fair",
      label: "Normaler EV",
      description: `${evText} · ${marginText}`,
    }
  }

  return {
    impliedProbability,
    fairProbability,
    bookmakerMargin,
    expectedValue,
    rating: "poor",
    label: "Schlechter EV",
    description: `${evText} · ${marginText}`,
  }
}

// ─── Satz des Dalhoffs ────────────────────────────────────────────────────────

export type DalhoffRating = "value" | "neutral" | "disadvantage"

export interface DalhoffResult {
  margin: number          // (sum 1/Qi) * taxFactor - 1
  marginPercent: number
  rating: DalhoffRating
  label: string
  description: string
}

/**
 * Satz des Dalhoffs:
 *   margin = (1/Q1 + 1/Q2 + ... + 1/Qn) * taxFactor − 1
 *
 *   < 0  → Spieler-Vorteil (Value Bet!)
 *   = 0  → Fairer Markt
 *   > 0  → Buchmacher-Vorteil
 *
 * Alle Quoten des Marktes übergeben (z. B. Sieg + Unentschieden + Niederlage).
 * taxFactor: z. B. 1.05 für 5 % Steuer.
 */
export function calculateDalhoff(
  quotes: number[],
  taxFactor = 1.0
): DalhoffResult {
  const sumInverse = quotes.reduce((sum, q) => sum + 1 / q, 0)
  const margin = sumInverse * taxFactor - 1
  const marginPercent = margin * 100

  let rating: DalhoffRating
  let label: string
  let description: string

  if (margin < -0.01) {
    rating = "value"
    label = "Value Bet!"
    description = `Spielervorteil: ${marginPercent.toFixed(2)} % — mathematischer Vorteil`
  } else if (margin <= 0.03) {
    rating = "neutral"
    label = "Fairer Markt"
    description = `Marge: ${marginPercent.toFixed(2)} % — nahe am fairen Wert`
  } else {
    rating = "disadvantage"
    label = "Buchmacher-Vorteil"
    description = `Marge: ${marginPercent.toFixed(2)} % — Buchmacher hat den Vorteil`
  }

  return { margin, marginPercent, rating, label, description }
}

// ─── Formatierung ─────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2)
}

// ─── Statistiken ──────────────────────────────────────────────────────────────

export function computeMemberStats(bets: Bet[]): MemberStats[] {
  const grouped = new Map<string, Bet[]>()
  for (const bet of bets) {
    const existing = grouped.get(bet.member_name) ?? []
    grouped.set(bet.member_name, [...existing, bet])
  }

  return Array.from(grouped.entries()).map(([member_name, memberBets]) => {
    const won = memberBets.filter((b) => b.status === "won").length
    const lost = memberBets.filter((b) => b.status === "lost").length
    const pending = memberBets.filter((b) => b.status === "pending").length
    const settled = won + lost
    const win_rate = settled > 0 ? (won / settled) * 100 : 0
    const total_staked = memberBets.reduce((sum, b) => sum + (b.stake ?? 0), 0)
    const total_payout = memberBets
      .filter((b) => b.status === "won")
      .reduce((sum, b) => sum + (b.potential_payout ?? 0), 0)
    const net_profit =
      total_payout -
      memberBets
        .filter((b) => b.status !== "pending")
        .reduce((sum, b) => sum + (b.stake ?? 0), 0)

    return {
      member_name,
      total_bets: memberBets.length,
      won,
      lost,
      pending,
      win_rate,
      total_staked,
      total_payout,
      net_profit,
    }
  })
}