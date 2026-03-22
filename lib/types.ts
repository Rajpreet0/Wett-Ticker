export interface Bet {
  id: string
  created_at: string
  member_name: string
  category: "sport" | "casino"
  sport: string           // Sportart (bei sport) oder Casino-Spiel (bei casino)
  match_name: string      // Spiel / Event / Aktionsname
  provider: string
  bet_type: string        // Wett-Typ (sport) oder Aktions-Typ (casino/aktion)
  action_type: string     // Anbieter-Aktion: Freiwette, Boost, etc.
  odds: number
  stake: number
  tip: string
  event_datetime: string
  status: "pending" | "won" | "lost"
  potential_payout: number
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