// Your house wallet configuration (Ethereum address)
export const HOUSE_WALLET_ADDRESS = "0x80fecd1051859a0e749902e732fa20a2e8111ae8"

// Game configuration
export const MIN_BET_AMOUNT = 0.0004 // ETH
export const WINNING_MULTIPLIER = 2.0 // 2.0x payout

// GLOBAL game counter - shared across ALL players and ALL games
let globalCoinGameCounter = 0

export function getGameResult(): boolean {
  globalCoinGameCounter++
  // Every 3rd game globally wins (1st and 2nd lose, 3rd wins)
  const isWinner = globalCoinGameCounter % 3 === 0
  console.log(`🪙 GLOBAL Coin Game ${globalCoinGameCounter}: Player ${isWinner ? "WINS" : "LOSES"}`)
  console.log(`🔢 Next win will be at game: ${globalCoinGameCounter + (3 - (globalCoinGameCounter % 3))}`)
  return isWinner
}

export function resetGameCounter() {
  globalCoinGameCounter = 0
  console.log("🔄 Global coin game counter reset to 0")
}

export function getCurrentCoinGameCount(): number {
  return globalCoinGameCounter
}

export type CoinSide = "heads" | "tails"

export interface GameResult {
  won: boolean
  playerChoice: CoinSide
  actualResult: CoinSide
  betAmount: number
  winAmount: number
  gameNumber: number
}
