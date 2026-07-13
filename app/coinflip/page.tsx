"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/components/wallet-provider"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Wallet, Info, Clock } from "lucide-react"
import { CoinflipVisualResult } from "@/components/coinflip-visual-result"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  HOUSE_WALLET_ADDRESS,
  MIN_BET_AMOUNT,
  type CoinSide,
  type GameResult,
} from "@/lib/game-config"
import { playGlobalCoinflipGame } from "@/lib/global-game-service"
import { GameBreadcrumb } from "@/components/game-breadcrumb"

const BET_PRESETS = [0.001, 0.01, 0.1, 1.0]

export default function CoinflipPage() {
  const { address, provider, isConnected } = useWallet()

  const [betAmount, setBetAmount] = useState(MIN_BET_AMOUNT.toString())
  const [selectedSide, setSelectedSide] = useState<CoinSide>("heads")
  const [isFlipping, setIsFlipping] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameResult[]>([])
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null)
  const [payoutStatus, setPayoutStatus] = useState<string>("")
  const [payoutError, setPayoutError] = useState<string>("")
  const [actualCoinSide, setActualCoinSide] = useState<CoinSide | null>(null)
  const [showSpinningPopup, setShowSpinningPopup] = useState(false)
  const [showRulesPopup, setShowRulesPopup] = useState(false)
  const [showRecentGamesPopup, setShowRecentGamesPopup] = useState(false)

  const handleFlip = useCallback(async () => {
    setCurrentResult(null)
    setPayoutStatus("")
    setPayoutError("")
    setActualCoinSide(null)

    if (!isConnected || !address) {
      setPayoutError("Please connect your MetaMask wallet first!")
      return
    }

    if (!provider) {
      setPayoutError("No provider available!")
      return
    }

    const amount = Number.parseFloat(betAmount)
    if (isNaN(amount) || amount < MIN_BET_AMOUNT) {
      setPayoutError(`Minimum bet is ${MIN_BET_AMOUNT} ETH`)
      return
    }

    setIsFlipping(true)

    try {
      setPayoutStatus("Checking your wallet balance...")

      const balance = await provider.getBalance(address)
      const balanceInEth = Number(ethers.formatEther(balance))

      if (balanceInEth < amount) {
        throw new Error(`Insufficient balance. You need ${amount} ETH but have ${balanceInEth.toFixed(4)} ETH`)
      }

      setPayoutStatus("Creating bet transaction...")

      const signer = await provider.getSigner()
      const tx = {
        to: HOUSE_WALLET_ADDRESS,
        value: ethers.parseEther(amount.toString()),
      }

      setPayoutStatus("Please approve the transaction in your wallet...")

      const txResponse = await signer.sendTransaction(tx)

      setPayoutStatus("Confirming your bet transaction...")
      console.log(`Bet transaction sent: ${txResponse.hash}`)

      await txResponse.wait()
      console.log(`Bet confirmed: ${txResponse.hash}`)

      setPayoutStatus("Bet confirmed! Flipping coin...")
      setShowSpinningPopup(true)

      await new Promise((resolve) => setTimeout(resolve, 3000))
      setShowSpinningPopup(false)

      console.log(`CALLING playGlobalCoinflipGame(${amount})...`)
      const gameResult = await playGlobalCoinflipGame(address, txResponse.hash, amount, selectedSide)
      console.log("VERIFIED COINFLIP GAME RESULT:", gameResult)
      const playerWins = gameResult.won
      const gameNumber = Date.now()

      const finalActualSide: CoinSide = gameResult.visual.actualResult
      setActualCoinSide(finalActualSide)
      const winAmount = gameResult.payout

      const result: GameResult = {
        won: playerWins,
        playerChoice: selectedSide,
        actualResult: finalActualSide,
        betAmount: amount,
        winAmount,
        gameNumber,
      }

      setCurrentResult(result)
      setGameHistory((prev) => [result, ...prev.slice(0, 9)])

      if (playerWins && winAmount > 0) {
        if (gameResult.payoutTxHash) {
          setPayoutStatus(`PAYOUT SENT! ${winAmount.toFixed(3)} ETH has been transferred to your wallet!`)
          console.log(`Payout successful: ${gameResult.payoutTxHash}`)
        } else {
          setPayoutError(`Payout failed: ${gameResult.payoutError ?? "Unknown error"}`)
          console.error("Payout failed:", gameResult.payoutError)
        }
      } else {
        setPayoutStatus(`You lost this round! (Coinflip Game #${gameNumber}) Better luck next time!`)
      }
    } catch (error) {
      console.error("Game error:", error)
      setShowSpinningPopup(false)

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

      setPayoutError(`${errorMessage}`)
    } finally {
      setIsFlipping(false)
      setShowSpinningPopup(false)
    }
  }, [address, provider, betAmount, selectedSide, isConnected])

  if (!isConnected) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

        <div className="min-h-screen relative py-8 w-full">
          <div className="container mx-auto relative z-10 px-4">
            <GameBreadcrumb game="Coinflip" />
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Coinflip Game</h1>
              <p className="text-white/80 drop-shadow-md">Test your luck with our provably fair coin flip on Oddiq!</p>
            </div>
            <div className="max-w-2xl mx-auto p-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardContent className="p-8 text-center">
                  <Wallet className="h-16 w-16 text-white/50 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                  <p className="text-white/70 mb-4">
                    Please connect your MetaMask wallet to start playing coinflip on Oddiq.
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

      <div className="min-h-screen relative py-4 w-full">
        <div className="container mx-auto relative z-10 px-4">
          <GameBreadcrumb game="Coinflip" />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 mt-6">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">Coinflip Game</h1>
              <p className="text-white/80 drop-shadow-md">Test your luck with our provably fair coin flip on Oddiq!</p>
            </div>
            <div className="flex gap-3 justify-center sm:justify-end">
              <Button
                onClick={() => setShowRecentGamesPopup(true)}
                variant="outline"
                className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[120px]"
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent Games
              </Button>
              <Button
                onClick={() => setShowRulesPopup(true)}
                variant="outline"
                className="bg-white/15 hover:bg-white/25 text-white border-white/30 hover:border-white/50 rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 shadow-lg backdrop-blur-sm min-w-[100px]"
              >
                <Info className="h-4 w-4 mr-2" />
                Rules
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <CoinflipVisualResult
                actualSide={actualCoinSide}
                isWinner={currentResult?.won ?? null}
                isAnimating={isFlipping}
                currentResult={currentResult}
              />
            </div>

            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-2xl flex items-center gap-2">Coinflip Controls</CardTitle>
                  <p className="text-white/70">Choose heads or tails, place your bet, and flip!</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="bet-amount" className="text-white font-medium">
                      Bet Amount (ETH)
                    </Label>

                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {BET_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          variant={Number.parseFloat(betAmount) === preset ? "default" : "outline"}
                          onClick={() => setBetAmount(preset.toString())}
                          disabled={isFlipping}
                          className={`${Number.parseFloat(betAmount) === preset ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} text-sm py-2 rounded-xl`}
                        >
                          {preset} ETH
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
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 rounded-xl"
                      placeholder={`Min: ${MIN_BET_AMOUNT} ETH`}
                      disabled={isFlipping}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Choose Your Side</Label>
                    <div className="flex gap-4">
                      <Button
                        variant={selectedSide === "heads" ? "default" : "outline"}
                        onClick={() => setSelectedSide("heads")}
                        disabled={isFlipping}
                        className={`${selectedSide === "heads" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} flex-1 rounded-xl`}
                      >
                        Heads
                      </Button>
                      <Button
                        variant={selectedSide === "tails" ? "default" : "outline"}
                        onClick={() => setSelectedSide("tails")}
                        disabled={isFlipping}
                        className={`${selectedSide === "tails" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20 text-white border-white/20"} flex-1 rounded-xl`}
                      >
                        Tails
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleFlip}
                    disabled={isFlipping || !isConnected}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 text-lg disabled:opacity-50 rounded-xl"
                  >
                    {isFlipping ? "Processing..." : `Flip Coin (${betAmount} ETH)`}
                  </Button>

                  {payoutStatus && (
                    <div className="text-center p-3 bg-green-500/20 border border-green-500/50 rounded-xl">
                      <p className="text-green-100">{payoutStatus}</p>
                    </div>
                  )}

                  {payoutError && (
                    <div className="text-center p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2 justify-center">
                      <p className="text-red-100">{payoutError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
