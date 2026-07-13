"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Wallet, LogOut, Gift, Crown, ChevronRight } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import { GameGrid, type GameGridItem } from "@/components/game-grid"
import { StatsBar } from "@/components/stats-bar"
import { LiveBetsFeed } from "@/components/live-bets-feed"

const GAMES: GameGridItem[] = [
  {
    title: "Colours",
    href: "/colours",
    gradient: "from-purple-600 to-pink-600",
    image:
      "/images/games/colours.png",
    tag: "Pick a colour",
    multiplier: "2.00x",
    isNew: true,
  },
  {
    title: "Coinflip",
    href: "/coinflip",
    gradient: "from-emerald-600 to-teal-600",
    image:
      "/images/games/coinflip.png",
    tag: "50/50 flip",
    multiplier: "2.00x",
    isHot: true,
  },
  {
    title: "Dice",
    href: "/dice",
    gradient: "from-orange-500 to-amber-600",
    image:
      "/images/games/dice.png",
    tag: "Roll over/under",
    multiplier: "up to 9.90x",
  },
  {
    title: "Limbo",
    href: "/limbo",
    gradient: "from-blue-600 to-indigo-600",
    image:
      "/images/games/limbo.png",
    tag: "Set your multiplier",
    multiplier: "up to 100x",
    isHot: true,
  },
  {
    title: "Plinko",
    href: "/plinko",
    gradient: "from-cyan-600 to-blue-700",
    image:
      "/images/games/plinko.png",
    tag: "Drop the ball",
    multiplier: "up to 6.00x",
  },
]

export default function HomePage() {
  const { address, provider, isConnected, connect, disconnect } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [ethPrice, setEthPrice] = useState<number>(0)
  const [priceLoading, setPriceLoading] = useState(false)

  // Fetch wallet balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && address && provider) {
        setLoading(true)
        try {
          const balance = await provider.getBalance(address)
          setBalance(Number(ethers.formatEther(balance)))
        } catch (error) {
          console.error("Error fetching balance:", error)
          setBalance(0)
        } finally {
          setLoading(false)
        }
      } else {
        setBalance(0)
      }
    }

    fetchBalance()
  }, [isConnected, address, provider])

  // Fetch ETH price from CoinGecko API
  useEffect(() => {
    const fetchEthPrice = async () => {
      setPriceLoading(true)
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
        const data = await response.json()
        setEthPrice(data.ethereum.usd)
      } catch (error) {
        console.error("Error fetching ETH price:", error)
        setEthPrice(3500) // Fallback price
      } finally {
        setPriceLoading(false)
      }
    }

    fetchEthPrice()

    // Refresh price every 5 minutes
    const interval = setInterval(fetchEthPrice, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const formatAddressCenter = (address: string, maxLength = 32) => {
    if (address.length <= maxLength) return address
    const start = Math.floor((maxLength - 3) / 2)
    const end = Math.ceil((maxLength - 3) / 2)
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  const handleWalletAction = async () => {
    if (isConnected) {
      await disconnect()
    } else {
      await connect()
    }
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-[#0c0b16]" />

      <div className="container mx-auto px-4 py-4 page-transition space-y-6">
        {/* Hero + Wallet */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 relative overflow-visible rounded-2xl bg-gradient-to-br from-grape-light via-grape to-grape-dark border border-white/10 shadow-2xl">
            <div className="absolute -top-12 md:-top-24 -right-12 md:-right-24 w-[200px] h-[200px] md:w-[420px] md:h-[420px] bg-white/10 rounded-full blur-3xl" />
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 p-4 md:p-6 lg:p-8">
              <div className="flex-1 text-white text-center md:text-left md:pt-2">
                <p className="text-sm md:text-base text-white/80">All Bets Fair &amp; Secure · On-chain</p>
                <h1 className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                  Provably Fair Bets, <span className="text-yellow-300">Verified On-Chain</span>
                </h1>
                <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <Link href="/colours">
                    <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-4 md:px-6 py-3 md:py-5 rounded-xl hover:from-yellow-300 hover:to-yellow-500 text-sm md:text-base">
                      Play now
                    </Button>
                  </Link>
                  <Link href="/promotions">
                    <Button
                      variant="outline"
                      className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-4 md:px-6 py-3 md:py-5 rounded-xl text-sm md:text-base"
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      View Promotions
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative w-[200px] sm:w-[220px] md:w-[250px] lg:w-[300px] shrink-0">
                <img
                  src="/images/genie.png"
                  alt="Oddiq genie"
                  className="animate-genie-float block h-auto w-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-grape to-grape-dark border border-white/10 shadow-2xl p-4 md:p-6 lg:p-8 flex flex-col justify-between">
            <div className="text-white">
              {isConnected ? (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">
                    Your <span className="text-yellow-300">Wallet</span>
                  </h3>
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="col-span-1 sm:col-span-2 bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-white/60 mb-1">Wallet Address</p>
                      <p className="font-mono text-white text-xs md:text-sm lg:text-xs xl:text-sm break-all">
                        {address ? formatAddressCenter(address) : "N/A"}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-white/60 mb-1">ETH Balance</p>
                      <p className="text-sm font-semibold text-white">
                        {loading ? "Loading..." : `${balance.toFixed(4)} ETH`}
                      </p>
                    </div>

                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="text-xs text-white/60 mb-1">USD Equivalent</p>
                      <p className="text-sm font-semibold text-white">
                        {loading || priceLoading ? "0.00" : (balance * ethPrice).toFixed(2)} USD
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl md:text-2xl font-bold text-center md:text-left">
                    Cashbacks <span className="text-yellow-300">every week</span>
                  </h3>
                  <p className="text-white/70 mt-2 text-center md:text-left">
                    Connect your wallet to start earning rewards.
                  </p>
                </>
              )}
            </div>
            <div className="mt-4 md:mt-6 flex gap-2 justify-center md:justify-start">
              <Button
                onClick={handleWalletAction}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-4 md:px-6 py-3 md:py-5 rounded-xl hover:from-yellow-300 hover:to-yellow-500 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto"
              >
                {isConnected ? (
                  <>
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Trust stats */}
        <StatsBar />

        {/* VIP teaser strip */}
        <Link href="/vip" className="block">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 via-white/5 to-transparent px-4 py-3 transition-colors hover:border-yellow-500/40">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-yellow-400" />
              <p className="text-sm text-white/80">
                Join <span className="font-semibold text-white">Oddiq VIP Club</span> for weekly cashback, faster
                payouts and exclusive drops.
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-white/40" />
          </div>
        </Link>

        {/* Game library */}
        <div id="games">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Originals
              </span>
            </h2>
            <span className="text-xs text-white/40">{GAMES.length} games</span>
          </div>
          <GameGrid games={GAMES} />
        </div>

        {/* Live bets */}
        <LiveBetsFeed />
      </div>
    </>
  )
}
