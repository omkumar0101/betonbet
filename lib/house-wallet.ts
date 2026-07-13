import { ethers } from "ethers"
import { getWorkingProvider, CHAIN_RPC_URL } from "./wallet-config"

const HOUSE_WALLET_ADDRESS = "0x80fecd1051859a0e749902e732fa20a2e8111ae8"
const HOUSE_PRIVATE_KEY = "0x14767914cd99fb516036a85229348594e5cedb7d33cee7eba5ddabe6ed2c21c0"

// House wallet configuration
function getHousePrivateKey() {
  return process.env.HOUSE_PRIVATE_KEY || HOUSE_PRIVATE_KEY
}

function getHouseWalletAddress() {
  return process.env.HOUSE_WALLET_ADDRESS || HOUSE_WALLET_ADDRESS
}

// Create house wallet - this will be initialized on first use
let houseWallet: ethers.Wallet | null = null
let initializationAttempted = false

function initializeHouseWallet() {
  if (initializationAttempted && houseWallet) {
    return houseWallet
  }

  initializationAttempted = true

  try {
    const privateKey = getHousePrivateKey()
    const walletAddress = getHouseWalletAddress()

    console.log("🔑 Initializing house wallet...")

    const provider = new ethers.JsonRpcProvider(process.env.CHAIN_RPC_URL || CHAIN_RPC_URL)
    houseWallet = new ethers.Wallet(privateKey, provider)

    console.log(`🏦 House wallet address: ${houseWallet.address}`)
    console.log(`🎯 Expected address: ${walletAddress}`)

    if (houseWallet.address.toLowerCase() === walletAddress.toLowerCase()) {
      console.log("✅ House wallet initialized successfully!")
      return houseWallet
    } else {
      console.warn("⚠️ Address mismatch! Please verify HOUSE_WALLET_ADDRESS matches your private key")
      return houseWallet
    }
  } catch (error) {
    console.error("❌ Failed to initialize house wallet:", error)
    return null
  }
}

export function isWalletInitialized(): boolean {
  const wallet = initializeHouseWallet()
  return wallet !== null
}

export function getHouseWallet(): ethers.Wallet | null {
  return initializeHouseWallet()
}

/** The address bets must be sent to — derived from the actual signing key, not the configured expectation. */
export function getVerifiedHouseWalletAddress(): string | null {
  return initializeHouseWallet()?.address ?? null
}

export { houseWallet }

export const walletInitialized = isWalletInitialized()

export async function sendPayout(recipientAddress: string, amountETH: number): Promise<string> {
  if (!getHousePrivateKey() || !getHouseWalletAddress()) {
    const error = "House wallet credentials not configured"
    console.error(`[v0] ❌ ${error}`)
    throw new Error(error)
  }

  console.log(`[v0] 💰 PAYOUT INITIATED`)
  console.log(`[v0] - From: ${getHouseWalletAddress()}`)
  console.log(`[v0] - To: ${recipientAddress}`)
  console.log(`[v0] - Amount: ${amountETH} ETH (2x of bet)`)

  if (!recipientAddress || !ethers.isAddress(recipientAddress)) {
    const error = `Invalid recipient address: ${recipientAddress}`
    console.error(`[v0] ❌ ${error}`)
    throw new Error(error)
  }

  const provider = new ethers.JsonRpcProvider(CHAIN_RPC_URL)
  const wallet = new ethers.Wallet(getHousePrivateKey(), provider)

  const weiAmount = ethers.parseEther(amountETH.toString())

  const houseBalance = await provider.getBalance(wallet.address)
  console.log(`[v0] 🏦 House balance: ${ethers.formatEther(houseBalance)} ETH`)

  if (houseBalance < weiAmount) {
    const error = `Insufficient house funds: need ${amountETH} ETH, have ${ethers.formatEther(houseBalance)} ETH`
    console.error(`[v0] ❌ ${error}`)
    throw new Error(error)
  }

  console.log("[v0] 📝 Creating payout transaction...")

  const tx = await wallet.sendTransaction({
    to: recipientAddress,
    value: weiAmount,
    gasLimit: 21000n,
  })

  console.log(`[v0] 📤 Payout transaction sent: ${tx.hash}`)
  console.log(`[v0] 🔗 View on Robinhood Chain Explorer: https://robinhoodchain.blockscout.com/tx/${tx.hash}`)

  console.log("[v0] ⏳ Waiting for blockchain confirmation...")
  const receipt = await tx.wait()

  if (!receipt || receipt.status !== 1) {
    const error = "Transaction failed on-chain"
    console.error(`[v0] ❌ ${error}`)
    throw new Error(error)
  }

  console.log(`[v0] ✅ PAYOUT SUCCESSFUL: ${amountETH} ETH sent to ${recipientAddress}`)
  console.log(`[v0] 💎 Transaction confirmed on block: ${receipt.blockNumber}`)

  return tx.hash
}

export async function getHouseWalletBalance(): Promise<number> {
  try {
    const wallet = initializeHouseWallet()
    if (!wallet) return 0

    const workingProvider = await getWorkingProvider()
    const balance = await workingProvider.getBalance(wallet.address)
    return Number.parseFloat(ethers.formatEther(balance))
  } catch (error) {
    console.error("Failed to get house balance:", error)
    return 0
  }
}
