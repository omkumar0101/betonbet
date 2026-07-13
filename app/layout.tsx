import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletProvider } from "@/components/wallet-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteSidebar } from "@/components/site-sidebar"
import { BottomNavigation } from "@/components/bottom-navigation"
import { SiteFooter } from "@/components/site-footer"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Oddiq",
  description: "Play provably fair casino games and win ETH on Robinhood Chain with Oddiq",
  icons: {
    icon: "/images/oddiq-logo.png",
    shortcut: "/images/oddiq-logo.png",
    apple: "/images/oddiq-logo.png",
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${inter.className} min-h-screen flex flex-col relative antialiased`}
        style={{
          background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(0,0,0,0.5) 200%)",
        }}
      >
        <WalletProvider>
          <div className="flex flex-col min-h-screen relative z-10">
            <SiteHeader />
            <div className="flex flex-1 pt-16">
              <SiteSidebar />
              <main className="flex-1 overflow-hidden md:ml-64">
                <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide p-4 md:p-6 lg:p-8 pb-32">
                  <div className="page-transition">{children}</div>
                  <SiteFooter />
                </div>
              </main>
            </div>
            <BottomNavigation />
          </div>
        </WalletProvider>
      </body>
    </html>
  )
}
