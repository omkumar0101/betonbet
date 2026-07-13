import { cn } from "@/lib/utils"

interface LimboVisualResultProps {
  actualMultiplier: number | null
  isWinner: boolean | null
  isAnimating: boolean
}

export function LimboVisualResult({ actualMultiplier, isWinner, isAnimating }: LimboVisualResultProps) {
  const displayMultiplier = actualMultiplier !== null ? actualMultiplier.toFixed(2) : "0.00"

  // Determine which GIF to show based on game state
  const getGifSource = () => {
    if (isWinner === null) {
      // Default state - no game played yet
      return "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWRpN25sajN5NzRjbXo3dWVxaWMyaXlidHNmMHFkN3VoZWIzbHY0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Pk3HKfw5Vv6Dj7bwUo/giphy.gif"
    } else if (isWinner === true) {
      // Win state
      return "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGFvNWxuaG50b3RyanNidjl6anpibm13c2N4aXpsbzF4eHlwNWVkcCZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/3ohzdGmM14QTUne9tm/giphy.gif"
    } else {
      // Lose state
      return "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dWR2YzN0Zm1pa3FvY2I5N3J6bHd4MndzcHY2OGE4ZWFweGttaGczNyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/l4FGF6j0TSMk9ASOs/giphy.gif"
    }
  }

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-grape-light via-grape to-grape-dark"></div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-8">
        <div className="text-center space-y-6">
          {/* Title */}
          <div className="text-4xl font-bold text-white mb-6 drop-shadow-2xl">
            LIMBO GAME
          </div>
          
          {/* Multiplier Display */}
          <div className="text-center mb-6">
            <div
              className={cn(
                "text-white text-8xl font-extrabold drop-shadow-2xl transition-all duration-1000 relative",
                isAnimating ? "animate-pulse" : "",
              )}
            >
              {/* Glow effect behind text */}
              <div className={cn(
                "absolute inset-0 blur-xl transition-all duration-1000",
                isWinner === true ? "text-green-400" : isWinner === false ? "text-red-400" : "text-yellow-400"
              )}>
                x{displayMultiplier}
              </div>
              
              {/* Main text with gradient */}
              <span className={cn(
                "relative z-10 bg-gradient-to-r bg-clip-text text-transparent transition-all duration-1000",
                isWinner === true ? "from-green-300 to-green-500" : 
                isWinner === false ? "from-red-300 to-red-500" : 
                "from-white to-yellow-200"
              )}>
                x{displayMultiplier}
              </span>
            </div>
          </div>

          {/* GIF Image based on game state */}
          <div className="w-64 h-64 mx-auto mb-6 rounded-2xl overflow-hidden">
            <img 
              src={getGifSource()} 
              alt={isWinner === null ? "Limbo Game Ready" : isWinner ? "You Won!" : "You Lost!"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

    </div>
  )
}
