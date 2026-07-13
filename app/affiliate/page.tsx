"use client"

import { useState } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"

const TIERS = [
  { range: "1 – 9 referrals", commission: "10%" },
  { range: "10 – 49 referrals", commission: "15%" },
  { range: "50+ referrals", commission: "20%" },
]

export default function AffiliatePage() {
  const { isConnected, address, connect } = useWallet()
  const [copied, setCopied] = useState(false)

  const link = address && typeof window !== "undefined" ? `${window.location.origin}/?ref=${address}` : ""

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />
      <div className="mb-6 flex items-center gap-3">
        <Share2 className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
          <p className="text-sm text-white/60">Earn a share of the house edge from players you refer</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">Your Referral Link</h2>
        {isConnected && link ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={link}
              className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-white/80"
            />
            <Button onClick={copyLink} className="bg-yellow-400 text-black hover:bg-yellow-300">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-3 text-sm text-white/60">Connect your wallet to generate your referral link.</p>
            <Button onClick={connect} className="bg-yellow-400 text-black hover:bg-yellow-300">
              Connect Wallet
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/50">Commission Tiers</h2>
        <div className="space-y-2">
          {TIERS.map((tier) => (
            <div key={tier.range} className="flex items-center justify-between rounded-lg bg-black/20 px-4 py-2.5">
              <span className="text-sm text-white/70">{tier.range}</span>
              <span className="font-bold text-yellow-300">{tier.commission}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
