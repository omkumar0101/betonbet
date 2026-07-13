"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Home,
  Gift,
  Crown,
  Share2,
  ShieldCheck,
  Map,
  FileCode,
  LifeBuoy,
} from "lucide-react"
import { ContractModal } from "@/components/contract-modal"

export function SiteSidebar() {
  const pathname = usePathname()
  const [contractModalOpen, setContractModalOpen] = useState(false)

  const isActive = (path: string) => pathname === path

  const gameItems = [
    {
      href: "/colours",
      label: "Colours",
      gifUrl:
        "/images/games/colours.png",
      isNew: true,
    },
    {
      href: "/coinflip",
      label: "Coinflip",
      gifUrl:
        "/images/games/coinflip.png",
    },
    {
      href: "/dice",
      label: "Dice",
      gifUrl:
        "/images/games/dice.png",
    },
    {
      href: "/limbo",
      label: "Limbo",
      gifUrl:
        "/images/games/limbo.png",
    },
    {
      href: "/plinko",
      label: "Plinko",
      gifUrl:
        "/images/games/plinko.png",
    },
  ]

  const rewardItems = [
    { href: "/promotions", label: "Promotions", icon: Gift },
    { href: "/vip", label: "VIP Club", icon: Crown },
    { href: "/affiliate", label: "Affiliate", icon: Share2 },
  ]

  const infoItems = [
    { href: "/provably-fair", label: "Provably Fair", icon: ShieldCheck },
    { href: "/roadmap", label: "Roadmap", icon: Map },
    { href: "/support", label: "Support", icon: LifeBuoy },
  ]

  const NavRow = ({
    active,
    onClick,
    href,
    children,
  }: {
    active: boolean
    onClick?: () => void
    href?: string
    children: React.ReactNode
  }) => {
    const className = `w-full flex items-center justify-start rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer text-sm font-semibold ${
      active ? "bg-white/10 text-yellow-300" : "text-white/70 hover:text-white hover:bg-white/5"
    }`
    if (href) {
      return (
        <Link href={href} className="w-full">
          <div className={className}>{children}</div>
        </Link>
      )
    }
    return (
      <button onClick={onClick} className={className + " text-left"}>
        {children}
      </button>
    )
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-[#16141f] border-r border-white/10 shadow-lg fixed top-16 left-0 z-10 h-[calc(100vh-4rem)]">
      <div className="flex flex-col gap-6 p-3 h-full overflow-y-auto scrollbar-hide">
        {/* Casino */}
        <div className="space-y-1">
          <NavRow active={isActive("/")} href="/">
            <Home className="mr-3 h-4 w-4" />
            Home
          </NavRow>
        </div>

        {/* Originals */}
        <div>
          <h2 className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">Originals</h2>
          <div className="space-y-1">
            {gameItems.map((item) => {
              const active = isActive(item.href)
              return (
                <div key={item.href} className="relative">
                  <Link href={item.href} className="w-full">
                    <div
                      className={`w-full flex items-center justify-start rounded-lg px-2.5 py-2 transition-all duration-200 group cursor-pointer ${
                        active ? "bg-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div className="mr-3 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-110">
                        <img src={item.gifUrl} alt={item.label} className="h-full w-full object-cover" />
                      </div>
                      <span className={`text-sm font-semibold ${active ? "text-yellow-300" : "text-white/80"}`}>
                        {item.label}
                      </span>
                      {item.isNew && (
                        <span className="ml-auto rounded bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          NEW
                        </span>
                      )}
                    </div>
                  </Link>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-yellow-400 rounded-r-full" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Rewards */}
        <div>
          <h2 className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">Rewards</h2>
          <div className="space-y-1">
            {rewardItems.map((item) => (
              <NavRow key={item.href} active={isActive(item.href)} href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </NavRow>
            ))}
          </div>
        </div>

        {/* Info / wallet tools */}
        <div>
          <h2 className="px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-white/40">Platform</h2>
          <div className="space-y-1">
            {infoItems.map((item) => (
              <NavRow key={item.href} active={isActive(item.href)} href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </NavRow>
            ))}
            <NavRow active={false} onClick={() => setContractModalOpen(true)}>
              <FileCode className="mr-3 h-4 w-4" />
              Contract
            </NavRow>
          </div>
        </div>

        <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-3 text-[11px] text-white/40">
          Play responsibly. 18+
        </div>
      </div>

      <ContractModal open={contractModalOpen} onOpenChange={setContractModalOpen} />
    </aside>
  )
}
