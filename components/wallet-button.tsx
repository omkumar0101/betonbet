"use client"

import { useWallet } from "./wallet-provider"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function WalletButton() {
  const { address, connect, disconnect, isConnecting, isConnected } = useWallet()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleClick = async () => {
    setError("")

    try {
      if (!isConnected) {
        await connect()
      } else {
        await disconnect()
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      setError("Connection failed")

      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000)
    }
  }

  const getButtonText = () => {
    if (isConnecting) return "Connecting..."
    if (isConnected && address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    if (error) return error
    return "Connect Wallet"
  }

  const getButtonClass = () => {
    if (error) return "bg-red-500 hover:bg-red-600 text-white"
    if (isConnected) return "bg-green-500 hover:bg-green-600 text-black"
    return "bg-yellow-400 hover:bg-yellow-500 text-black"
  }

  if (!mounted) {
    return <Button className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full px-6">Connect Wallet</Button>
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isConnecting}
      className={`${getButtonClass()} rounded-full px-6 transition-all duration-300 hover-lift hover-scale relative overflow-hidden group shadow-lg hover:shadow-xl`}
    >
      <span className="relative z-10 font-medium">{getButtonText()}</span>
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      {/* Glow effect */}
      {isConnected && <div className="absolute inset-0 bg-green-400/20 rounded-full animate-glow-pulse"></div>}
      {isConnecting && <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-pulse"></div>}
      {error && <div className="absolute inset-0 bg-red-400/20 rounded-full animate-pulse"></div>}
    </Button>
  )
}
