import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ServiceWorkerRegistrar } from "@/components/service-worker-registrar"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Wett-Ticker",
  description: "Community Wett-Tipps für die Gruppe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Wett-Ticker",
    startupImage: [
      // iPhone 16 Pro Max
      {
        url: "/icons/splash-1320x2868.png",
        media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 16 Pro
      {
        url: "/icons/splash-1206x2622.png",
        media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro Max / 15 Plus / 15 Pro Max
      {
        url: "/icons/splash-1290x2796.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 Pro / 15 / 15 Pro
      {
        url: "/icons/splash-1179x2556.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone 14 / 13 / 12
      {
        url: "/icons/splash-1170x2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      // iPhone SE 3rd gen
      {
        url: "/icons/splash-750x1334.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  icons: {
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-96.png",  sizes: "96x96",   type: "image/png" },
    ],
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ServiceWorkerRegistrar />
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
