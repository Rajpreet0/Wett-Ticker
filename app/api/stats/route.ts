import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { computeMemberStats } from "@/lib/calculations"
import type { Bet } from "@/lib/types"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from("bets").select("*")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const stats = computeMemberStats((data as Bet[]) ?? [])
  return NextResponse.json(stats)
}
