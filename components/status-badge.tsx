import { CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Bet } from "@/lib/types"

interface StatusBadgeProps {
  status: Bet["status"]
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "won") {
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Gewonnen
      </Badge>
    )
  }
  if (status === "lost") {
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
        <XCircle className="h-3 w-3" />
        Verloren
      </Badge>
    )
  }
  if (status === "info") {
    return (
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
        <Sparkles className="h-3 w-3" />
        Aktion
      </Badge>
    )
  }
  return (
    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1">
      <Clock className="h-3 w-3" />
      Offen
    </Badge>
  )
}