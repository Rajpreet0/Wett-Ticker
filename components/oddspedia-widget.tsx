"use client"

import { useEffect, useRef } from "react"

interface OddspediaWidgetProps {
  matchId: string
  width?: string
  theme?: "0" | "1"
  language?: string
  primaryColor?: string
  accentColor?: string
}

declare global {
  interface Window {
    [key: string]: unknown
  }
}

export function OddspediaWidget({
  matchId,
  width = "360",
  theme = "0",
  language = "de",
  primaryColor = "#283E5B",
  accentColor = "#00B1FF",
}: OddspediaWidgetProps) {
  const widgetKey = `oddspediaWidgetMatchCenter${matchId}`
  const containerId = `oddspedia-widget-match-center-${matchId}`
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    // Set the config object before the script loads
    window[widgetKey] = {
      api_token: "f2f623499b8cae0a94db8fc96b807bab871aeff54d0e2f401ebf12248dab",
      match_id: matchId,
      type: "match-center",
      domain: "wett-ticker.vercel.app/",
      selector: containerId,
      width,
      theme,
      odds_type: "1",
      language,
      primary_color: primaryColor,
      primary_color_opacity: "0.9",
      secondary_color: "#53647B",
      accent_color: accentColor,
      font: "Roboto",
      logos: "true",
      image: "true",
      best_odds: "true",
      header: "false",
      odds: "true",
      featured_bookie: "0",
      limitVisibleOperators: "15",
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-oddspedia-widget="${widgetKey}"]`
    )
    if (existing) {
      existing.remove()
    }

    const script = document.createElement("script")
    script.src = `https://widgets.oddspedia.com/js/widget/init.js?widgetId=${widgetKey}`
    script.async = true
    script.setAttribute("data-oddspedia-widget", widgetKey)
    document.body.appendChild(script)
    scriptRef.current = script

    return () => {
      scriptRef.current?.remove()
      delete window[widgetKey]
    }
  }, [matchId, widgetKey, containerId, width, theme, language, primaryColor, accentColor])

  return (
    <div id={containerId} className="w-full" />
  )
}
