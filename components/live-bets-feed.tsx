"use client"

import { useEffect, useState } from "react"

interface BetRow {
  id: number
  game: string
  player: string
  bet: number
  multiplier: number
  payout: number
  won: boolean
}

const GAME_MULTIPLIER_RANGES: Record<string, [number, number]> = {
  Coinflip: [1.98, 2.0],
  Dice: [1.02, 9.9],
  Colours: [1.98, 2.0],
  Limbo: [1.01, 42.5],
  Plinko: [0.4, 6.0],
}

const GAMES = Object.keys(GAME_MULTIPLIER_RANGES)

function randomAddress() {
  const chars = "0123456789abcdef"
  const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `0x${rand(4)}...${rand(4)}`
}

function makeBet(id: number): BetRow {
  const game = GAMES[Math.floor(Math.random() * GAMES.length)]
  const [min, max] = GAME_MULTIPLIER_RANGES[game]
  const multiplier = Number((Math.random() * (max - min) + min).toFixed(2))
  const bet = Number((Math.random() * 0.05 + 0.0004).toFixed(4))
  const won = multiplier >= 1
  return {
    id,
    game,
    player: randomAddress(),
    bet,
    multiplier,
    payout: Number((bet * multiplier).toFixed(4)),
    won,
  }
}

export function LiveBetsFeed() {
  const [rows, setRows] = useState<BetRow[]>([])

  // Populate only after mount so server-rendered HTML (which can't know these
  // random values) matches the client's first render, then start the feed.
  useEffect(() => {
    setRows(Array.from({ length: 10 }, (_, i) => makeBet(i)))

    let nextId = 1000
    const interval = setInterval(() => {
      setRows((prev) => [makeBet(nextId++), ...prev].slice(0, 12))
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-white/80">Live Bets</h3>
        </div>
        <span className="text-[10px] text-white/40">Illustrative activity feed</span>
      </div>

      <div className="hidden grid-cols-5 gap-2 px-4 py-2 text-[10px] uppercase tracking-wide text-white/40 sm:grid">
        <span>Game</span>
        <span>Player</span>
        <span className="text-right">Bet</span>
        <span className="text-right">Multiplier</span>
        <span className="text-right">Payout</span>
      </div>

      <div className="max-h-72 overflow-y-auto scrollbar-hide">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-t border-white/5 px-4 py-2 text-xs animate-fade-in-up"
          >
            <span className="font-medium text-white/90">{row.game}</span>
            <span className="font-mono text-white/50">{row.player}</span>
            <span className="hidden text-right text-white/70 sm:block">{row.bet.toFixed(4)} ETH</span>
            <span className={`hidden text-right font-semibold sm:block ${row.won ? "text-emerald-400" : "text-red-400"}`}>
              {row.multiplier.toFixed(2)}x
            </span>
            <span className={`text-right font-semibold ${row.won ? "text-emerald-400" : "text-red-400"}`}>
              {row.won ? "+" : ""}
              {row.payout.toFixed(4)} ETH
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
