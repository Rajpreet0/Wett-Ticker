import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { sendPushToAll } from "@/lib/push-notifications"

const betSchema = z.object({
  member_name: z.string().min(1),
  category: z.enum(["sport", "casino", "action"]).default("sport"),
  sport: z.string().default(""),
  match_name: z.string().min(1),
  provider: z.string().min(1),
  bet_type: z.string().default(""),
  action_type: z.string().default(""),
  odds: z.number().min(1.01).nullable().optional(),
  odds_draw: z.number().min(1.01).nullable().optional(),
  odds_against: z.number().min(1.01).nullable().optional(),
  stake: z.number().min(0.01).nullable().optional(),
  tip: z.string().min(1),
  event_datetime: z.string().optional().transform((v) => v === "" ? null : (v ?? null)),
  action_start_date: z.string().optional().transform((v) => v === "" ? null : (v ?? null)),
  action_end_date: z.string().optional().transform((v) => v === "" ? null : (v ?? null)),
  action_montags_only: z.boolean().nullable().optional(),
  action_weekdays: z.string().optional().transform((v) => v === "" ? null : (v ?? null)),
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
      { error: parsed.error.issues },
      { status: 400 }
    )
  }

  // Reine Aktionen bekommen status "info" statt "pending"
  const insertData = {
    ...parsed.data,
    status: parsed.data.category === "action" ? "info" : "pending",
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("bets")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Push notification
  const categoryLabel =
    parsed.data.category === "casino"
      ? "Casino"
      : parsed.data.category === "action"
      ? "Aktion"
      : "Sport"
  const oddsText =
    parsed.data.odds != null ? ` @ ${parsed.data.odds}` : ""
  sendPushToAll({
    title: `Neue ${categoryLabel} von ${parsed.data.member_name}`,
    body: `${parsed.data.match_name}${oddsText} (${parsed.data.provider})`,
    url: "/",
  }).catch(console.error)

  return NextResponse.json(data, { status: 201 })
}
