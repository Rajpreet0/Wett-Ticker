"use client"

import { useEffect, useRef } from "react"

const WIDGET_KEY = "oddspediaWidgetCompetitionLeague3"
const CONTAINER_ID = "oddspedia-widget-competition-league-3"

export function OddspediaCompetitionWidget() {
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  useEffect(() => {
    window[WIDGET_KEY] = {
      api_token: "f2f623499b8cae0a94db8fc96b807bab871aeff54d0e2f401ebf12248dab",
      type: "competition",
      domain: "wett-ticker.vercel.app/",
      selector: CONTAINER_ID,
      width: "0",
      theme: "0",
      odds_type: "1",
      language: "de",
      primary_color: "#0369C7",
      accent_color: "#000000",
      font: "Roboto",
      league_id: "3",
      limit: "50",
      show_odds: "true",
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-oddspedia-widget="${WIDGET_KEY}"]`
    )
    existing?.remove()

    const script = document.createElement("script")
    script.src = `https://widgets.oddspedia.com/js/widget/init.js?widgetId=${WIDGET_KEY}`
    script.async = true
    script.setAttribute("data-oddspedia-widget", WIDGET_KEY)
    document.body.appendChild(script)
    scriptRef.current = script

    return () => {
      scriptRef.current?.remove()
      delete window[WIDGET_KEY]
    }
  }, [])

  return <div id={CONTAINER_ID} className="w-full" />
}
