import { NextResponse } from "next/server"

const UPSTREAM = "https://worldcup26.ir/get/games"
const CACHE_TTL = 5 * 60 // 5 Minuten in Sekunden

// In-memory cache – überlebt Hot-Reloads nicht, reicht für Produktion
let cached: { data: unknown; expiresAt: number } | null = null

export async function GET() {
  if (cached && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: { "X-Cache": "HIT", "Cache-Control": `public, max-age=${CACHE_TTL}` },
    })
  }

  try {
    const res = await fetch(UPSTREAM, { next: { revalidate: CACHE_TTL } })
    if (!res.ok) throw new Error(`Upstream ${res.status}`)
    const data = await res.json()
    cached = { data, expiresAt: Date.now() + CACHE_TTL * 1000 }
    return NextResponse.json(data, {
      headers: { "X-Cache": "MISS", "Cache-Control": `public, max-age=${CACHE_TTL}` },
    })
  } catch (err) {
    if (cached) {
      // Veraltete Daten lieber als Fehler
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "STALE", "Cache-Control": "no-store" },
      })
    }
    return NextResponse.json({ error: "Upstream nicht erreichbar" }, { status: 502 })
  }
}
