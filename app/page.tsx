"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Target, Gift, BarChart3, Calculator, Plus, Trophy, Menu, X } from "lucide-react"
import { BetList } from "@/components/bet-list"
import { BetForm } from "@/components/bet-form"
import { StatsPanel } from "@/components/stats-panel"
import { StatsChart } from "@/components/stats-chart"
import { NotificationToggle } from "@/components/notification-toggle"
import { ActionList } from "@/components/action-list"
import { KombiCalculator } from "@/components/kombi-calculator"
import { WmBracket } from "@/components/wm-bracket"

const TABS = [
  { id: "tipps",       label: "Tipps",    Icon: Target,      desc: "Community Tipps"    },
  { id: "aktionen",    label: "Aktionen", Icon: Gift,        desc: "Aktionen & Boni"    },
  { id: "statistiken", label: "Stats",    Icon: BarChart3,   desc: "Statistiken"        },
  { id: "kombi",       label: "Rechner",  Icon: Calculator,  desc: "Kombi-Rechner"      },
  { id: "wm",          label: "WM Baum",  Icon: Trophy,      desc: "WM 2026 Bracket"    },
  { id: "eintragen",   label: "Neu",      Icon: Plus,        desc: "Tipp eintragen"     },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("tipps")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeTabData = TABS.find((t) => t.id === activeTab)!

  function navigate(id: TabId) {
    setActiveTab(id)
    setSidebarOpen(false)
  }

  return (
    <>
      <div
        className="flex flex-col min-h-screen max-w-xl mx-auto w-full relative"
        style={{
          background: [
            "radial-gradient(ellipse 85% 50% at -8% 0%,   rgba(26,140,46,0.30)  0%, transparent 58%)",
            "radial-gradient(ellipse 75% 45% at 110% 22%, rgba(29,93,254,0.24)  0%, transparent 55%)",
            "radial-gradient(ellipse 65% 40% at 55% 98%,  rgba(255,215,0,0.16)  0%, transparent 55%)",
            "radial-gradient(ellipse 50% 35% at -5% 70%,  rgba(212,32,32,0.12)  0%, transparent 55%)",
            "#060d14",
          ].join(", "),
        }}
      >
        {/* ── Header ── */}
        <motion.header
          initial={{ y: -28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          className="sticky top-0 z-20 flex items-center justify-between px-4 pb-3 border-b border-border/40 backdrop-blur-xl"
          style={{
            paddingTop: "max(0.75rem, env(safe-area-inset-top))",
            background: "linear-gradient(180deg, rgba(6,13,20,0.95) 0%, rgba(6,13,20,0.85) 100%)",
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="shrink-0"
            >
              <Image
                src="/icons/image.png"
                alt="WM Pokal 2026"
                width={20}
                height={20}
                className="rounded-xl object-cover"
                priority
              />
            </motion.div>

            <div>
              <motion.h1
                className="font-black text-xl leading-none tracking-tight"
                style={{
                  background: "linear-gradient(90deg, #1a8c2e 0%, #1d5dfe 35%, #FFD700 60%, #1a8c2e 100%)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              >
                Wett-Ticker
              </motion.h1>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "#1a8c2e" }} />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#1a8c2e" }} />
                </span>
                <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
                  {activeTabData.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase"
              style={{
                background: "linear-gradient(135deg, rgba(255,215,0,0.14), rgba(26,140,46,0.12))",
                border: "1px solid rgba(255,215,0,0.30)",
                color: "#FFD700",
              }}
            >
              WM 2026
            </motion.div>
            <NotificationToggle />

            {/* Hamburger */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9 flex items-center justify-center rounded-xl p-2"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
              aria-label="Navigation öffnen"
            >
              <Menu className="h-5 w-5" style={{ color: "#8899aa" }} />
            </motion.button>
          </div>
        </motion.header>

        {/* ── Main ── */}
        <main
          className="flex-1 flex flex-col px-4 pt-4"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="flex-1"
            >
              {activeTab === "tipps"       && <BetList />}
              {activeTab === "aktionen"    && <ActionList />}
              {activeTab === "statistiken" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <BarChart3 className="h-3.5 w-3.5" style={{ color: "#1a8c2e" }} />
                      Gewinn / Verlust
                    </h2>
                    <StatsChart />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <Target className="h-3.5 w-3.5" style={{ color: "#FFD700" }} />
                      Detaillierte Statistiken
                    </h2>
                    <StatsPanel />
                  </div>
                </div>
              )}
              {activeTab === "kombi" && <KombiCalculator />}
              {activeTab === "wm"    && <WmBracket />}
              {activeTab === "eintragen" && <BetForm />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Sidebar Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar panel */}
            <motion.nav
              key="sidebar"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 flex flex-col w-64"
              style={{
                background: "linear-gradient(180deg, rgba(6,13,20,0.98) 0%, rgba(8,18,28,0.98) 100%)",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "max(env(safe-area-inset-top), 1.25rem)",
                paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)",
              }}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-5 pb-5 border-b border-border/30">
                <div>
                  <p className="font-black text-sm leading-none" style={{ color: "#4ade80" }}>
                    Wett-Ticker
                  </p>
                  <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase mt-0.5">
                    WM 2026
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.90 }}
                  onClick={() => setSidebarOpen(false)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg p-2"
                  
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto px-3 pt-4 space-y-1">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  const Icon = tab.Icon
                  return (
                    <motion.button
                      key={tab.id}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(tab.id)}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-colors"
                      style={isActive ? {
                        background: "linear-gradient(135deg, rgba(26,140,46,0.22) 0%, rgba(29,93,254,0.12) 100%)",
                        border: "1px solid rgba(26,140,46,0.38)",
                      } : {
                        border: "1px solid transparent",
                      }}
                    >
                      <div
                        className="h-10 w-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: isActive ? "rgba(26,140,46,0.25)" : "rgba(255,255,255,0.05)",
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: isActive ? "#4ade80" : "#4a5a7a" }}
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold leading-none"
                          style={{ color: isActive ? "#e2f7e8" : "#6b7a9a" }}
                        >
                          {tab.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-none">
                          {tab.desc}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          layoutId="sidebarActiveDot"
                          className="ml-auto h-1.5 w-1.5 rounded-full"
                          style={{ background: "#4ade80" }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-5 pt-4 border-t border-border/30">
                <p className="text-[10px] text-muted-foreground/40 text-center">
                  WM 2026 · Kanada · USA · Mexiko
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
