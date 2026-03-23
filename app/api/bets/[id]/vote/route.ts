import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const voteSchema = z.object({
  type: z.enum(["up", "down"]),
  member_name: z.string().min(1),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const parsed = voteSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const supabase = await createClient()

  // Check if member already voted on this bet
  const { data: existing } = await supabase
    .from("votes")
    .select("id, type")
    .eq("bet_id", id)
    .eq("member_name", parsed.data.member_name)
    .single()

  if (existing) {
    if (existing.type === parsed.data.type) {
      // Same vote → undo (delete)
      await supabase.from("votes").delete().eq("id", existing.id)
    } else {
      // Different vote → switch
      await supabase
        .from("votes")
        .update({ type: parsed.data.type })
        .eq("id", existing.id)
    }
  } else {
    // New vote
    await supabase.from("votes").insert({
      bet_id: id,
      member_name: parsed.data.member_name,
      type: parsed.data.type,
    })
  }

  // Return updated counts
  const { data: votes } = await supabase
    .from("votes")
    .select("type")
    .eq("bet_id", id)

  const upvotes = votes?.filter((v) => v.type === "up").length ?? 0
  const downvotes = votes?.filter((v) => v.type === "down").length ?? 0

  return NextResponse.json({ upvotes, downvotes })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data: votes } = await supabase
    .from("votes")
    .select("type, member_name")
    .eq("bet_id", id)

  const upvotes = votes?.filter((v) => v.type === "up").length ?? 0
  const downvotes = votes?.filter((v) => v.type === "down").length ?? 0
  const voters = votes?.map((v) => ({ member: v.member_name, type: v.type })) ?? []

  return NextResponse.json({ upvotes, downvotes, voters })
}
