import type { DiceChoice, DiceGameResult } from "@/lib/dice-config"

interface DiceVisualResultProps {
  diceTotal: number | null
  playerChoice: DiceChoice | null
  isWinner: boolean | null
  isAnimating: boolean
  currentResult?: DiceGameResult | null
}

export function DiceVisualResult({
  diceTotal,
  playerChoice,
  isWinner,
  isAnimating,
  currentResult,
}: DiceVisualResultProps) {
  // Debug logging
  console.log("DiceVisualResult render:", { currentResult, diceTotal, playerChoice, isWinner, isAnimating })

  const getDiceText = (total: number | null) => {
    if (total === null) return "ROLL DICE"
    return total.toString()
  }

  const getChoiceEmoji = (choice: DiceChoice | null) => {
    if (!choice) return "🎲"
    return choice === "more" ? "📈" : "📉"
  }

  const getChoiceGradient = (choice: DiceChoice | null) => {
    if (!choice) return "bg-gradient-to-br from-gray-400 to-gray-600"
    return choice === "more"
      ? "bg-gradient-to-br from-green-400 to-green-600"
      : "bg-gradient-to-br from-red-400 to-red-600"
  }

  // Show result with GIF if we have a currentResult
  if (currentResult) {
    console.log("Showing result with GIF:", currentResult)
    return (
      <div
        key={`result-${currentResult.gameNumber}`}
        className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center"
      >
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-grape-light via-grape to-grape-dark"></div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
          <div className="text-center space-y-4">
            {currentResult.won ? (
              // Win Result
              <>
                <div className="text-3xl font-bold text-green-400 mb-4">YOU WON!</div>

                {/* Win GIF Image */}
                <div className="w-48 h-48 mx-auto mb-6">
                  <img
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3cxeGNoc242ejE5YTRscmw3OWF3YjI4N3JveGc5enQwYjd5eHQ3MSZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/ghDlzU7nhLMVgSL8B4/giphy.gif?v=2"
                    alt="Win celebration"
                    className="w-full h-full rounded-2xl"
                  />
                </div>

                <div className="text-white/90 text-base">
                  You picked:{" "}
                  <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result:{" "}
                  <span className="font-bold text-blue-400">
                    {currentResult.dice1} + {currentResult.dice2} = {currentResult.total}
                  </span>
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
                <div className="w-48 h-48 mx-auto mb-6">
                  <img
                    src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eXBxbXUyZTJ5MmRsYjlzdWZwcXh3eWYxMTZueTU1ams4NGg3andvciZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/IjVrBogKTnVTMWFpYo/giphy.gif"
                    alt="Loss result"
                    className="w-full h-full rounded-2xl"
                  />
                </div>

                <div className="text-white/90 text-base">
                  You picked:{" "}
                  <span className="font-bold text-blue-400">{currentResult.playerChoice.toUpperCase()}</span>
                </div>
                <div className="text-white/90 text-base">
                  Result:{" "}
                  <span className="font-bold text-blue-400">
                    {currentResult.dice1} + {currentResult.dice2} = {currentResult.total}
                  </span>
                </div>
                <div className="text-white/80 text-sm">
                  Bet: <span className="font-bold text-yellow-300">{currentResult.betAmount.toFixed(3)} ETH</span>
                </div>
                <div className="text-red-400 font-bold text-lg">
                  You lost this round! (Dice Game #{currentResult.gameNumber}) Better luck next time!
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    )
  }

  // Default Component - Show default visual when no result
  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-grape-light via-grape to-grape-dark"></div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        <div className="text-center space-y-6">
          {/* Title */}
          <div className="text-4xl font-bold text-white mb-6 drop-shadow-2xl">ROLL DICE</div>

          {/* Default GIF Image */}
          <div className="w-64 h-64 mx-auto">
            <img
              src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnF5Zzh5bzk4a2w5NTV4ODAwcWc0NnRqem44empvaWt6bjExMTlycyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lZ8V6ADaUZrTG0/giphy.gif"
              alt="Default dice game"
              className="w-full h-full rounded-2xl"
            />
          </div>
        </div>
      </div>

    </div>
  )
}
