"use client"

import { Gift, RefreshCcw, Users2, Sparkles } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"

const PROMOS = [
  {
    icon: RefreshCcw,
    title: "Weekly Cashback",
    description: "Get a percentage of your net losses back every week, credited automatically to your wallet.",
    tag: "Active",
  },
  {
    icon: Sparkles,
    title: "First Bet Boost",
    description: "New wallets get a bonus multiplier applied to their very first settled bet on any Original.",
    tag: "New",
  },
  {
    icon: Users2,
    title: "Refer a Friend",
    description: "Share your affiliate link and earn a share of the house edge from everyone you refer.",
    tag: "Ongoing",
  },
]

export default function PromotionsPage() {
  const { isConnected, connect } = useWallet()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />
      <div className="mb-6 flex items-center gap-3">
        <Gift className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-sm text-white/60">Rewards for playing on Oddiq</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROMOS.map((promo) => (
          <div key={promo.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center justify-between">
              <promo.icon className="h-6 w-6 text-yellow-400" />
              <span className="rounded-md bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-300">
                {promo.tag}
              </span>
            </div>
            <h3 className="font-bold text-white">{promo.title}</h3>
            <p className="mt-1.5 text-sm text-white/60">{promo.description}</p>
          </div>
        ))}
      </div>

      {!isConnected && (
        <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5 text-center">
          <p className="text-sm text-white/70">Connect your wallet to start earning rewards.</p>
          <Button onClick={connect} className="mt-3 bg-yellow-400 text-black hover:bg-yellow-300">
            Connect Wallet
          </Button>
        </div>
      )}
    </div>
  )
}
