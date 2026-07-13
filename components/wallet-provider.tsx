"use client"

import { type ReactNode, createContext, useContext, useState, useEffect, useCallback } from "react"
import { connectWallet, disconnectWallet, getCurrentAccount, getBalance } from "@/lib/wallet-config"
import { ethers } from "ethers"

interface WalletContextType {
  address: string | null
  balance: string
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  refreshBalance: () => Promise<void>
  sendTransaction: (to: string, value: bigint) => Promise<string>
  provider: ethers.BrowserProvider | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  const refreshBalance = useCallback(async () => {
    if (address) {
      try {
        const bal = await getBalance(address)
        setBalance(ethers.formatEther(bal))
      } catch (error) {
        console.error("Failed to refresh balance:", error)
      }
    }
  }, [address])

  const connect = useCallback(async () => {
    if (typeof window === "undefined") {
      console.error("Window is undefined - not in browser context")
      return
    }

    if (!window.ethereum) {
      console.error("MetaMask is not installed!")
      alert(
        "MetaMask is not installed!\n\nPlease install MetaMask extension from:\nhttps://metamask.io/download/\n\nThen refresh the page to connect your wallet.",
      )
      return
    }

    setIsConnecting(true)
    try {
      console.log("[v0] Attempting to connect wallet...")
      const account = await connectWallet()

      if (account) {
        console.log("[v0] Connected to account:", account)
        setAddress(account)
        setIsConnected(true)

        const browserProvider = new ethers.BrowserProvider(window.ethereum)
        setProvider(browserProvider)
        console.log("[v0] Provider initialized successfully")

        const bal = await getBalance(account)
        setBalance(ethers.formatEther(bal))
        console.log("[v0] Balance loaded:", ethers.formatEther(bal), "ETH")
      } else {
        console.error("[v0] Failed to get account")
      }
    } catch (error) {
      console.error("[v0] Failed to connect wallet:", error)
      if (error instanceof Error) {
        alert(`Failed to connect wallet: ${error.message}`)
      }
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await disconnectWallet()
    setAddress(null)
    setBalance("0")
    setIsConnected(false)
    setProvider(null)
    console.log("[v0] Wallet disconnected")
  }, [])

  const sendTransaction = useCallback(
    async (to: string, value: bigint): Promise<string> => {
      console.log("[v0] sendTransaction called")
      console.log("[v0] - To:", to)
      console.log("[v0] - Value:", ethers.formatEther(value), "ETH")
      console.log("[v0] - Provider exists:", !!provider)
      console.log("[v0] - Address exists:", !!address)
      console.log("[v0] - window.ethereum exists:", !!(typeof window !== "undefined" && window.ethereum))

      if (typeof window === "undefined") {
        throw new Error("Not in browser context")
      }

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed. Please install MetaMask to make transactions.")
      }

      if (!address) {
        throw new Error("Wallet not connected. Please connect your wallet first.")
      }

      try {
        const txProvider = new ethers.BrowserProvider(window.ethereum)
        const signer = await txProvider.getSigner()

        console.log("[v0] Signer obtained, sending transaction...")

        const tx = await signer.sendTransaction({
          to,
          value,
        })

        console.log("[v0] Transaction sent, hash:", tx.hash)
        console.log("[v0] Waiting for confirmation...")

        await tx.wait()

        console.log("[v0] Transaction confirmed!")
        await refreshBalance()

        return tx.hash
      } catch (error) {
        console.error("[v0] Transaction failed:", error)

        if (error instanceof Error) {
          if (error.message.includes("user rejected")) {
            throw new Error("Transaction was rejected by user")
          } else if (error.message.includes("insufficient funds")) {
            throw new Error("Insufficient ETH balance for this transaction")
          }
        }
        throw error
      }
    },
    [address, provider, refreshBalance],
  )

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === "undefined") {
        console.log("[v0] Not in browser context")
        return
      }

      try {
        if (!window.ethereum) {
          console.log("[v0] MetaMask not detected on page load")
          return
        }

        console.log("[v0] Checking for existing connection...")
        const account = await getCurrentAccount()

        if (account) {
          console.log("[v0] Found existing connection:", account)
          setAddress(account)
          setIsConnected(true)

          const browserProvider = new ethers.BrowserProvider(window.ethereum)
          setProvider(browserProvider)

          const bal = await getBalance(account)
          setBalance(ethers.formatEther(bal))
          console.log("[v0] Auto-connected with balance:", ethers.formatEther(bal), "ETH")
        } else {
          console.log("[v0] No existing connection found")
        }
      } catch (error) {
        // Suppress proxy-related errors from preview environment
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (
          !errorMessage.includes("proxy") &&
          !errorMessage.includes("property descriptor") &&
          !errorMessage.includes("getter")
        ) {
          console.error("[v0] Error checking connection:", error)
        }
      }
    }
    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const handleAccountsChanged = async (accounts: string[]) => {
          console.log("[v0] Accounts changed:", accounts)
          if (accounts.length > 0) {
            setAddress(accounts[0])
            setIsConnected(true)

            const browserProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(browserProvider)

            const bal = await getBalance(accounts[0])
            setBalance(ethers.formatEther(bal))
          } else {
            setAddress(null)
            setBalance("0")
            setIsConnected(false)
            setProvider(null)
          }
        }

        const handleChainChanged = () => {
          console.log("[v0] Chain changed, reloading page...")
          window.location.reload()
        }

        window.ethereum.on("accountsChanged", handleAccountsChanged)
        window.ethereum.on("chainChanged", handleChainChanged)

        return () => {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    } catch (error) {
      // Suppress proxy-related errors from preview environment
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (
        !errorMessage.includes("proxy") &&
        !errorMessage.includes("property descriptor") &&
        !errorMessage.includes("getter")
      ) {
        console.error("[v0] Error setting up event listeners:", error)
      }
    }
  }, [])

  const value: WalletContextType = {
    address,
    balance,
    isConnecting,
    isConnected,
    connect,
    disconnect,
    refreshBalance,
    sendTransaction,
    provider, // Expose provider in context
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
