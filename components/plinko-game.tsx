"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ethers } from "ethers"
import {
  HOUSE_WALLET_ADDRESS,
  MIN_BET_AMOUNT,
  BOARD_ROWS,
  MULTIPLIERS,
  type PlinkoGameResult,
} from "@/lib/plinko-config"
import { playGlobalPlinkoGame } from "@/lib/global-game-service"
import { Triangle, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Wallet } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const BET_PRESETS = [0.0004, 0.004, 0.01, 0.05]

export function PlinkoGame() {
  const { address, provider, isConnected } = useWallet()

  const [betAmount, setBetAmount] = useState("0.0004")
  const [isDropping, setIsDropping] = useState(false)
  const [gameHistory, setGameHistory] = useState<PlinkoGameResult[]>([])
  const [currentResult, setCurrentResult] = useState<PlinkoGameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [ballPosition, setBallPosition] = useState<{ row: number; col: number } | null>(null)
  const [ballPath, setBallPath] = useState<number[]>([])
  const [animationStep, setAnimationStep] = useState(0)

  const handleDrop = useCallback(async () => {
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setBallPosition(null)
    setBallPath([])
    setAnimationStep(0)

    if (!isConnected || !address) {
      setPayoutError("❌ Please connect your MetaMask wallet first!")
      return
    }

    if (!provider) {
      setPayoutError("❌ No provider available!")
      return
    }

    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`❌ Minimum bet is ${MIN_BET_AMOUNT} ETH`)
      return
    }

    setIsDropping(true)

    try {
      setPayoutStatus("🔍 Checking your wallet balance...")

      const balance = await provider.getBalance(address)
      const balanceInEth = Number(ethers.formatEther(balance))

      if (balanceInEth < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ETH but have ${balanceInEth.toFixed(4)} ETH`)
      }

      setPayoutStatus("🎯 Creating bet transaction...")

      const signer = await provider.getSigner()
      const tx = {
        to: HOUSE_WALLET_ADDRESS,
        value: ethers.parseEther(amount.toString()),
      }

      setPayoutStatus("📝 Please approve the transaction in your wallet...")

      const txResponse = await signer.sendTransaction(tx)

      setPayoutStatus("⏳ Confirming your bet transaction...")
      console.log(`💰 Bet transaction sent: ${txResponse.hash}`)

      await txResponse.wait()
      console.log(`✅ Bet confirmed: ${txResponse.hash}`)

      setPayoutStatus("✅ Bet confirmed! Verifying bet & dropping ball...")

      // Ask the server to verify this bet transaction on-chain and resolve it fairly
      const gameResult = await playGlobalPlinkoGame(address, txResponse.hash, amount)
      const { path, finalSlot, multiplier } = gameResult.visual as {
        path: number[]
        finalSlot: number
        multiplier: number
      }
      setBallPath(path)

      // Animate the ball along the server-determined path
      for (let i = 0; i < path.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setAnimationStep(i)
      }

      const isWinner = gameResult.won
      const winAmount = gameResult.payout

      const result: PlinkoGameResult = {
        won: isWinner,
        multiplier,
        betAmount: amount,
        winAmount,
        slotIndex: finalSlot,
        gameNumber: Date.now(),
        ballPath: path,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      if (isWinner && winAmount > 0) {
        if (gameResult.payoutTxHash) {
          setPayoutStatus(`🎉 PAYOUT SENT! ${winAmount.toFixed(6)} ETH has been transferred to your wallet!`)
          console.log(`✅ Payout successful: ${gameResult.payoutTxHash}`)
        } else {
          setPayoutError(`❌ Payout failed: ${gameResult.payoutError ?? "Unknown error"}`)
          console.error("❌ Payout failed:", gameResult.payoutError)
        }
      } else {
        setPayoutStatus(`😔 You lost this round! (${multiplier}x multiplier) Better luck next time!`)
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
          errorMessage = "Transaction was cancelled. Please try again and approve the transaction."
        } else if (error.message.includes("Insufficient")) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }

      setPayoutError(`❌ ${errorMessage}`)
    } finally {
      setIsDropping(false)
    }
  }, [address, provider, betAmount, isConnected])

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-white/70 mb-4">Please connect your MetaMask wallet to start playing Plinko on Oddiq.</p>
            <p className="text-sm text-white/50">Click the "Connect Wallet" button in the top right corner.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Enhanced Plinko Board Component with realistic physics
  const PlinkoBoard = () => {
    return (
      <div className="relative min-h-[600px] p-8 overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-grape-light via-grape to-grape-dark"></div>

        <div className="flex flex-col items-center space-y-4 relative z-10">
          {/* Enhanced Industrial Pipe System */}
          <div className="relative mb-8">
            <div className="relative">
              {/* Enhanced pipe curves with glow */}
              <div className="absolute -left-16 -top-4 w-20 h-16 border-8 border-gray-400 rounded-tl-full bg-gradient-to-br from-gray-300 to-gray-500 shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-br from-gray-600 to-gray-800 rounded-tl-full"></div>
              </div>

              <div className="absolute -right-16 -top-4 w-20 h-16 border-8 border-gray-400 rounded-tr-full bg-gradient-to-bl from-gray-300 to-gray-500 shadow-2xl">
                <div className="absolute inset-2 bg-gradient-to-bl from-gray-600 to-gray-800 rounded-tr-full"></div>
              </div>

              {/* Enhanced main pipe body */}
              <div className="w-32 h-12 bg-gradient-to-b from-gray-300 to-gray-500 border-4 border-gray-400 relative shadow-2xl rounded-lg">
                <div className="absolute inset-2 bg-gradient-to-b from-gray-700 to-gray-900 rounded"></div>

                {/* Metallic shine effect */}
                <div className="absolute top-1 left-2 right-2 h-2 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>

                {/* Enhanced pipe opening */}
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-gray-400 to-gray-600 rounded-b-lg border-4 border-gray-500 shadow-xl">
                  <div className="absolute inset-1 bg-gradient-to-b from-gray-800 to-black rounded-b-md"></div>
                </div>

                {/* Enhanced ball in pipe with glow */}
                {ballPosition && ballPosition.row === -1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-10 shadow-2xl">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                    <div className="absolute inset-0 bg-red-400/50 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Enhanced ball dropping with trail effect */}
              {ballPosition && ballPosition.row === -0.5 && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-10 shadow-2xl">
                  <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                  <div className="absolute inset-0 bg-red-400/50 rounded-full animate-pulse"></div>
                  {/* Motion trail */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-8 bg-gradient-to-t from-red-400/60 to-transparent rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced White Pegs with physics interaction */}
          {Array.from({ length: BOARD_ROWS }, (_, row) => (
            <div
              key={row}
              className="flex justify-center space-x-10 animate-fade-in-up"
              style={{
                marginLeft: `${(BOARD_ROWS - row - 1) * 20}px`,
                animationDelay: `${row * 0.1}s`,
              }}
            >
              {Array.from({ length: row + 2 }, (_, col) => (
                <div key={col} className="relative">
                  {/* Enhanced peg with metallic effect */}
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-100 to-gray-300 rounded-full relative shadow-2xl border-2 border-gray-200 hover:scale-110 transition-all duration-300">
                    {/* Inner shine */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-80"></div>
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>

                  {/* Enhanced ball with realistic physics */}
                  {ballPosition && ballPosition.row === row && ballPosition.col === col && (
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce z-20 shadow-2xl">
                      {/* Ball shine effect */}
                      <div className="absolute top-2 left-2 w-3 h-3 bg-red-200 rounded-full"></div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-red-400/60 rounded-full animate-pulse"></div>
                      {/* Impact ripple */}
                      <div className="absolute -inset-2 border-2 border-red-400/40 rounded-full animate-ping"></div>
                      {/* Motion blur trail */}
                      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-t from-red-400/40 to-transparent rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Enhanced Multiplier Slots */}
          <div className="flex justify-center space-x-4 mt-8">
            {MULTIPLIERS.map((multiplier, index) => (
              <div
                key={index}
                className={`relative w-16 h-16 rounded-lg border-2 flex items-center justify-center text-white font-bold text-sm transition-all duration-300 ${
                  ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index
                    ? "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 scale-110 shadow-2xl"
                    : "bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500"
                }`}
              >
                {/* Slot glow effect */}
                {ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index && (
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-lg animate-pulse"></div>
                )}

                {/* Multiplier text */}
                <span className="relative z-10">{multiplier}x</span>

                {/* Ball in slot */}
                {ballPosition && ballPosition.row === BOARD_ROWS && ballPosition.col === index && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-bounce shadow-xl">
                    <div className="absolute top-1 left-1 w-2 h-2 bg-red-200 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
      {/* Left Column: Plinko Board */}
      <div className="lg:col-span-2 space-y-4">
        {/* Plinko Board */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center gap-2">
              <Triangle className="h-6 w-6" />
              Industrial Plinko Board
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PlinkoBoard />
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Game Controls and Info */}
      <div className="space-y-4">
        {/* Game Controls */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center gap-2">
              <Triangle className="h-6 w-6" />
              Plinko Game Controls
            </CardTitle>
            <div className="space-y-2 mt-2">
              <p className="text-white/70">Drop the ball and watch it bounce to win!</p>
              <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg p-2">
                <p className="text-cyan-300 text-sm">
                  🔒 <strong>Provably Fair:</strong> Each drop's path is derived from a server-committed seed, verifiable after the fact
                </p>
              </div>
            </div>
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
                    disabled={isDropping}
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
                disabled={isDropping}
              />
            </div>

            {/* Drop Button */}
            <Button
              onClick={handleDrop}
              disabled={isDropping || !isConnected}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
            >
              {isDropping ? "Dropping..." : `Drop Ball (${betAmount} ETH)`}
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
                <div className="flex items-center justify-center gap-2 mb-2">
                  {currentResult.won ? (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  ) : currentResult.multiplier > 0 ? (
                    <CheckCircle className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-400" />
                  )}
                  <h3
                    className={`text-lg font-bold ${
                      currentResult.won
                        ? "text-green-400"
                        : currentResult.multiplier > 0
                          ? "text-yellow-400"
                          : "text-red-400"
                    }`}
                  >
                    {currentResult.won
                      ? "YOU WON!"
                      : currentResult.multiplier > 0
                        ? `${(currentResult.multiplier * 100).toFixed(0)}% REFUND`
                        : "TRY AGAIN!"}
                  </h3>
                </div>
                <div className="text-white/80 text-sm mb-2">Multiplier: {currentResult.multiplier}x</div>
                <div className="text-white/70 text-sm">Bet: {currentResult.betAmount.toFixed(3)} ETH</div>
                <div className="text-white/70 text-sm">Win: {currentResult.winAmount.toFixed(3)} ETH</div>
                {currentResult.won && (
                  <div className="text-green-400 font-bold text-sm mt-2">
                    Profit: {(currentResult.winAmount - currentResult.betAmount).toFixed(3)} ETH
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Jackpot Alert */}
        <Card className="bg-purple-500/20 border-purple-500/50 rounded-2xl">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">💎</div>
            <div className="text-purple-300 font-bold">JACKPOT SLOTS!</div>
            <div className="text-white text-sm">Hit the edges for 6x multiplier!</div>
          </CardContent>
        </Card>

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
  )
}
