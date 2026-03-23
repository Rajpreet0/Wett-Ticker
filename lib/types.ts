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
  odds_against: number | null
  stake: number | null    // null bei reinen Aktionen ohne Einsatz
  tip: string
  event_datetime: string | null
  status: "pending" | "won" | "lost" | "info"  // info = reine Aktion ohne Wettstatus
  potential_payout: number | null
  upvotes: number
  downvotes: number
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
