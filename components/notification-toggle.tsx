"use client"

import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePushSubscription } from "@/hooks/use-push-subscription"

interface NotificationToggleProps {
  memberName?: string
}

export function NotificationToggle({ memberName }: NotificationToggleProps) {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } =
    usePushSubscription(memberName)

  if (!isSupported) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={isLoading}
      title={
        isSubscribed
          ? "Benachrichtigungen deaktivieren"
          : "Benachrichtigungen aktivieren"
      }
    >
      {isSubscribed ? (
        <Bell className="h-5 w-5 text-primary" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
    </Button>
  )
}
