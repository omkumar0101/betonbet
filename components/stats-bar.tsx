"use client"

import { useEffect, useState } from "react"
import { Wallet, Coins, Trophy, Zap } from "lucide-react"

interface Stats {
  houseBalance: number
  totalBets: number
  totalWagered: number
  biggestWin: number
}

const EMPTY_STATS: Stats = { houseBalance: 0, totalBets: 0, totalWagered: 0, biggestWin: 0 }

function formatValue(value: number, decimals: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function StatsBar() {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        if (!cancelled && data.success) {
          setStats({
            houseBalance: data.houseBalance,
            totalBets: data.totalBets,
            totalWagered: data.totalWagered,
            biggestWin: data.biggestWin,
          })
        }
      } catch (error) {
        console.error("Failed to fetch platform stats:", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const items = [
    { icon: Wallet, label: "House Balance", value: stats.houseBalance, suffix: " ETH", decimals: 4 },
    { icon: Coins, label: "Total Wagered", value: stats.totalWagered, suffix: " ETH", decimals: 4 },
    { icon: Trophy, label: "Biggest Win", value: stats.biggestWin, suffix: " ETH", decimals: 4 },
    { icon: Zap, label: "Bets Placed", value: stats.totalBets, suffix: "", decimals: 0 },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 md:gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 md:px-4 md:py-3 backdrop-blur-sm"
        >
          <div className="flex h-8 w-8 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-lg bg-yellow-400/10">
            <stat.icon className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs sm:text-sm md:text-base font-bold text-white">
              {loading ? "—" : `${formatValue(stat.value, stat.decimals)}${stat.suffix}`}
            </p>
            <p className="truncate text-[10px] md:text-xs text-white/50">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
