import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BetList } from "@/components/bet-list"
import { BetForm } from "@/components/bet-form"
import { StatsPanel } from "@/components/stats-panel"
import { StatsChart } from "@/components/stats-chart"
import { NotificationToggle } from "@/components/notification-toggle"
import { ActionList } from "@/components/action-list"
import { KombiCalculator } from "@/components/kombi-calculator"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 pb-3 border-b border-border/50 bg-card/95 backdrop-blur-md" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
        <div>
          <h1 className="font-bold text-base leading-none tracking-tight">Wett-Ticker</h1>
          <p className="text-[11px] text-muted-foreground  mt-0.5">Community Tipps</p>
        </div>
        <NotificationToggle />
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-4" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <Tabs defaultValue="tipps">
          <TabsList className="w-full mb-5 h-9">
            <TabsTrigger value="tipps" className="flex-1 text-[11px] font-medium">Tipps</TabsTrigger>
            <TabsTrigger value="aktionen" className="flex-1 text-[11px] font-medium">Aktionen</TabsTrigger>
            <TabsTrigger value="statistiken" className="flex-1 text-[11px] font-medium">Stats</TabsTrigger>
            <TabsTrigger value="kombi" className="flex-1 text-[11px] font-medium">Rechner</TabsTrigger>
            <TabsTrigger value="eintragen" className="flex-1 text-[11px] font-bold">+</TabsTrigger>
          </TabsList>

          <TabsContent value="tipps">
            <BetList />
          </TabsContent>

          <TabsContent value="aktionen">
            <ActionList />
          </TabsContent>

          <TabsContent value="statistiken" className="space-y-6">
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Gewinn / Verlust Übersicht
              </h2>
              <StatsChart />
            </div>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Detaillierte Statistiken
              </h2>
              <StatsPanel />
            </div>
          </TabsContent>

          <TabsContent value="kombi">
            <KombiCalculator />
          </TabsContent>

          <TabsContent value="eintragen">
            <BetForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
