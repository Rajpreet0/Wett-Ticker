"use client"

import { useEffect, useState } from "react"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushSubscription(memberName?: string) {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true)

      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setRegistration(reg)
          return reg.pushManager.getSubscription()
        })
        .then((sub) => {
          setIsSubscribed(!!sub)
        })
        .catch(console.error)
    }
  }, [])

  async function subscribe() {
    if (!registration) return
    setIsLoading(true)

    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      const json = subscription.toJSON()

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
          member_name: memberName,
        }),
      })

      setIsSubscribed(true)
    } catch (err) {
      console.error("Push subscription failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    if (!registration) return
    setIsLoading(true)

    try {
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })
        await subscription.unsubscribe()
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error("Push unsubscription failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSupported, isSubscribed, isLoading, subscribe, unsubscribe }
}
