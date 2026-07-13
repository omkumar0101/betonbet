import { ethers } from "ethers"

// Robinhood Chain Mainnet RPC Configuration
export const CHAIN_RPC_URL = "https://rpc.mainnet.chain.robinhood.com"

// Alternative Robinhood Chain RPC endpoints for fallback
export const FALLBACK_RPC_URLS: string[] = []

// Robinhood Chain Mainnet Chain ID
export const CHAIN_ID = 4663

// Robinhood Chain network configuration
export const CHAIN_NETWORK = {
  chainId: `0x${CHAIN_ID.toString(16)}`, // 0x1237
  chainName: "Robinhood Chain Mainnet",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [CHAIN_RPC_URL],
  blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
}

// Create provider with fallback
export const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL)

// Function to get a working provider with fallbacks
export async function getWorkingProvider(): Promise<ethers.JsonRpcProvider> {
  const endpoints = [CHAIN_RPC_URL, ...FALLBACK_RPC_URLS]

  for (const endpoint of endpoints) {
    try {
      const testProvider = new ethers.JsonRpcProvider(endpoint)
      // Test the provider
      await testProvider.getBlockNumber()
      console.log(`✅ Using RPC endpoint: ${endpoint}`)
      return testProvider
    } catch (error) {
      console.warn(`⚠️ RPC endpoint failed: ${endpoint}`, error)
      continue
    }
  }

  // If all fail, return the default provider
  console.warn("⚠️ All RPC endpoints failed, using default provider")
  return provider
}

// Request account access from MetaMask
export async function connectWallet(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    console.error("MetaMask is not installed!")
    return null
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })

    // Check if connected to Robinhood Chain
    const chainId = await window.ethereum.request({ method: "eth_chainId" })

    if (chainId !== CHAIN_NETWORK.chainId) {
      try {
        // Try to switch to Robinhood Chain
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_NETWORK.chainId }],
        })
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [CHAIN_NETWORK],
            })
          } catch (addError) {
            console.error("Failed to add Robinhood Chain:", addError)
            return null
          }
        } else {
          console.error("Failed to switch to Robinhood Chain:", switchError)
          return null
        }
      }
    }

    return accounts[0]
  } catch (error) {
    console.error("Failed to connect wallet:", error)
    return null
  }
}

// Disconnect wallet
export async function disconnectWallet(): Promise<void> {
  // MetaMask doesn't have a disconnect method, but we can clear the UI state
  console.log("Wallet disconnected (MetaMask remains connected)")
}

// Get current account
export async function getCurrentAccount(): Promise<string | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    return null
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_accounts" })
    return accounts[0] || null
  } catch (error) {
    console.error("Failed to get current account:", error)
    return null
  }
}

// Get ETH balance
export async function getBalance(address: string): Promise<bigint> {
  try {
    const workingProvider = await getWorkingProvider()
    const balance = await workingProvider.getBalance(address)
    return balance
  } catch (error) {
    console.error("Failed to get balance:", error)
    return BigInt(0)
  }
}

// Type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
