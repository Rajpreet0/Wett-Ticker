import webpush from "web-push"
import { createClient } from "./supabase/server"

interface PushPayload {
  title: string
  body: string
  url?: string
}

function initVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
}

export async function sendPushToAll(payload: PushPayload) {
  initVapid()
  const supabase = await createClient()
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")

  if (error || !subscriptions) return

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        )
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          // Subscription expired — remove it
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint)
        }
      }
    })
  )

  return results
}
