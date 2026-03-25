"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { de } from "date-fns/locale"
import { MessageSquare, Send, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react"
import { useComments } from "@/hooks/use-comments"

interface BetCommentSectionProps {
  betId: string
}

const MEMBER_COLORS: Record<string, string> = {
  Raj:   "bg-blue-500",
  Ben:   "bg-emerald-500",
  Aime:  "bg-violet-500",
  Felix: "bg-orange-500",
}

function getColor(name: string) {
  return MEMBER_COLORS[name] ?? "bg-zinc-500"
}

// Inner component — only mounts when open, so useComments only fetches then
function CommentBody({ betId }: { betId: string }) {
  const [input, setInput] = useState("")
  const [name, setName] = useState(() => localStorage.getItem("wett-comment-name") ?? "")
  const [isSending, setIsSending] = useState(false)
  const { comments, isLoading, error, addComment } = useComments(betId)

  async function handleSend() {
    const text = input.trim()
    const author = name.trim() || "Anonym"
    if (!text || isSending) return
    localStorage.setItem("wett-comment-name", author)
    setIsSending(true)
    setInput("")
    await addComment(author, text)
    setIsSending(false)
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-destructive/80 py-2">
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Kommentare nicht verfügbar — bitte DB-Migration ausführen</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Comment list */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getColor(c.member_name)}`}
              >
                {c.member_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold">{c.member_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { locale: de, addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-foreground/75 mt-0.5 wrap-break-word leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-1">Noch keine Kommentare</p>
      )}

      {/* Input row */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dein Name (optional)"
          maxLength={40}
          className="w-full text-xs bg-muted/40 border border-border/50 rounded-full px-3 py-1.5 outline-none focus:border-primary/60 placeholder:text-muted-foreground transition-colors"
        />
        <div className="flex gap-2 items-center">
          <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${getColor(name.trim() || "Anonym")}`}>
            {(name.trim() || "A").charAt(0).toUpperCase()}
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Kommentar schreiben…"
            maxLength={1000}
            className="flex-1 text-xs bg-muted/50 border border-border/60 rounded-full px-3 py-1.5 outline-none focus:border-primary/60 placeholder:text-muted-foreground transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="shrink-0 w-7 h-7 rounded-full bg-primary/15 hover:bg-primary/25 flex items-center justify-center text-primary disabled:opacity-40 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function BetCommentSection({ betId }: BetCommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="border-t border-border/20 pt-3">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        <span>Kommentare</span>
        {isOpen
          ? <ChevronUp className="h-3 w-3 ml-auto" />
          : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {isOpen && (
        <div className="mt-3">
          <CommentBody betId={betId} />
        </div>
      )}
    </div>
  )
}
