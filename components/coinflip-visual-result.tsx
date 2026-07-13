import type { CoinSide, GameResult } from "@/lib/game-config"

interface CoinflipVisualResultProps {
  actualSide: CoinSide | null
  isWinner: boolean | null
  isAnimating: boolean
  currentResult?: GameResult | null
}

export function CoinflipVisualResult({ actualSide, isWinner, isAnimating, currentResult }: CoinflipVisualResultProps) {
  // Show default component OR result details, but not both
  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-grape-light via-grape to-grape-dark"></div>

      {currentResult ? (
        // Win OR Loss Result - Hide default visual, show only result content
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <div className="text-center space-y-4">
            {currentResult.won ? (
              // Win Result
              <>
                <div className="text-3xl font-bold text-green-400 mb-4">YOU WON!</div>

                {/* Win GIF Image */}
                <div className="w-64 h-64 mx-auto mb-6">
                  <img
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWJxOWs5dWJ3dmowand6dW82ZW8zcWNxbzEyNWdhdzNybHd0bXJ6MCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/VQgi9B47GP6CxH1alr/giphy.gif"
                    alt="Win celebration"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="text-white/90 text-base">
                  You picked:{" "}
                  <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result: <span className="font-bold text-blue-400">{currentResult.actualResult.toUpperCase()}</span>
                </div>
                <div className="text-white/80 text-sm">
                  Bet: <span className="font-bold text-yellow-300">{currentResult.betAmount.toFixed(3)} ETH</span>
                </div>
                <div className="text-green-400 font-bold text-lg">
                  Won:{" "}
                  <span className="bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                    {currentResult.winAmount.toFixed(3)} ETH
                  </span>
                </div>
                <div className="text-white/60 text-sm">Game #{currentResult.gameNumber}</div>
              </>
            ) : (
              // Loss Result
              <>
                <div className="text-3xl font-bold text-red-400 mb-4">YOU LOST</div>

                {/* Loss GIF Image */}
                <div className="w-64 h-64 mx-auto mb-6">
                  <img
                    src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWpmY3F0ZTIzM2dhcW1lcG0yZ2RtejA2ZTdrMG56aGYxMzY5eWhvaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/COx4t3JqKfZbeR8qU2/giphy.gif"
                    alt="Loss result"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="text-white/90 text-base">
                  You picked:{" "}
                  <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result: <span className="font-bold text-blue-400">{currentResult.actualResult.toUpperCase()}</span>
                </div>
                <div className="text-white/80 text-sm">
                  Bet: <span className="font-bold text-yellow-300">{currentResult.betAmount.toFixed(3)} ETH</span>
                </div>
                <div className="text-red-400 font-bold text-lg">
                  You lost this round! (Coinflip Game #{currentResult.gameNumber}) Better luck next time!
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        // Default Component - Show default visual when no result
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">Flip The Coin</h2>
            <p className="text-white/70 text-lg">Click the button to start flipping!</p>
          </div>
          <div className="relative w-full h-full max-w-md max-h-80">
            <div className="w-full h-full">
              <img
                src="/images/jester.gif"
                alt="Oddiq jester"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
