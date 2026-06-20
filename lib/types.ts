export type PostCategory = "sport" | "casino" | "action"

export interface Bet {
  id: string
  created_at: string
  member_name: string
  category: PostCategory
  sport: string           // Sportart / Casino-Spiel / leer bei reiner Aktion
  match_name: string      // Spiel / Event / Aktionsname
  provider: string
  bet_type: string        // Wett-Typ (sport) oder Aktions-Typ (casino/action)
  action_type: string     // Anbieter-Aktion: Freiwette, Boost, etc.
  odds: number | null     // null bei reinen Aktionen ohne Quote
  odds_draw: number | null // 3. Quote für 1X2 (Unentschieden)
  odds_against: number | null
  stake: number | null    // null bei reinen Aktionen ohne Einsatz
  tip: string
  event_datetime: string | null
  status: "pending" | "won" | "lost" | "info"  // info = reine Aktion ohne Wettstatus
  potential_payout: number | null
  upvotes: number
  downvotes: number
  // Action scheduling
  action_start_date: string | null
  action_end_date: string | null
  action_montags_only: boolean | null   // legacy, use action_weekdays
  action_weekdays: string | null        // comma-separated JS day numbers e.g. "1,3,5" = Mon/Wed/Fri
  rating?: number | null                // 1–5 Sterne Bewertung (optional)
}

export interface Comment {
  id: string
  bet_id: string
  member_name: string
  content: string
  created_at: string
}

export interface MemberStats {
  member_name: string
  total_bets: number
  won: number
  lost: number
  pending: number
  win_rate: number
  total_staked: number
  total_payout: number
  net_profit: number
}

export interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
  member_name?: string
}
