import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
  member_name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = subscribeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(parsed.data, { onConflict: "endpoint" })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
