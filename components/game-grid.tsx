"use client"

import Link from "next/link"
import { Play, ShieldCheck } from "lucide-react"

export interface GameGridItem {
  title: string
  href: string
  gradient: string
  image: string
  tag: string
  multiplier: string
  isNew?: boolean
  isHot?: boolean
}

export function GameGrid({ games }: { games: GameGridItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {games.map((game) => (
        <Link key={game.href} href={game.href} className="group block">
          <div
            className={`relative aspect-[3/4] overflow-hidden rounded-xl bg-gradient-to-br ${game.gradient} border border-white/10 shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-hover:border-yellow-400/60 group-hover:shadow-yellow-500/20`}
          >
            <img
              src={game.image || "/placeholder.svg"}
              alt={`${game.title} game`}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Corner tags */}
            <div className="absolute top-2 left-2 flex gap-1">
              {game.isNew && (
                <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                  New
                </span>
              )}
              {game.isHot && (
                <span className="rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white shadow">
                  Hot
                </span>
              )}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-[9px] font-semibold text-white/80">Fair</span>
            </div>

            {/* Hover play button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 shadow-lg shadow-yellow-500/40">
                <Play className="h-5 w-5 fill-black text-black" />
              </div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-sm md:text-base font-bold leading-tight text-white drop-shadow">{game.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-[10px] text-white/60">{game.tag}</span>
                <span className="text-[10px] font-semibold text-yellow-300">{game.multiplier}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
