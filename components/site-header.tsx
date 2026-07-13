"use client"

import Link from "next/link"
import Image from "next/image"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Menu, Search, Wallet2 } from "lucide-react"
import { useState } from "react"
import { useWallet } from "@/components/wallet-provider"

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isConnected, balance } = useWallet()

  return (
    <header className="fixed top-0 z-[9999] w-full bg-[#16141f]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="w-full max-w-none flex h-16 items-center justify-between gap-3 px-2 md:px-4">
        {/* Left - Logo + Menu */}
        <div className="flex items-center gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-lg md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/" className="flex items-center group">
            <Image
              src="/images/oddiq-logo.png"
              alt="OddQ Logo"
              width={200}
              height={80}
              className="h-20 w-auto object-contain drop-shadow-[0_0_24px_rgba(168,85,247,0.9)]"
            />
          </Link>
        </div>

        {/* Center - Search (desktop) */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search games"
              className="w-full rounded-full border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40 focus-visible:ring-yellow-400/50"
            />
          </div>
        </div>

        {/* Right - Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isConnected && (
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <Wallet2 className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-semibold text-white">{Number(balance).toFixed(4)} ETH</span>
            </div>
          )}

          <a
            href="https://x.com/oddiqdotfun"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:block text-white/60 hover:text-white transition-colors duration-300 font-medium text-sm"
          >
            X
          </a>

          {/* Wallet Button */}
          <WalletButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-[#16141f] border-b border-white/10 shadow-lg z-50">
          <div className="flex flex-col p-4 space-y-1">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                placeholder="Search games"
                className="w-full rounded-full border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-white/40"
              />
            </div>
            {[
              { href: "/", label: "Home" },
              { href: "/promotions", label: "Promotions" },
              { href: "/vip", label: "VIP Club" },
              { href: "/affiliate", label: "Affiliate" },
              { href: "/provably-fair", label: "Provably Fair" },
              { href: "/support", label: "Support" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://x.com/oddiqdotfun"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors duration-300 font-medium py-2 px-4 rounded-lg hover:bg-white/5"
            >
              X
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
