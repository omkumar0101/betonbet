"use client" // This page now manages state, so it must be a client component

import { useState, useCallback, useMemo } from "react"
import { useWallet } from "@/components/wallet-provider"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Wallet, Info, Clock } from "lucide-react"
import { LimboVisualResult } from "@/components/limbo-visual-result"
import { LimboGameControls } from "@/components/limbo-game-controls" // Renamed component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  HOUSE_WALLET_ADDRESS,
  MIN_BET_AMOUNT,
  MIN_TARGET_MULTIPLIER,
  MAX_TARGET_MULTIPLIER,
  type LimboGameResult,
} from "@/lib/limbo-config"
import { playGlobalLimboGame } from "@/lib/global-game-service"
import { Card, CardContent } from "@/components/ui/card" // Import Card and CardContent for wallet prompt
import { GameBreadcrumb } from "@/components/game-breadcrumb"

export default function LimboPage() {
  const { address, sendTransaction, isConnected, isConnecting, balance, refreshBalance } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [targetMultiplier, setTargetMultiplier] = useState("2.00")
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameHistory, setGameHistory] = useState<LimboGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<LimboGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [rolledMultiplier, setRolledMultiplier] = useState<number | null>(null)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)

  // Calculate potential win amount
  const potentialWin = useMemo(() => {
    const amount = Number.parseFloat(betAmount)
    const target = Number.parseFloat(targetMultiplier)
    if (isNaN(amount) || isNaN(target) || amount <= 0 || target < MIN_TARGET_MULTIPLIER) {
      return 0
    }
    return amount * target
  }, [betAmount, targetMultiplier])

  const handlePlay = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setRolledMultiplier(null) // Reset visual multiplier

    // Validate wallet connection
    if (!isConnected || !address) {
      setPayoutError("❌ Please connect your MetaMask wallet first!")
      return
    }

    // Validate bet amount
    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`❌ Minimum bet is ${MIN_BET_AMOUNT} ETH`)
      return
    }

    // Validate target multiplier
    const target = Number.parseFloat(targetMultiplier)
    if (isNaN(target) || target < MIN_TARGET_MULTIPLIER || target > MAX_TARGET_MULTIPLIER) {
      setPayoutError(`❌ Target multiplier must be between ${MIN_TARGET_MULTIPLIER}x and ${MAX_TARGET_MULTIPLIER}x`)
      return
    }

    setIsPlaying(true)

    try {
      // Step 1: Check user's wallet balance
      setPayoutStatus("🔍 Checking your wallet balance...")

      const userBalance = Number.parseFloat(balance)
      if (userBalance < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ETH but have ${userBalance.toFixed(4)} ETH`)
      }

      // Step 2: Create and send bet transaction
      setPayoutStatus("🎯 Creating bet transaction...")

      const valueInWei = ethers.parseEther(amount.toString())
      const betSignature = await sendTransaction(HOUSE_WALLET_ADDRESS, valueInWei)

      setPayoutStatus("🎯 Confirming your bet transaction...")
      console.log(`Bet transaction sent: ${betSignature}`)

      setPayoutStatus("🎯 Bet confirmed! Playing Limbo...")

      // Step 3: Ask the server to verify the bet tx and resolve it fairly
      console.log(`CALLING playGlobalLimboGame(${amount}, ${target})...`)
      const gameResult = await playGlobalLimboGame(address, betSignature, amount, target)
      console.log("VERIFIED LIMBO GAME RESULT:", gameResult)
      const playerWins = gameResult.won
      const gameNumber = Date.now()
      const actualMultiplier = (gameResult.visual as { actualMultiplier: number }).actualMultiplier

      console.log(`LIMBO GAME: Player ${playerWins ? "WINS" : "LOSES"} on limbo game #${gameNumber}`)

      // Step 4: Set the visual multiplier for display
      setRolledMultiplier(actualMultiplier)

      const winAmount = gameResult.payout

      const result: LimboGameResult = {
        won: playerWins,
        targetMultiplier: target,
        actualMultiplier,
        betAmount: amount,
        winAmount,
        gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 5: Payout was already sent server-side once the win was verified
      if (playerWins && winAmount > 0) {
        if (gameResult.payoutTxHash) {
          setPayoutStatus(`💰 PAYOUT SENT! ${winAmount.toFixed(3)} ETH has been transferred to your wallet!`)
          console.log(`Payout successful: ${gameResult.payoutTxHash}`)
          await refreshBalance()
        } else {
          setPayoutError(`❌ Payout failed: ${gameResult.payoutError ?? "Unknown error"}`)
          console.error("Payout failed:", gameResult.payoutError)
        }
      } else {
        setPayoutStatus(`💥 You lost this round! (Limbo Game #${gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("Game error:", error)

      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("cancelled")) {
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction in your wallet."
        } else if (error.message.includes("Insufficient")) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      setPayoutError(`❌ ${errorMessage}`)
    } finally {
      setIsPlaying(false)
    }
  }, [address, balance, betAmount, targetMultiplier, sendTransaction, isConnected, refreshBalance])

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

        {/* Content */}
        <div className="min-h-screen relative py-8 w-full">
          <div className="container mx-auto relative z-10 px-4">
            <GameBreadcrumb game="Limbo" />
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Limbo Game</h1>
              <p className="text-white/80 drop-shadow-md">Set your target multiplier and cash out before it crashes!</p>
            </div>
            <div className="max-w-2xl mx-auto p-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-white/70 mb-4">
                    Please connect your MetaMask wallet to start playing Limbo on Oddiq.
                  </p>
                  <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

      {/* Content */}
      <div className="min-h-screen relative py-4 w-full">
        <div className="container mx-auto relative z-10 px-4">
          <GameBreadcrumb game="Limbo" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-6">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Limbo Game</h1>
              <p className="text-white/80 drop-shadow-md">Set your target multiplier and cash out before it crashes!</p>
            </div>
            <div className="flex gap-2 justify-center sm:justify-end">
              <Button
                onClick={() => setShowRulesPopup(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
              >
                <Info className="h-4 w-4 mr-2" />
                Rules
              </Button>
              <Button
                onClick={() => setShowRecentGamesPopup(true)}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent Games
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Visual Result */}
            <div className="lg:col-span-2 space-y-4">
              <LimboVisualResult
                actualMultiplier={rolledMultiplier}
                isWinner={currentResult?.won ?? null}
                isAnimating={isPlaying}
              />
            </div>

            {/* Right Column: Game Controls */}
            <div className="space-y-4">
              <LimboGameControls
                betAmount={betAmount}
                setBetAmount={setBetAmount}
                targetMultiplier={targetMultiplier}
                setTargetMultiplier={setTargetMultiplier}
                potentialWin={potentialWin}
                handlePlay={handlePlay}
                isPlaying={isPlaying}
                connecting={isConnecting}
                connected={isConnected}
                payoutStatus={payoutStatus}
                payoutError={payoutError}
                currentResult={currentResult}
                gameHistory={gameHistory}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rules Popup */}
      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent
          className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl"
          style={{ borderRadius: "32px" }}
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Limbo
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-white/90">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Set Your Target - Choose a multiplier between 1.01x and 1000x</li>
                <li>Place Your Bet - Minimum bet is {MIN_BET_AMOUNT} ETH. Choose your amount.</li>
                <li>Watch the Multiplier - The multiplier starts at 1.00x and increases rapidly</li>
                <li>Cash Out Before It Crashes - Click "Cash Out" before the multiplier reaches your target</li>
                <li>Win Big - If you cash out successfully, you win your bet amount × the multiplier!</li>
              </ol>
            </div>

            <div className="pt-4 border-t border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Game Rules</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Minimum bet: {MIN_BET_AMOUNT} ETH</li>
                <li>
                  Target multiplier range: {MIN_TARGET_MULTIPLIER}x to {MAX_TARGET_MULTIPLIER}x
                </li>
                <li>If you cash out before the multiplier crashes, you win!</li>
                <li>If the multiplier crashes before you cash out, you lose your bet</li>
                <li>All games are provably fair and transparent</li>
              </ul>
            </div>

            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70">
                Tip: Make sure to approve transactions in your MetaMask wallet when prompted!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Games Popup */}
      <Dialog open={showRecentGamesPopup} onOpenChange={setShowRecentGamesPopup}>
        <DialogContent
          className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl"
          style={{ borderRadius: "32px" }}
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              Recent Limbo Games
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {gameHistory.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto rounded-2xl">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-4 rounded-xl backdrop-blur-sm ${
                      game.won ? "bg-green-500/20 border border-green-500/30" : "bg-red-500/20 border border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {game.won ? (
                        <div className="text-green-400 text-lg">🎉</div>
                      ) : (
                        <div className="text-red-400 text-lg">💥</div>
                      )}
                      <div className="text-white/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Target: {game.targetMultiplier}x</span>
                          <span>→</span>
                          <span className="font-medium">Result: {game.actualMultiplier.toFixed(2)}x</span>
                        </div>
                        <div className="text-sm opacity-70">
                          Bet: {game.betAmount.toFixed(4)} ETH | Game #{game.gameNumber}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg ${game.won ? "text-green-400" : "text-red-400"}`}>
                      {game.won ? `+${game.winAmount.toFixed(4)}` : `-${game.betAmount.toFixed(4)}`} ETH
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-2xl">
                <Clock className="h-20 w-20 text-white/40 mx-auto mb-6" />
                <h3 className="text-xl sm:text-2xl font-bold text-white/70 mb-3">No Limbo Games Played Yet</h3>
                <p className="text-base sm:text-lg text-white/60">Start playing to see your game history here!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
