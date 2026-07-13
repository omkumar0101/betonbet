"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Wallet, Dice1, AlertCircle, CheckCircle, XCircle, TrendingUp, TrendingDown, Info, Clock } from "lucide-react"
import { DiceVisualResult } from "@/components/dice-visual-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  HOUSE_WALLET_ADDRESS,
  MIN_BET_AMOUNT,
  DICE_OPTIONS,
  type DiceChoice,
  type DiceGameResult,
} from "@/lib/dice-config"
import { playGlobalDiceGame } from "@/lib/global-game-service"
import { GameBreadcrumb } from "@/components/game-breadcrumb"

// Preset bet amounts
const BET_PRESETS = [0.0004, 0.004, 0.01, 0.05]

export default function DicePage() {
  const { address, isConnected, isConnecting, balance, sendTransaction } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedChoice, setSelectedChoice] = useState<DiceChoice>("more")
  const [isRolling, setIsRolling] = useState(false)
  const [gameHistory, setGameHistory] = useState<DiceGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<DiceGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [diceAnimation, setDiceAnimation] = useState({ dice1: 1, dice2: 1 })
  const [showSpinningPopup, setShowSpinningPopup] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)

  const handleRoll = useCallback(async () => {
    // Clear previous states
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")

    // Validate wallet connection
    if (!isConnected || !address) {
      setPayoutError("Please connect your MetaMask wallet first!")
      return
    }

    // Validate bet amount
    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`Minimum bet is ${MIN_BET_AMOUNT} ETH`)
      return
    }

    setIsRolling(true)

    try {
      // Step 1: Check user's wallet balance
      setPayoutStatus("Checking your wallet balance...")

      const userBalance = Number.parseFloat(balance)

      if (userBalance < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ETH but have ${userBalance.toFixed(4)} ETH`)
      }

      // Step 2: Create and send bet transaction
      setPayoutStatus("Creating bet transaction...")

      const weiAmount = ethers.parseEther(amount.toString())

      setPayoutStatus("Confirming your bet transaction...")

      const txHash = await sendTransaction(HOUSE_WALLET_ADDRESS, weiAmount)
      console.log(`Bet transaction sent: ${txHash}`)

      setPayoutStatus("Bet confirmed! Rolling dice...")

      // Step 3: Show spinning popup AFTER transaction confirmation
      setShowSpinningPopup(true)

      // Wait for spinning popup to complete its animation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Hide spinning popup
      setShowSpinningPopup(false)

      // Step 4: Ask the server to verify the bet tx and resolve it fairly
      console.log(`CALLING playGlobalDiceGame(${amount})...`)
      const gameResult = await playGlobalDiceGame(address, txHash, amount, selectedChoice)
      console.log("VERIFIED DICE GAME RESULT:", gameResult)
      const playerWins = gameResult.won
      const gameNumber = Date.now()

      // Step 5: Use the server's authoritative dice roll for the animation/result
      const { dice1, dice2, total } = gameResult.visual as { dice1: number; dice2: number; total: number }
      setDiceAnimation({ dice1, dice2 })

      const winAmount = gameResult.payout

      const result: DiceGameResult = {
        won: playerWins,
        playerChoice: selectedChoice,
        dice1,
        dice2,
        total,
        betAmount: amount,
        winAmount,
        gameNumber,
      }

      console.log("Setting currentResult:", result)
      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      // Step 6: Payout was already sent server-side once the win was verified
      if (playerWins && winAmount > 0) {
        if (gameResult.payoutTxHash) {
          setPayoutStatus(`PAYOUT SENT! ${winAmount.toFixed(3)} ETH has been transferred to your wallet!`)
          console.log(`Payout successful: ${gameResult.payoutTxHash}`)
        } else {
          setPayoutError(`Payout failed: ${gameResult.payoutError ?? "Unknown error"}`)
          console.error("Payout failed:", gameResult.payoutError)
        }
      } else {
        setPayoutStatus(`You lost this round! (Dice Game #${gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("Game error:", error)
      setShowSpinningPopup(false) // Hide spinning popup on error

      let errorMessage = "An unexpected error occurred"

      if (error instanceof Error) {
        if (error.message.includes("User rejected") || error.message.includes("cancelled")) {
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction in your wallet."
        } else if (error.message.includes("Insufficient")) {
          errorMessage = error.message
        } else if (error.message.includes("blockhash")) {
          errorMessage = "Network error. Please try again."
        } else {
          errorMessage = error.message
        }
      }

      setPayoutError(`${errorMessage}`)
    } finally {
      setIsRolling(false)
      setShowSpinningPopup(false)
    }
  }, [address, betAmount, selectedChoice, sendTransaction, isConnected, balance])

  // Show wallet connection prompt if not connected
  if (!isConnected) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

        {/* Content */}
        <div className="min-h-screen relative py-8 w-full">
          <div className="container mx-auto relative z-10 px-4">
            <GameBreadcrumb game="Dice" />
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Dice Game</h1>
              <p className="text-white/80 drop-shadow-md">Roll two dice and predict the outcome on Robinhood Chain!</p>
            </div>
            <div className="max-w-2xl mx-auto p-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-white/70 mb-4">
                    Please connect your MetaMask wallet to start playing dice on Robinhood Chain.
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
          <GameBreadcrumb game="Dice" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-6">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Dice Game</h1>
              <p className="text-white/80 drop-shadow-md">Roll two dice and predict the outcome on Robinhood Chain!</p>
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
              <DiceVisualResult
                key={currentResult ? `dice-result-${currentResult.gameNumber}` : "dice-default"}
                diceTotal={currentResult?.total ?? null}
                playerChoice={selectedChoice}
                isWinner={currentResult?.won ?? null}
                isAnimating={isRolling}
                currentResult={currentResult}
              />
            </div>

            {/* Right Column: Game Controls */}
            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2">
                    <Dice1 className="h-6 w-6" />
                    Dice Game Controls
                  </CardTitle>
                  <p className="text-white/70">Choose your prediction, roll the dice, and win!</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bet Amount Section */}
                  <div className="space-y-3">
                    <Label htmlFor="bet-amount" className="text-white font-medium">
                      Bet Amount (ETH)
                    </Label>

                    {/* Preset Buttons */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {BET_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                          onClick={() => setBetAmount(preset.toString())}
                          disabled={isRolling || isConnecting}
                          className={`${
                            Number.parseFloat(betAmount) === preset
                              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                          } text-sm py-2 rounded-xl`}
                        >
                          {preset} ETH
                        </Button>
                      ))}
                    </div>

                    {/* Custom Amount Input */}
                    <Input
                      id="bet-amount"
                      type="number"
                      min={MIN_BET_AMOUNT}
                      step="0.001"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      placeholder={`Min: ${MIN_BET_AMOUNT} ETH`}
                      disabled={isRolling || isConnecting}
                    />
                  </div>

                  {/* Choice Selection */}
                  <div className="space-y-2">
                    <div className="text-white font-medium">Choose Your Prediction</div>
                    <div className="grid grid-cols-2 gap-3">
                      {DICE_OPTIONS.map((option) => (
                        <Button
                          key={option.name}
                          variant={selectedChoice === option.name ? "default" : "outline"}
                          onClick={() => setSelectedChoice(option.name)}
                          disabled={isRolling || isConnecting}
                          className={`${
                            selectedChoice === option.name
                              ? "bg-blue-500 hover:bg-blue-600 text-white"
                              : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                          } flex flex-col items-center gap-2 py-4 h-auto rounded-xl`}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-sm font-medium">{option.name}</span>
                          <span className="text-xs opacity-80">{option.description}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Roll Button */}
                  <Button
                    onClick={handleRoll}
                    disabled={isRolling || isConnecting || !isConnected}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
                  >
                    {isConnecting ? "Connecting..." : isRolling ? "Processing..." : `Roll Dice (${betAmount} ETH)`}
                  </Button>

                  {/* Status Messages */}
                  {payoutStatus && (
                    <div className="text-center p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                      <p className="text-green-100">{payoutStatus}</p>
                    </div>
                  )}

                  {payoutError && (
                    <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 justify-center">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="text-red-100">{payoutError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Current Result Display */}
              {currentResult && (
                <Card
                  className={`${currentResult.won ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"} rounded-2xl`}
                >
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div
                        className={`text-lg font-bold mb-2 ${currentResult.won ? "text-green-400" : "text-red-400"}`}
                      >
                        {currentResult.won ? "YOU WON!" : "YOU LOST!"}
                      </div>
                      <div className="text-white/80 text-sm mb-2">
                        Dice: {currentResult.dice1} + {currentResult.dice2} = {currentResult.total}
                      </div>
                      <div className="text-white/70 text-sm">Your choice: {currentResult.playerChoice}</div>
                      {currentResult.won && (
                        <div className="text-green-400 font-bold text-sm mt-2">
                          Won: {currentResult.winAmount.toFixed(3)} ETH
                        </div>
                      )}
                      <div className="text-white/60 text-xs mt-2">Game #{currentResult.gameNumber}</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Statistics */}
              <div className="grid grid-cols-2 gap-2">
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                  <CardContent className="p-3 text-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <p className="text-white/70 text-sm">Wins</p>
                    <p className="text-white font-bold">{gameHistory.filter((g) => g.won).length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-2xl">
                  <CardContent className="p-3 text-center">
                    <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
                    <p className="text-white/70 text-sm">Losses</p>
                    <p className="text-white font-bold">{gameHistory.filter((g) => !g.won).length}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spinning Popup */}
      <Dialog open={showSpinningPopup} onOpenChange={() => {}}>
        <DialogContent
          className="bg-black/95 backdrop-blur-xl border-white/20 text-white w-[92vw] sm:max-w-lg max-h-[90vh] overflow-hidden p-6 sm:p-8 rounded-2xl"
          style={{ borderRadius: "32px" }}
        >
          <div className="flex flex-col items-center">
            {/* GIF Image */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 mb-6 rounded-2xl">
              <img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQ1OXAwemJmNmFzdmJianhyZGt1bHV3dzBkODJ2M3pvNTB1emZxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/l41lZ8V6ADaUZrTG0/giphy.gif"
                alt="Dice rolling animation"
                className="w-full h-full object-cover rounded-2xl shadow-2xl"
              />
            </div>

            {/* Description Below */}
            <div className="text-center">
              <div className="text-white text-2xl sm:text-3xl font-bold mb-4 drop-shadow-lg">Rolling Dice</div>
              <div className="text-white/90 text-base sm:text-lg mb-6 drop-shadow-md">
                Determining the winning outcome...
              </div>
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>
                <span className="drop-shadow-md">Please wait</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rules Popup */}
      <Dialog open={showRulesPopup} onOpenChange={setShowRulesPopup}>
        <DialogContent
          className="bg-gray-900/98 backdrop-blur-xl border-white/30 text-white w-[92vw] sm:max-w-lg max-h-[80vh] overflow-y-auto p-6 sm:p-8 rounded-2xl"
          style={{ borderRadius: "32px" }}
        >
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-center justify-center">
              <Info className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
              How to Play Dice
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-white/90">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">How to Play</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Place Your Bet - Minimum bet is 0.0004 ETH. Choose your amount.</li>
                <li>Pick Your Choice - Select your prediction and place your bet.</li>
                <li>Win Multiplied Payouts - Test your luck and win big!</li>
                <li>Instant Payouts - Winners receive ETH directly to their wallet.</li>
              </ol>
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
              Recent Games
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
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <div className="text-white/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="capitalize font-medium">{game.playerChoice}</span>
                          <span>→</span>
                          <span className="capitalize font-medium">
                            {game.dice1}+{game.dice2}={game.total}
                          </span>
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
    </>
  )
}
