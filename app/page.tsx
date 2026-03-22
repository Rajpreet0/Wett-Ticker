import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BetList } from "@/components/bet-list"
import { BetForm } from "@/components/bet-form"
import { StatsPanel } from "@/components/stats-panel"
import { StatsChart } from "@/components/stats-chart"
import { NotificationToggle } from "@/components/notification-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen max-w-xl mx-auto w-full">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div>
          <h1 className="font-bold text-lg leading-none">Wett-Ticker 🎯</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Community Tipps</p>
        </div>
        <NotificationToggle />
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-4">
        <Tabs defaultValue="tipps">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="tipps" className="flex-1">
              Tipps
            </TabsTrigger>
            <TabsTrigger value="statistiken" className="flex-1">
              Statistiken
            </TabsTrigger>
            <TabsTrigger value="eintragen" className="flex-1">
              + Eintragen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tipps">
            <BetList />
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

          <TabsContent value="eintragen">
            <BetForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
