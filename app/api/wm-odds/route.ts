import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// The Odds API – FIFA World Cup 2026 sport key (confirmed via /v4/sports)
const SPORT_KEY = "soccer_fifa_world_cup"
const BASE = "https://api.the-odds-api.com/v4"

const REGIONS = "eu,uk"
const MARKETS = "h2h" // head-to-head = 1X2

const BOOKMAKER_FILTER = ["tipico_de", "winamax_de", "betway"]
const BOOKMAKER_LABELS: Record<string, string> = {
  tipico_de: "Tipico",
  winamax_de: "Winamax",
  betway: "Betway",
}

const TTL_MS = 6 * 60 * 60 * 1000 // 6h cache – odds update slowly pre-match

export interface OddsBookmaker {
  name: string
  home: string | null
  draw: string | null
  away: string | null
}

export interface OddsPayload {
  bookmakers: OddsBookmaker[]
}

// Fuzzy team-name match: handles "United States" vs "USA" etc.
function namesMatch(a: string, b: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "")
  const na = norm(a)
  const nb = norm(b)
  return na === nb || na.includes(nb) || nb.includes(na)
}

async function fetchFromOddsApi(home: string, away: string): Promise<OddsPayload> {
  const key = process.env.ODDS_API_KEY
  if (!key) throw new Error("ODDS_API_KEY not set")

  // Fetch all upcoming events with odds in one request
  const url = `${BASE}/sports/${SPORT_KEY}/odds/?apiKey=${key}&regions=${REGIONS}&markets=${MARKETS}&oddsFormat=decimal`
  const res = await fetch(url, { next: { revalidate: 0 } })

  if (res.status === 401) throw new Error("ODDS_API_KEY ungültig")
  if (res.status === 422) throw new Error(`Sport key nicht verfügbar: ${SPORT_KEY}`)
  if (!res.ok) throw new Error(`The Odds API ${res.status}`)

  const events: {
    id: string
    home_team: string
    away_team: string
    bookmakers: {
      key: string
      title: string
      markets: {
        key: string
        outcomes: { name: string; price: number }[]
      }[]
    }[]
  }[] = await res.json()

  // Find the matching event
  const event = events.find(
    e => namesMatch(e.home_team, home) && namesMatch(e.away_team, away)
  )

  if (!event) return { bookmakers: [] }

  const bookmakers: OddsBookmaker[] = []

  for (const bm of event.bookmakers) {
    if (!BOOKMAKER_FILTER.includes(bm.key)) continue
    const h2h = bm.markets.find(m => m.key === "h2h")
    if (!h2h) continue

    const outcome = (name: string) => {
      const o = h2h.outcomes.find(o => namesMatch(o.name, name))
      return o ? o.price.toFixed(2) : null
    }

    bookmakers.push({
      name: BOOKMAKER_LABELS[bm.key] ?? bm.title,
      home: outcome(event.home_team),
      draw: outcome("Draw"),
      away: outcome(event.away_team),
    })
  }

  return { bookmakers }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const gameId = searchParams.get("game_id")
  const home = searchParams.get("home")
  const away = searchParams.get("away")

  if (!gameId || !home || !away) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 })
  }

  // Check Supabase cache first
  const { data: cached } = await supabase
    .from("wm_odds")
    .select("odds_data, fetched_at")
    .eq("game_id", gameId)
    .single()

  if (cached) {
    const age = Date.now() - new Date(cached.fetched_at).getTime()
    const data = cached.odds_data as OddsPayload
    // Invalidate old cache entries from api-football era (had fixture_id field, no real bookmakers)
    const isStale = age >= TTL_MS
    const isEmpty = !data.bookmakers || data.bookmakers.length === 0
    if (!isStale && !isEmpty) {
      return NextResponse.json({ ...data, cached: true })
    }
  }

  try {
    const payload = await fetchFromOddsApi(home, away)

    await supabase.from("wm_odds").upsert({
      game_id: gameId,
      odds_data: payload,
      fetched_at: new Date().toISOString(),
    })

    return NextResponse.json({ ...payload, cached: false })
  } catch (err) {
    if (cached) return NextResponse.json({ ...cached.odds_data, cached: true, stale: true })
    return NextResponse.json({ error: String(err) }, { status: 502 })
  }
}
