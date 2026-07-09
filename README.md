# Wett-Ticker 🎟️⚽

Wett-Ticker is a Progressive Web App for tracking sports bets, casino sessions, and betting-provider promotions within a small group of friends. Members log their tips, vote and comment on each other's picks, follow live World Cup 2026 odds and bracket results, and compare their performance on a shared stats dashboard — all in German, built for a private betting group.

## Features

- **Community bet feed** — log sport bets, casino sessions, or pure promo/info posts with odds, stake, provider, and tip; other members can upvote/downvote and comment on each entry
- **Live status tracking** — mark bets as pending, won, or lost, with automatic potential-payout calculation
- **Promotions tracker** — a dedicated feed for provider promos (free bets, odds boosts, cashback, deposit bonuses, etc.), including scheduled/recurring promos tied to specific weekdays
- **Stats dashboard** — per-member win rate, total staked, total payout, and net profit, visualized with charts
- **Kombi (accumulator) calculator** — combine multiple odds and stakes to work out combined odds and potential payout
- **World Cup 2026 bracket** — live tournament bracket view fed by an external World Cup data API
- **Live odds widget** — World Cup match odds pulled from The Odds API and cached, with Oddspedia widgets for live scores/competitions
- **Push notifications** — Web Push (VAPID) subscriptions so members get notified about new bets/results
- **Installable PWA** — manifest, icons, and service worker for an app-like experience on mobile home screens

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- **Styling/UI:** Tailwind CSS 4, shadcn/ui + Radix primitives, Framer Motion for animation
- **Backend/Data:** [Supabase](https://supabase.com) (Postgres) for bets, comments, votes, and push subscriptions
- **Forms/Validation:** React Hook Form + Zod
- **Charts:** Recharts
- **Push:** `web-push` (VAPID)
- **External APIs:** World Cup 26 games API (`worldcup26.ir`), [The Odds API](https://the-odds-api.com), Oddspedia embed widgets

## Getting Started

### Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A [Supabase](https://supabase.com) project (URL + anon key)
- (Optional) VAPID keys for push notifications — generate with `npx web-push generate-vapid-keys`
- (Optional) An [The Odds API](https://the-odds-api.com) key for live World Cup odds

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Web Push (optional — needed for notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:you@example.com

# Live odds (optional — needed for the World Cup odds widget)
ODDS_API_KEY=your-odds-api-key
```

### 3. Set up the database

Create the following tables in your Supabase project (matching the shapes in `lib/types.ts`): `bets`, `comments`, `votes`, and `push_subscriptions`. Enable Row Level Security policies as appropriate for your use case.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
app/                  Next.js App Router pages and API routes
  api/bets/            CRUD + voting + comments for bets
  api/stats/           Aggregated member statistics
  api/wm-games/        World Cup 2026 fixtures (cached proxy)
  api/wm-odds/         World Cup odds (cached proxy, Supabase-backed)
  api/push/            Push subscription management
components/            UI components (bet feed, forms, calculators, bracket, charts, etc.)
components/ui/         shadcn/ui primitives
hooks/                 Data-fetching and client hooks (bets, comments, actions, push, etc.)
lib/                   Types, constants, calculations, and the Supabase client setup
public/                PWA manifest, icons, and service worker
```

## Available Scripts

| Command         | Description                          |
|-----------------|---------------------------------------|
| `npm run dev`   | Start the development server          |
| `npm run build` | Build the app for production          |
| `npm run start` | Run the production build              |
| `npm run lint`  | Run ESLint                            |

## Deployment

This is a standard Next.js app and can be deployed to any platform that supports Next.js (e.g. [Vercel](https://vercel.com/new)). Make sure to configure the same environment variables in your hosting provider's dashboard.

## Notes

- The UI and data model (member names, categories, providers, etc.) are tailored to a private group of friends and are in German — feel free to adjust `lib/constants.ts` to fit your own group.
- The World Cup bracket and odds features are seasonal and tied to the 2026 FIFA World Cup.
