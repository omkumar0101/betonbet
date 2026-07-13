"use client"

import { Palette } from "lucide-react"
import { ColoursGame } from "@/components/colours-game"
import { GameBreadcrumb } from "@/components/game-breadcrumb"

export default function ColoursPage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

      {/* Content */}
      <div className="min-h-screen relative pt-0 pb-32">
        <div className="container mx-auto px-4 relative z-10">
          <GameBreadcrumb game="Colours" />
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-3 drop-shadow-lg">
              <Palette className="h-7 w-7" />
              Colours Game
            </h1>
            <p className="text-white/90 drop-shadow-md text-sm">
              Pick your favourite colour and test your luck on Oddiq!
            </p>
          </div>

          <div className="w-[100vw] sm:max-w-2xl px-4 sm:p-4 space-y-3 sm:space-y-4 relative left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:mx-auto">
            <ColoursGame />
          </div>
        </div>
      </div>
    </>
  )
}
