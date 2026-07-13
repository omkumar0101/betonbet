"use client"

import { Crown } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"

const TIERS = [
  { name: "Bronze", requirement: "Start wagering", cashback: "2%", color: "from-amber-700 to-amber-900" },
  { name: "Silver", requirement: "Consistent weekly activity", cashback: "5%", color: "from-slate-400 to-slate-600" },
  { name: "Gold", requirement: "High-volume players", cashback: "8%", color: "from-yellow-400 to-yellow-600" },
  { name: "Diamond", requirement: "Invite-only", cashback: "12%", color: "from-cyan-300 to-blue-500" },
]

export default function VipPage() {
  const { isConnected, connect } = useWallet()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />
      <div className="mb-6 flex items-center gap-3">
        <Crown className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">VIP Club</h1>
          <p className="text-sm text-white/60">Weekly cashback, faster payouts, and priority support</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <div key={tier.name} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
            <div className="p-4">
              <h3 className="font-bold text-white">{tier.name}</h3>
              <p className="mt-1 text-xs text-white/50">{tier.requirement}</p>
              <p className="mt-3 text-lg font-bold text-yellow-300">{tier.cashback}</p>
              <p className="text-[11px] text-white/40">weekly cashback</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
        {isConnected ? (
          <p className="text-sm text-white/70">
            You're on the <span className="font-semibold text-white">Bronze</span> tier. Keep playing to rank up —
            tier progress is based on your wagering activity over time.
          </p>
        ) : (
          <>
            <p className="text-sm text-white/70">Connect your wallet to see your VIP tier and progress.</p>
            <Button onClick={connect} className="mt-3 bg-yellow-400 text-black hover:bg-yellow-300">
              Connect Wallet
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
