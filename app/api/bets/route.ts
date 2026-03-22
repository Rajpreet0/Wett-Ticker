import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { sendPushToAll } from "@/lib/push-notifications"

const betSchema = z.object({
  member_name: z.string().min(1),
  category: z.enum(["sport", "casino"]).default("sport"),
  sport: z.string().min(1),
  match_name: z.string().min(1),
  provider: z.string().min(1),
  bet_type: z.string().min(1),
  action_type: z.string().default(""),
  odds: z.number().min(1.01),
  stake: z.number().min(0.01),
  tip: z.string().min(1),
  event_datetime: z.string().min(1),
})

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = betSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bets")
    .insert(parsed.data)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Fire push notifications (non-blocking)
  const emoji = parsed.data.category === "casino" ? "🎰" : "⚽"
  const actionLabel = parsed.data.action_type ? ` · ${parsed.data.action_type}` : ""
  sendPushToAll({
    title: `${emoji} Neue Aktion von ${parsed.data.member_name}!`,
    body: `${parsed.data.match_name} @ ${parsed.data.odds} (${parsed.data.provider}${actionLabel})`,
    url: "/",
  }).catch(console.error)

  return NextResponse.json(data, { status: 201 })
}
