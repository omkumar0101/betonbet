// Your house wallet configuration (Ethereum address)
export const HOUSE_WALLET_ADDRESS = "0x357a4b5d67D0b9aC1E44246ae36825E9bE91Ccb5"

// Game configuration
export const MIN_BET_AMOUNT = 0.0004 // ETH (previously SOL)
export const MIN_TARGET_MULTIPLIER = 1.01 // Minimum multiplier player can target
export const MAX_TARGET_MULTIPLIER = 100.0 // Maximum multiplier player can target
export const MAX_GENERATED_MULTIPLIER = 1000.0 // Max possible multiplier the game can roll (for wins)
export const MIN_LOSING_MULTIPLIER = 0.01 // Min possible multiplier the game can roll (for losses, represents a crash)

export interface LimboGameResult {
  won: boolean
  betAmount: number
  winAmount: number
  targetMultiplier: number
  actualMultiplier: number
  gameNumber: number
}

/**
 * Generates a random multiplier for Limbo within a given range.
 * @param min The minimum value for the multiplier.
 * @param max The maximum value for the multiplier.
 * @returns A random multiplier.
 */
export function generateRandomMultiplier(min: number, max: number): number {
  // Ensure min is not greater than max
  if (min > max) {
    // If min is slightly greater due to precision, adjust max
    if (min - max < 0.0001) {
      // Small epsilon for floating point comparison
      return min // Return min if they are very close
    }
    // Otherwise, swap them to ensure Math.random works correctly
    ;[min, max] = [max, min]
  }
  return Number.parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

// REMOVED: getActualLimboMultiplier is no longer needed as the server will determine and send the actualMultiplier.
