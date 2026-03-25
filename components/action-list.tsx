"use client"

import { useState } from "react"
import { Loader2, Zap, Archive } from "lucide-react"
import { useActions } from "@/hooks/use-actions"
import { ActionCard } from "./action-card"
import { PullToRefresh } from "./pull-to-refresh"

export function ActionList() {
  const { allActions, activeActions, isLoading, refresh } = useActions()
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? allActions : activeActions

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="space-y-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
              <Zap className="h-3.5 w-3.5" />
              {activeActions.length} aktiv heute
            </span>
            {allActions.length > activeActions.length && (
              <span className="text-xs text-muted-foreground">
                · {allActions.length} gesamt
              </span>
            )}
          </div>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Archive className="h-3 w-3" />
            {showAll ? "Nur aktive" : "Alle anzeigen"}
          </button>
        </div>

        {/* Empty state */}
        {displayed.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Zap className="h-10 w-10 opacity-40" />
            <p className="text-sm">
              {showAll ? "Keine Aktionen eingetragen" : "Keine aktiven Aktionen heute"}
            </p>
            {!showAll && allActions.length > 0 && (
              <button
                onClick={() => setShowAll(true)}
                className="text-xs text-amber-400 underline"
              >
                Alle {allActions.length} Aktionen anzeigen
              </button>
            )}
          </div>
        )}

        {/* Action cards */}
        <div className="space-y-3">
          {displayed.map((action) => (
            <ActionCard key={action.id} action={action} />
          ))}
        </div>
      </div>
    </PullToRefresh>
  )
}
