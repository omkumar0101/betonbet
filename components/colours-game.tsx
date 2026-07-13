"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ethers } from "ethers"
import {
  HOUSE_WALLET_ADDRESS,
  MIN_BET_AMOUNT,
  COLOURS,
  type ColourChoice,
  type ColourGameResult,
} from "@/lib/colors-config"
import { Palette, CheckCircle, XCircle, AlertCircle, Wallet, Circle, Info, Clock } from "lucide-react"
import { playGlobalColorsGame } from "@/lib/global-game-service"
import { ColoursVisualResult } from "./colors-visual-result"

const BET_PRESETS = [0.0004, 0.004, 0.01, 0.05]

export function ColoursGame() {
  const { address, provider, isConnected, sendTransaction } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedColour, setSelectedColour] = useState<ColourChoice>("red")
  const [isSpinning, setIsSpinning] = useState(false)
  const [gameHistory, setGameHistory] = useState<ColourGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<ColourGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [showVisualResult, setShowVisualResult] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)
  const [showSpinningPopup, setShowSpinningPopup] = useState(false)

  const handleSpin = useCallback(async () => {
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setShowVisualResult(false)

    if (!isConnected || !address) {
      setPayoutError("❌ Please connect your MetaMask wallet first!")
      return
    }

    console.log(`🔑 Wallet connected: ${address}`)

    if (!provider) {
      setPayoutError("❌ No provider available!")
      return
    }

    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`❌ Minimum bet is ${MIN_BET_AMOUNT} ETH`)
      return
    }

    setPayoutError("")

    try {
      setPayoutStatus("🔍 Checking your wallet balance...")

      const balance = await provider.getBalance(address)
      const balanceInEth = Number(ethers.formatEther(balance))

      console.log(`🔍 User wallet balance: ${balanceInEth} ETH`)

      if (balanceInEth < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ETH but have ${balanceInEth.toFixed(4)} ETH`)
      }

      console.log(`✅ Balance check passed!`)

      setPayoutStatus("🎯 Creating bet transaction...")

      const weiAmount = ethers.parseEther(amount.toString())

      setPayoutStatus("📝 Please approve the transaction in your wallet...")

      console.log(`[v0] 🎨 COLOURS GAME: Sending ${amount} ETH from ${address} to house wallet ${HOUSE_WALLET_ADDRESS}`)

      // Send bet to house wallet
      const betTxHash = await sendTransaction(HOUSE_WALLET_ADDRESS, weiAmount)

      console.log(`[v0] ✅ Bet transaction confirmed: ${betTxHash}`)
      console.log(`[v0] 📊 Player wallet: ${address}`)
      console.log(`[v0] 🏠 House wallet: ${HOUSE_WALLET_ADDRESS}`)

      setPayoutStatus("✅ Bet confirmed!")
      setShowSpinningPopup(true)

      await new Promise((resolve) => setTimeout(resolve, 3000))
      setShowSpinningPopup(false)

      console.log(`🎨 CALLING playGlobalColorsGame(${amount})...`)
      const gameResult = await playGlobalColorsGame(address, betTxHash, amount, selectedColour)
      console.log("🎨 VERIFIED COLOURS GAME RESULT:", gameResult)
      const playerWins = gameResult.won
      const gameNumber = Date.now()

      const finalResult: ColourChoice = gameResult.visual.actualResult
      const winAmount = gameResult.payout

      const result: ColourGameResult = {
        won: playerWins,
        playerChoice: selectedColour,
        actualResult: finalResult,
        betAmount: amount,
        winAmount,
        gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])
      setShowVisualResult(true)

      setTimeout(() => {
        setShowVisualResult(false)
      }, 8000)

      if (playerWins && winAmount > 0) {
        if (gameResult.payoutTxHash) {
          setPayoutStatus(`🎉 PAYOUT SENT! ${winAmount.toFixed(3)} ETH has been transferred to your wallet!`)
          console.log(`✅ Payout successful: ${gameResult.payoutTxHash}`)
        } else {
          setPayoutError(`❌ Payout failed: ${gameResult.payoutError ?? "Unknown error"}`)
          console.error("❌ Payout failed:", gameResult.payoutError)
        }
      } else {
        setPayoutStatus(`😔 You lost this round! (Colours Game #${gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("❌ Game error:", error)

      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (
          error.message.includes("User rejected") ||
          error.message.includes("cancelled") ||
          error.code === "ACTION_REJECTED"
        ) {
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction in your wallet."
        } else if (error.message.includes("Insufficient")) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      setPayoutError(`❌ ${errorMessage}`)
    }
  }, [address, provider, betAmount, selectedColour, isConnected, sendTransaction])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">Please connect your MetaMask wallet to start playing colours on Oddiq.</p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedColourData = COLOURS.find((c) => c.name === selectedColour)!

  return (
    <>
      <div className="w-[100vw] sm:max-w-2xl px-4 sm:p-4 space-y-3 sm:space-y-4 relative left-1/2 transform -translate-x-1/2 sm:left-auto sm:transform-none sm:mx-auto">
        <Card className="bg-white/15 backdrop-blur-md border-white/30 shadow-2xl rounded-2xl sm:rounded-3xl">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-xl sm:text-2xl flex items-center gap-2 drop-shadow-md">
                  <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
                  Colours Game
                </CardTitle>
                <p className="text-white/80 drop-shadow-sm text-sm sm:text-base">
                  Choose from 8 colours, place your bet, and test your luck!
                </p>
                <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-2 mt-2">
                  <p className="text-cyan-300 text-xs sm:text-sm">
                    🔒 <strong>Provably Fair:</strong> Each spin is a genuine 1-in-8 draw from a server-committed seed, verifiable after the fact
                  </p>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-3">
                <Button
                  onClick={() => setShowRecentGamesPopup(true)}
                  variant="outline"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 sm:px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[80px] sm:min-w-[120px]"
                >
                  <Clock className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Recent Games</span>
                  <span className="sm:hidden">Recent</span>
                </Button>
                <Button
                  onClick={() => setShowRulesPopup(true)}
                  variant="outline"
                  className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 sm:px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[70px] sm:min-w-[100px]"
                >
                  <Info className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Rules</span>
                  <span className="sm:hidden">Rules</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="space-y-4">
              <Label className="text-white font-medium drop-shadow-sm text-lg sm:text-xl text-center block">
                Choose Your Colour
              </Label>

              <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
                {COLOURS.map((colour) => {
                  const colorStyles: Record<ColourChoice, string> = {
                    red: "from-red-400 via-red-500 to-red-600",
                    green: "from-green-400 via-green-500 to-green-600",
                    blue: "from-blue-400 via-blue-500 to-blue-600",
                    yellow: "from-yellow-400 via-yellow-500 to-yellow-600",
                    purple: "from-purple-400 via-purple-500 to-purple-600",
                    orange: "from-orange-400 via-orange-500 to-orange-600",
                    pink: "from-pink-400 via-pink-500 to-pink-600",
                    cyan: "from-cyan-400 via-cyan-500 to-cyan-600",
                  }
                  const active = selectedColour === colour.name

                  return (
                    <button
                      key={colour.name}
                      onClick={() => setSelectedColour(colour.name)}
                      disabled={showSpinningPopup}
                      title={colour.name}
                      className={`flex flex-col items-center gap-1.5 rounded-2xl p-2.5 transition-all duration-200 border-2 ${
                        active ? "border-white bg-white/15 shadow-lg" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"
                      } disabled:opacity-50`}
                    >
                      <span
                        className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br ${colorStyles[colour.name]} ${
                          active ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""
                        }`}
                      />
                      <span className="text-[11px] sm:text-xs font-semibold capitalize text-white/80">
                        {colour.name}
                      </span>
                    </button>
                  )
                })}
              </div>

              <Button
                onClick={handleSpin}
                disabled={showSpinningPopup || !isConnected}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
              >
                {showSpinningPopup ? "Processing..." : `Place Bet on ${selectedColour[0].toUpperCase()}${selectedColour.slice(1)} (${betAmount} ETH)`}
              </Button>
            </div>

            <div className="space-y-3">
              <Label htmlFor="bet-amount" className="text-white font-medium drop-shadow-sm text-sm sm:text-base">
                Bet Amount (ETH)
              </Label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3 mb-4">
                {BET_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                    onClick={() => setBetAmount(preset.toString())}
                    disabled={showSpinningPopup}
                    className={`${
                      Number.parseFloat(betAmount) === preset
                        ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg"
                        : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40"
                    } text-sm sm:text-sm py-3 sm:py-3 px-4 sm:px-4 rounded-2xl font-semibold transition-all duration-300 min-w-[100px] sm:min-w-[120px]`}
                  >
                    <span className="hidden sm:inline">{preset} ETH</span>
                    <span className="sm:hidden">{preset}</span>
                  </Button>
                ))}
              </div>

              <Input
                id="bet-amount"
                type="number"
                min={MIN_BET_AMOUNT}
                step="0.001"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-2xl py-3 px-4 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder={`Min: ${MIN_BET_AMOUNT} ETH`}
                disabled={showSpinningPopup}
              />
            </div>

            {payoutStatus && (
              <div className="text-center p-4 bg-green-500/20 border border-green-500/50 rounded-2xl backdrop-blur-sm">
                <p className="text-green-100 font-medium text-sm sm:text-base">{payoutStatus}</p>
              </div>
            )}

            {payoutError && (
              <div className="text-center p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm flex items-center gap-3 justify-center">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-100 font-medium text-sm sm:text-base">{payoutError}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ColoursVisualResult
        result={currentResult}
        isVisible={showVisualResult}
        onClose={() => setShowVisualResult(false)}
      />

      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent
          className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8"
          style={{ borderRadius: "32px" }}
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Colours
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-5">
              <h3 className="text-lg sm:text-xl font-bold text-yellow-400 text-center">Game Rules</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Select any of the 8 available colours</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Place your bet (minimum 0.001 ETH)</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Click 'Place Bet' to play</span>
                </li>
                <li className="flex items-start gap-4 p-3 bg-white/5 rounded-2xl">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-base sm:text-lg font-medium">Win 2x your bet if you guess correctly</span>
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecentGamesPopup} onOpenChange={setShowRecentGamesPopup}>
        <DialogContent
          className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8"
          style={{ borderRadius: "32px" }}
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              Recent Games
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {gameHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-xl backdrop-blur-sm ${
                      game.won ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {game.won ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div className="text-white/80">
                        <div className="flex items-center gap-2 mb-1">
                          <Circle
                            className={`h-4 w-4 ${COLOURS.find((c) => c.name === game.playerChoice)?.textColor} fill-current`}
                          />
                          <span className="capitalize font-medium">{game.playerChoice}</span>
                          <span>→</span>
                          <Circle
                            className={`h-4 w-4 ${COLOURS.find((c) => c.name === game.actualResult)?.textColor} fill-current`}
                          />
                          <span className="capitalize font-medium">{game.actualResult}</span>
                        </div>
                        <div className="text-sm opacity-70">
                          Bet: {game.betAmount.toFixed(3)} ETH | Game #{game.gameNumber}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${game.won ? "text-green-400" : "text-red-400"}`}>
                      {game.won ? `+${game.winAmount.toFixed(3)}` : `-${game.betAmount.toFixed(3)}`} ETH
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Clock className="h-20 w-20 text-white/40 mx-auto mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-white/70 mb-3">No Games Played Yet</h3>
                <p className="text-base sm:text-lg text-white/60">Start playing to see your game history here!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSpinningPopup} onOpenChange={() => {}}>
        <DialogContent
          className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8"
          style={{ borderRadius: "32px" }}
        >
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6">
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXE5cGlncDVkNzhiNTN4cTMxNmh1bjNkYWZzajN2YWl6OXIzZjE4NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/p2jWWXr20V6UQOP1LJ/giphy.gif"
                alt="Spinning animation"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>

            <div className="text-center">
              <div className="text-white text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">Spinning</div>
              <div className="text-white/90 text-base sm:text-lg mb-6 drop-shadow-md">
                Determining the winning color...
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                <span className="drop-shadow-md">Please wait</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
